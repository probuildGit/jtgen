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

// Test Jira connectivity
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

// Create Jira ticket with CORS proxy
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

// Upload attachments and return uploaded data (simplified for web version)
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

// Upload single attachment using CORS proxy
const uploadAttachment = async (ticketKey, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadUrl = `https://probuild.atlassian.net/rest/api/3/issue/${ticketKey}/attachments`;
    const response = await axios.post(`${CORS_PROXY}${encodeUrl(uploadUrl)}`, formData, {
      headers: {
        'Authorization': getAuthHeader(),
        'X-Atlassian-Token': 'no-check'
      }
    });
    
    return response.data[0]; // Return the first attachment data
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

// Add embedded images to description
const addEmbeddedImagesToDescription = async (ticketKey, attachments) => {
  try {
    const imageAttachments = attachments.filter(att => 
      att.mimeType && att.mimeType.startsWith('image/')
    );
    
    if (imageAttachments.length === 0) return;
    
    // Get current ticket description
    const ticketUrl = `https://probuild.atlassian.net/rest/api/3/issue/${ticketKey}`;
    const ticketResponse = await axios.get(`${CORS_PROXY}${encodeUrl(ticketUrl)}`, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json'
      }
    });
    
    const currentDescription = ticketResponse.data.fields.description;
    const updatedContent = [...currentDescription.content];
    
    // Add embedded images
    for (const attachment of imageAttachments) {
      const imageNode = createEmbeddedImageNode(attachment);
      updatedContent.push(imageNode);
    }
    
    // Update ticket description
    const updateUrl = `https://probuild.atlassian.net/rest/api/3/issue/${ticketKey}`;
    await axios.put(`${CORS_PROXY}${encodeUrl(updateUrl)}`, {
      fields: {
        description: {
          type: 'doc',
          version: 1,
          content: updatedContent
        }
      }
    }, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error adding embedded images:', error);
    throw error;
  }
};
