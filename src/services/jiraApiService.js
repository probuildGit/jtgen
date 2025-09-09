// Static Jira API Service - Works directly from browser
// This version bypasses the proxy server and calls Jira API directly

import axios from 'axios';
import { buildDescriptionContent, createEmbeddedImageNode } from '../utils/adfBuilder';
import { extractErrorMessage, handleSpecificErrors, logError } from '../utils/errorHandler';
import { TEAM_MEMBERS } from '../data/formData';
import { HISTORY_CONFIG } from '../data/historyData';

// Jira configuration (will be replaced with environment variables in production)
const JIRA_CONFIG = {
  BASE_URL: 'https://your-domain.atlassian.net',
  PROJECT_KEY: 'YOUR_PROJECT_KEY',
  PROJECT_NAME: 'Your Project Name',
  AUTH_TOKEN: 'YOUR_AUTH_TOKEN_HERE',
  EMAIL: 'your-email@domain.com'
};

// Create axios instance for direct Jira API calls
const jiraApi = axios.create({
  baseURL: 'https://probuild.atlassian.net/rest/api/3',
  auth: {
    username: JIRA_CONFIG.EMAIL,
    password: JIRA_CONFIG.AUTH_TOKEN
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

// Create Jira ticket with direct API calls
export const createJiraTicket = async (ticketData) => {
  try {
    const summary = `${ticketData.platform} - ${ticketData.module} - ${ticketData.summary}`;
    
    // Build description content using the ADF builder utility
    const descriptionContent = buildDescriptionContent(ticketData);

    // Create the payload with proper structure
    const ticketPayload = {
      fields: {
        project: {
          key: JIRA_CONFIG.PROJECT_KEY
        },
        summary: summary,
        description: {
          type: 'doc',
          version: 1,
          content: descriptionContent
        },
        issuetype: {
          id: '10013' // Bug
        },
        priority: {
          id: ticketData.priority
        },
        assignee: {
          accountId: TEAM_MEMBERS.ASSIGNEE.accountId
        },
        components: ticketData.component ? [{
          id: ticketData.component
        }] : []
      }
    };

    // Add Epic Link only if provided
    if (ticketData.epicLink && ticketData.epicLink.trim() !== '') {
      ticketPayload.fields.customfield_10014 = ticketData.epicLink;
    }

    // Step 1: Create the ticket first
    const response = await jiraApi.post('/issue', ticketPayload);
    
    // Check if the response indicates success
    if (response.data && response.data.key) {
      const ticketKey = response.data.key;
      
      // Step 2: Upload attachments and add links to description
      if (ticketData.attachments && ticketData.attachments.length > 0) {
        try {
          const uploadedAttachments = await uploadAttachmentsOnly(ticketKey, ticketData.attachments);
          
          // Add embedded images to description body
          if (uploadedAttachments.length > 0) {
            try {
              await addEmbeddedImagesToDescription(ticketKey, uploadedAttachments);
            } catch (embedError) {
              console.error('Failed to add embedded images:', embedError);
              // Continue with ticket creation even if embedding fails
            }
          }
        } catch (attachmentError) {
          console.warn('Attachment handling failed, but ticket was created:', attachmentError);
          // Continue with ticket creation even if attachment handling fails
        }
      }
      
      // Save ticket to history
      const ticketHistory = JSON.parse(localStorage.getItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY) || '[]');
      const newTicket = {
        key: ticketKey,
        summary: summary,
        created: new Date().toISOString(),
        status: 'To Do',
        lastStatusCheck: new Date().toISOString()
      };
      ticketHistory.unshift(newTicket);
      localStorage.setItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY, JSON.stringify(ticketHistory));
      
      return response.data;
    } else {
      throw new Error('Ticket creation failed: No ticket key returned');
    }
  } catch (error) {
    logError('Creating Jira ticket', error, { ticketData });
    
    // Extract and handle error message
    let errorMessage = extractErrorMessage(error);
    errorMessage = handleSpecificErrors(errorMessage, ticketData);
    
    throw new Error(`Failed to create Jira ticket: ${errorMessage}`);
  }
};

// Upload attachments directly to Jira
const uploadAttachmentsOnly = async (ticketKey, attachments) => {
  try {
    const processedFiles = new Set();
    const uploadedAttachments = [];
    
    for (const file of attachments) {
      if (processedFiles.has(file.name)) {
        continue;
      }
      
      try {
        const attachmentData = await uploadAttachment(ticketKey, file);
        uploadedAttachments.push(attachmentData);
        processedFiles.add(file.name);
        
        // Add a small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (uploadError) {
        console.error('Failed to upload attachment:', file.name, uploadError);
      }
    }
    
    return uploadedAttachments;
    
  } catch (error) {
    console.error('Error uploading attachments:', error);
    throw error;
  }
};

// Upload attachment directly to Jira
export const uploadAttachment = async (issueKey, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `https://probuild.atlassian.net/rest/api/3/issue/${issueKey}/attachments`,
      formData,
      {
        auth: {
          username: JIRA_CONFIG.EMAIL,
          password: JIRA_CONFIG.AUTH_TOKEN
        },
        headers: {
          'Accept': 'application/json',
          'X-Atlassian-Token': 'no-check'
        }
      }
    );

    return response.data[0]; // Jira returns an array, we want the first attachment
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

// Add embedded images to ticket description
const addEmbeddedImagesToDescription = async (ticketKey, uploadedAttachments) => {
  try {
    // Get current ticket description
    const ticketResponse = await jiraApi.get(`/issue/${ticketKey}?expand=renderedFields`);
    
    const responseData = ticketResponse.data;
    if (!responseData || !responseData.fields || !responseData.fields.description) {
      console.warn('Ticket response does not contain description field:', ticketResponse.data);
      throw new Error('No description field found in ticket response');
    }
    
    const currentDescription = responseData.fields.description;
    
    // Create new description content with embedded images
    const newDescriptionContent = [...currentDescription.content];
    
    // Add attachments section if it doesn't exist
    let hasAttachmentsSection = false;
    for (const node of newDescriptionContent) {
      if (node.type === 'paragraph' && 
          node.content && 
          node.content[0] && 
          node.content[0].text === 'Attachments:') {
        hasAttachmentsSection = true;
        break;
      }
    }
    
    if (!hasAttachmentsSection) {
      // Add attachments section header
      newDescriptionContent.push(
        { type: 'paragraph' },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Attachments:',
              marks: [{ type: 'strong' }]
            }
          ]
        }
      );
    }
    
    // Add embedded images for each attachment
    for (const attachmentData of uploadedAttachments) {
      const embeddedImageNode = createEmbeddedImageNode(attachmentData);
      newDescriptionContent.push(embeddedImageNode);
      newDescriptionContent.push({ type: 'paragraph' });
    }
    
    // Update the ticket description
    const updatePayload = {
      fields: {
        description: {
          type: 'doc',
          version: 1,
          content: newDescriptionContent
        }
      }
    };
    
    await jiraApi.put(`/issue/${ticketKey}`, updatePayload);
    
  } catch (error) {
    console.error('Error adding embedded images to description:', error);
    
    // Fallback: Try to add clickable links instead
    try {
      await addAttachmentLinksToDescription(ticketKey, uploadedAttachments);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw error;
    }
  }
};

