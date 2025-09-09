// Web Jira API Service - Uses CORS proxy for web deployment
import axios from 'axios';
import { CONFIG } from '../config/config.web.js';
import { WEB_ROUTES } from '../config/routes.web.js';
import { TEAM_MEMBERS } from '../data/formData';
import { HISTORY_CONFIG } from '../data/historyData';
import { buildDescriptionContent, createEmbeddedImageNode } from '../utils/adfBuilder';
import { extractErrorMessage, handleSpecificErrors, logError } from '../utils/errorHandler';

console.log('🌐 WEB SERVICE LOADED - Using CORS proxy');

// Helper function to get auth header
const getAuthHeader = () => {
  const credentials = btoa(`${CONFIG.JIRA.EMAIL}:${CONFIG.JIRA.AUTH_TOKEN}`);
  return `Basic ${credentials}`;
};

// Create axios instance for web deployment with CORS proxy
const jiraApi = axios.create({
  baseURL: WEB_ROUTES.CORS_PROXY + WEB_ROUTES.encodeUrl(WEB_ROUTES.JIRA_BASE_URL),
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': getAuthHeader()
  },
  timeout: 30000,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

// Test Jira API connectivity for web environment
export const testJiraConnectivity = async () => {
  try {
    const response = await jiraApi.get(WEB_ROUTES.ENDPOINTS.PROJECT.replace(':projectKey', CONFIG.JIRA.PROJECT_KEY));
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create Jira ticket for web environment
export const createJiraTicket = async (ticketData) => {
  try {
    console.log('🌐 WEB SERVICE: createJiraTicket called with data:', ticketData);
    console.log('🌐 WEB SERVICE: This is the WEB service being used!');
    console.log('🚨 ERROR: Web service should NOT be called in local environment!');
    
    // Build summary with platform, module, and summary fields
    const summary = `${ticketData.platform} - ${ticketData.module} - ${ticketData.summary}`;
    
    // Build description content using the ADF builder utility
    const descriptionContent = buildDescriptionContent(ticketData);

    // Create the payload with proper structure
    const ticketPayload = {
      fields: {
        project: {
          key: CONFIG.JIRA.PROJECT_KEY
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

    // Create the ticket
    const response = await jiraApi.post(WEB_ROUTES.ENDPOINTS.CREATE_TICKET, ticketPayload);
    
    if (response.data && response.data.key) {
      const ticketKey = response.data.key;
      
      // Handle attachments if any
      if (ticketData.attachments && ticketData.attachments.length > 0) {
        try {
          const uploadedAttachments = await uploadAttachmentsWeb(ticketKey, ticketData.attachments);
          
          // Add embedded images to description body
          if (uploadedAttachments.length > 0) {
            try {
              await addEmbeddedImagesToDescriptionWeb(ticketKey, uploadedAttachments);
            } catch (embedError) {
              console.error('Failed to add embedded images:', embedError);
            }
          }
        } catch (attachmentError) {
          console.warn('Attachment handling failed, but ticket was created:', attachmentError);
        }
      }
      
      // Save ticket to history
      const ticketHistory = JSON.parse(localStorage.getItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY) || '[]');
      const newTicket = {
        key: ticketKey,
        summary: summary,
        created: new Date().toISOString(),
        status: 'Created',
        url: `${CONFIG.JIRA.BASE_URL}/browse/${ticketKey}`
      };
      
      ticketHistory.unshift(newTicket);
      localStorage.setItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY, JSON.stringify(ticketHistory.slice(0, 50)));
      
      return {
        success: true,
        data: {
          key: ticketKey,
          summary: summary,
          url: `${CONFIG.JIRA.BASE_URL}/browse/${ticketKey}`
        }
      };
    } else {
      throw new Error('Failed to create ticket: Invalid response format');
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    const specificError = handleSpecificErrors(errorMessage, ticketData);
    logError('Creating Jira ticket error:', error, { ticketData });
    throw new Error(`Failed to create Jira ticket: ${specificError}`);
  }
};

// Upload attachments for web environment
const uploadAttachmentsWeb = async (issueKey, attachments) => {
  const uploadedAttachments = [];
  
  for (const file of attachments) {
    try {
      const attachmentData = await uploadAttachment(issueKey, file);
      uploadedAttachments.push(attachmentData);
    } catch (error) {
      console.error(`Failed to upload attachment ${file.name}:`, error);
    }
  }
  
  return uploadedAttachments;
};

// Upload attachment to Jira for web environment
export const uploadAttachment = async (issueKey, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      WEB_ROUTES.getUploadAttachmentUrl(issueKey),
      formData,
      {
        headers: {
          'Accept': 'application/json',
          'X-Atlassian-Token': 'no-check',
          'Authorization': getAuthHeader()
        }
      }
    );

    return response.data[0]; // CORS proxy returns array
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

// Add embedded images to description (Web service)
const addEmbeddedImagesToDescriptionWeb = async (issueKey, uploadedAttachments) => {
  try {
    console.log('🖼️ WEB: Adding embedded images to description for ticket:', issueKey);
    console.log('📎 WEB: Uploaded attachments:', uploadedAttachments);
    
    // Get current description
    const currentResponse = await jiraApi.get(WEB_ROUTES.ENDPOINTS.GET_ISSUE.replace(':issueKey', issueKey));
    
    // Check if response has the expected structure
    const responseData = currentResponse.data;
    if (!responseData || !responseData.fields || !responseData.fields.description) {
      console.warn('WEB: Ticket response does not contain description field:', currentResponse.data);
      throw new Error('No description field found in ticket response');
    }
    
    const currentDescription = responseData.fields.description;
    
    // Build new description content with embedded images
    const newDescriptionContent = currentDescription ? [...currentDescription.content] : [];
    
    // Add embedded images section
    if (uploadedAttachments.length > 0) {
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
      console.log('🖼️ WEB: Created embedded image node:', embeddedImageNode);
      newDescriptionContent.push(embeddedImageNode);
    }
    
    console.log('📝 WEB: New description content:', newDescriptionContent);
    
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
    
    console.log('🔄 WEB: Updating ticket description with payload:', updatePayload);
    await jiraApi.put(WEB_ROUTES.ENDPOINTS.UPDATE_ISSUE.replace(':issueKey', issueKey), updatePayload);
    console.log('✅ WEB: Successfully updated ticket description with embedded images');
    
  } catch (error) {
    console.error('WEB: Error adding embedded images to description:', error);
    throw error;
  }
};

const webServiceDefault = {
  testJiraConnectivity,
  createJiraTicket,
  uploadAttachment
};

export default webServiceDefault;
