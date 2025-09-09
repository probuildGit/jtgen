// Local Jira API Service - Uses proxy server for local development
import axios from 'axios';
import { CONFIG } from '../config/config.local.js';
import { LOCAL_ROUTES } from '../config/routes.local.js';
import { TEAM_MEMBERS } from '../data/formData';
import { HISTORY_CONFIG } from '../data/historyData';
import { buildDescriptionContent, createEmbeddedImageNode } from '../utils/adfBuilder';
import { extractErrorMessage, handleSpecificErrors, logError } from '../utils/errorHandler';

console.log('🏠 LOCAL SERVICE LOADED - Using proxy server at localhost:3001');

// Create axios instance for local proxy server
const jiraApi = axios.create({
  baseURL: LOCAL_ROUTES.BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

// Test Jira API connectivity for local environment
export const testJiraConnectivity = async () => {
  try {
    const response = await jiraApi.get(LOCAL_ROUTES.ENDPOINTS.TEST_CONNECTIVITY);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create Jira ticket with enhanced attachment handling
export const createJiraTicket = async (ticketData) => {
  try {
    console.log('🏠 LOCAL SERVICE: createJiraTicket called with data:', ticketData);
    console.log('🏠 LOCAL SERVICE: This is the LOCAL service being used!');
    
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

    // Step 1: Create the ticket first
    const response = await jiraApi.post(LOCAL_ROUTES.ENDPOINTS.CREATE_TICKET, ticketPayload);
    
    // Check if the response indicates success
    if (response.data && response.data.success && response.data.data && response.data.data.key) {
      const ticketKey = response.data.data.key;
      
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
        url: `https://probuild.atlassian.net/browse/${ticketKey}`
      };
      
      ticketHistory.unshift(newTicket);
      localStorage.setItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY, JSON.stringify(ticketHistory.slice(0, 50)));
      
      return {
        success: true,
        data: {
          key: ticketKey,
          summary: summary,
          url: `https://probuild.atlassian.net/browse/${ticketKey}`
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

// Upload attachments only (without embedding)
const uploadAttachmentsOnly = async (issueKey, attachments) => {
  console.log('📎 Starting attachment upload for ticket:', issueKey);
  console.log('📎 Number of attachments:', attachments.length);
  
  const uploadedAttachments = [];
  
  for (const file of attachments) {
    try {
      console.log('📎 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      const attachmentData = await uploadAttachment(issueKey, file);
      console.log('📎 Successfully uploaded attachment:', attachmentData);
      uploadedAttachments.push(attachmentData);
    } catch (error) {
      console.error(`Failed to upload attachment ${file.name}:`, error);
    }
  }
  
  console.log('📎 Total uploaded attachments:', uploadedAttachments.length);
  return uploadedAttachments;
};

// Add embedded images to description
const addEmbeddedImagesToDescription = async (issueKey, uploadedAttachments) => {
  try {
    console.log('🖼️ Adding embedded images to description for ticket:', issueKey);
    console.log('📎 Uploaded attachments:', uploadedAttachments);
    
    // Get current description
    const currentResponse = await jiraApi.get(LOCAL_ROUTES.ENDPOINTS.GET_ISSUE.replace(':issueKey', issueKey));
    
    // Check if response has the expected structure (proxy server wraps response in {success: true, data: {...}})
    const responseData = currentResponse.data.data || currentResponse.data;
    if (!responseData || !responseData.fields || !responseData.fields.description) {
      console.warn('Ticket response does not contain description field:', currentResponse.data);
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
      console.log('🖼️ Created embedded image node:', embeddedImageNode);
      newDescriptionContent.push(embeddedImageNode);
    }
    
    console.log('📝 New description content:', newDescriptionContent);
    
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
    
    console.log('🔄 Updating ticket description with payload:', updatePayload);
    await jiraApi.put(LOCAL_ROUTES.ENDPOINTS.UPDATE_ISSUE.replace(':issueKey', issueKey), updatePayload);
    console.log('✅ Successfully updated ticket description with embedded images');
    
  } catch (error) {
    console.error('Error adding embedded images to description:', error);
    throw error;
  }
};

// Upload attachment to Jira
export const uploadAttachment = async (issueKey, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      LOCAL_ROUTES.getUploadAttachmentUrl(issueKey),
      formData,
      {
        headers: {
          'Accept': 'application/json',
          'X-Atlassian-Token': 'no-check'
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

const localService = {
  testJiraConnectivity,
  createJiraTicket,
  uploadAttachment
};

export default localService;