// Fallback function to add clickable attachment links
const addAttachmentLinksToDescription = async (ticketKey, uploadedAttachments) => {
  try {
    // Get current ticket description
    const ticketResponse = await jiraApi.get(`/issue/${ticketKey}?expand=renderedFields`);
    
    const responseData = ticketResponse.data;
    if (!responseData || !responseData.fields || !responseData.fields.description) {
      console.warn('Ticket response does not contain description field:', ticketResponse.data);
      throw new Error('No description field found in ticket response');
    }
    
    const currentDescription = responseData.fields.description;
    
    // Create new description content with attachment links
    const newDescriptionContent = [...currentDescription.content];
    
    // Add attachments section if it doesn't exist
    let hasAttachmentsSection = false;
    for (const node of newDescriptionContent) {
      if (node.type === 'paragraph' && 
          node.content && 
          node.content[0] && 
          node.content[0].text === 'Attachments:') {
        hasAttachmentsSection = true;
        break;
      }
    }
    
    if (!hasAttachmentsSection) {
      // Add attachments section header
      newDescriptionContent.push(
        { type: 'paragraph' },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Attachments:',
              marks: [{ type: 'strong' }]
            }
          ]
        }
      );
    }
    
    // Add links for each attachment
    for (const attachmentData of uploadedAttachments) {
      const attachmentUrl = `https://probuild.atlassian.net/secure/attachment/${attachmentData.id}/${attachmentData.filename}`;
      
      newDescriptionContent.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: attachmentData.filename,
            marks: [
              {
                type: 'link',
                attrs: {
                  href: attachmentUrl
                }
              }
            ]
          }
        ]
      });
    }
    
    // Update the ticket description
    const updatePayload = {
      fields: {
        description: {
          type: 'doc',
          version: 1,
          content: newDescriptionContent
        }
      }
    };
    
    await jiraApi.put(`/issue/${ticketKey}`, updatePayload);
    
  } catch (error) {
    console.error('Error adding attachment links to description:', error);
    throw error;
  }
};

// Test Jira API connectivity
export const testJiraConnectivity = async () => {
  try {
    const response = await jiraApi.get('/project/PB');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default jiraApi;
