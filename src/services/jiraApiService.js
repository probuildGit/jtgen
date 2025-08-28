// Web version - using CORS proxy
import axios from 'axios';
import { JIRA_CONFIG } from '../constants/jiraConfig';
import { TEAM_MEMBERS } from '../data/formData';
import { HISTORY_CONFIG } from '../data/historyData';
import { buildDescriptionContent, createEmbeddedImageNode } from '../utils/adfBuilder';
import { extractErrorMessage, handleSpecificErrors, logError } from '../utils/errorHandler';

// CORS proxy for web deployment
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Helper function to encode URL for CORS proxy
const encodeUrl = (url) => encodeURIComponent(url);

// Helper function to create auth header
const getAuthHeader = () => {
  const credentials = btoa(`${process.env.REACT_APP_JIRA_EMAIL || JIRA_CONFIG.EMAIL}:${process.env.REACT_APP_JIRA_API_TOKEN || JIRA_CONFIG.AUTH_TOKEN}`);
  return `Basic ${credentials}`;
};

// Create axios instance with CORS proxy configuration
const jiraApi = axios.create({
  timeout: 30000, // 30 second timeout
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all responses to handle errors properly
  }
});







// Create Jira ticket with enhanced attachment handling
export const createJiraTicket = async (ticketData) => {
  try {
    // Build summary from platform, module, and summary fields
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

    // Step 1: Create the ticket first using CORS proxy
    const createUrl = 'https://probuild.atlassian.net/rest/api/3/issue';
    const response = await axios.post(`${CORS_PROXY}${encodeUrl(createUrl)}`, ticketPayload, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
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

// Upload attachments and return uploaded data
const uploadAttachmentsOnly = async (ticketKey, attachments) => {
  try {
    const processedFiles = new Set(); // Track processed files to prevent duplicates
    const uploadedAttachments = [];
    
    for (const file of attachments) {
      // Skip if we've already processed this file
      if (processedFiles.has(file.name)) {
        continue;
      }
      
      try {
        const attachmentData = await uploadAttachment(ticketKey, file);
        uploadedAttachments.push(attachmentData);
        processedFiles.add(file.name); // Mark as processed
        
        // Add a small delay between uploads to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (uploadError) {
        console.error('Failed to upload attachment:', file.name, uploadError);
        // Continue with other attachments even if one fails
      }
    }
    
    return uploadedAttachments;
    
  } catch (error) {
    console.error('Error uploading attachments:', error);
    throw error;
  }
};



// Add embedded images to ticket description
const addEmbeddedImagesToDescription = async (ticketKey, uploadedAttachments) => {
  try {
    // Get current ticket description
    const ticketResponse = await jiraApi.get(`/issue/${ticketKey}?expand=renderedFields`);
    
    // Check if response has the expected structure (proxy server wraps response in {success: true, data: ...})
    const responseData = ticketResponse.data.data || ticketResponse.data;
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
        { type: 'paragraph' }, // Empty paragraph for spacing
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
      // Create embedded image node
      const embeddedImageNode = createEmbeddedImageNode(attachmentData);
      newDescriptionContent.push(embeddedImageNode);
      
      // Add spacing after image
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
      throw error; // Throw the original error
    }
  }
};

// Fallback function to add clickable attachment links
const addAttachmentLinksToDescription = async (ticketKey, uploadedAttachments) => {
  try {
    // Get current ticket description
    const ticketResponse = await jiraApi.get(`/issue/${ticketKey}?expand=renderedFields`);
    
    // Check if response has the expected structure (proxy server wraps response in {success: true, data: ...})
    const responseData = ticketResponse.data.data || ticketResponse.data;
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
        { type: 'paragraph' }, // Empty paragraph for spacing
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
    
    // Update the ticket description using CORS proxy
    const updateUrl = `https://probuild.atlassian.net/rest/api/3/issue/${ticketKey}`;
    const updatePayload = {
      fields: {
        description: {
          type: 'doc',
          version: 1,
          content: newDescriptionContent
        }
      }
    };
    
    await axios.put(`${CORS_PROXY}${encodeUrl(updateUrl)}`, updatePayload, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error adding attachment links to description:', error);
    throw error;
  }
};



// Upload attachment to Jira using CORS proxy
export const uploadAttachment = async (issueKey, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = `https://probuild.atlassian.net/rest/api/3/issue/${issueKey}/attachments`;
    const response = await axios.post(`${CORS_PROXY}${encodeUrl(uploadUrl)}`, formData, {
      headers: {
        'Authorization': getAuthHeader(),
        'X-Atlassian-Token': 'no-check'
      }
    });

    // Return the uploaded attachment data
    return response.data[0]; // Direct API returns array of attachments
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};





// Test Jira API connectivity
export const testJiraConnectivity = async () => {
  try {
    const testUrl = `https://probuild.atlassian.net/rest/api/3/project/${JIRA_CONFIG.PROJECT_KEY}`;
    const response = await axios.get(`${CORS_PROXY}${encodeUrl(testUrl)}`, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return { success: true, message: 'Connected to Jira API' };
    } else {
      return { success: false, message: 'Failed to connect to Jira API' };
    }
  } catch (error) {
    console.warn('Jira connectivity test failed:', error);
    return { success: false, message: 'Network error - check connection' };
  }
};

export default jiraApi;
