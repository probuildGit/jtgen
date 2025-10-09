// Web Jira API Service - Uses CORS proxy for web deployment
import axios from 'axios';
import { CONFIG, WEB_API_ENDPOINTS } from '../config/config.web.js';
import { TEAM_MEMBERS } from '../data/formData.web.js';
import { HISTORY_CONFIG } from '../data/historyData.web.js';
import { buildDescriptionContent, createEmbeddedImageNode } from '../utils/adfBuilder';
import { extractErrorMessage, handleSpecificErrors, logError } from '../utils/errorHandler';

console.log('🌐 WEB SERVICE LOADED - Using CORS proxy');
console.log('🌐 WEB CONFIG:', CONFIG.WEB.ENVIRONMENT);

// Helper function to get auth header
const getAuthHeader = () => {
  // Check for user-provided credentials first
  const userConfig = localStorage.getItem('jiraApiConfig');
  const manualToken = localStorage.getItem('jiraToken');
  let email = CONFIG.JIRA.EMAIL;
  let token = CONFIG.JIRA.AUTH_TOKEN;
  
  // Priority: Manual token > User config > Default config
  if (manualToken) {
    token = manualToken;
    console.log('🌐 WEB SERVICE: Using manual JIRA token');
  } else if (userConfig) {
    try {
      const parsed = JSON.parse(userConfig);
      if (parsed.useCustomCredentials && parsed.email && parsed.jiraToken) {
        email = parsed.email;
        token = parsed.jiraToken;
        console.log('🌐 WEB SERVICE: Using user-provided credentials');
      }
    } catch (error) {
      console.error('Error parsing user config:', error);
    }
  }
  
  const credentials = btoa(`${email}:${token}`);
  return `Basic ${credentials}`;
};

// Create axios instance for web deployment with local proxy server
const jiraApi = axios.create({
  baseURL: CONFIG.SERVER.BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': getAuthHeader()
  },
  timeout: CONFIG.CORS.TIMEOUT,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

// Test Jira API connectivity for web environment
export const testJiraConnectivity = async () => {
  try {
    // Check for user-provided credentials
    const userConfig = localStorage.getItem('jiraApiConfig');
    let isDemoMode = CONFIG.JIRA.DEMO_MODE;
    
    if (userConfig) {
      try {
        const parsed = JSON.parse(userConfig);
        isDemoMode = !parsed.useCustomCredentials;
      } catch (error) {
        console.error('Error parsing user config:', error);
      }
    }
    
    // Check if we're in demo mode
    if (isDemoMode) {
      console.log('🌐 WEB SERVICE: Demo mode enabled - simulating successful connectivity');
      return { 
        success: true, 
        data: { 
          id: 'PB',
          key: 'PB',
          name: 'ProBuild (Demo Mode)',
          projectTypeKey: 'software'
        },
        demo: true
      };
    }
    
    console.log('🌐 WEB SERVICE: Testing connectivity to:', WEB_API_ENDPOINTS.PROJECT);
    const response = await jiraApi.get(WEB_API_ENDPOINTS.PROJECT);
    console.log('🌐 WEB SERVICE: Connectivity test successful');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('🌐 WEB SERVICE: Connectivity test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Create Jira ticket for web environment
export const createJiraTicket = async (ticketData) => {
  try {
    console.log('🌐 WEB SERVICE: createJiraTicket called with data:', ticketData);
    
    // Check for user-provided credentials
    const userConfig = localStorage.getItem('jiraApiConfig');
    let isDemoMode = CONFIG.JIRA.DEMO_MODE;
    
    if (userConfig) {
      try {
        const parsed = JSON.parse(userConfig);
        isDemoMode = !parsed.useCustomCredentials;
      } catch (error) {
        console.error('Error parsing user config:', error);
      }
    }
    
    // Check if we're in demo mode
    if (isDemoMode) {
      console.log('🌐 WEB SERVICE: Demo mode enabled - simulating ticket creation');
      return {
        key: 'PB-DEMO-' + Math.floor(Math.random() * 1000),
        id: 'demo-' + Date.now(),
        demo: true
      };
    }
    
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
    const response = await jiraApi.post(WEB_API_ENDPOINTS.CREATE_TICKET, ticketPayload);
    
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
      WEB_API_ENDPOINTS.UPLOAD_ATTACHMENT(issueKey),
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
    const currentResponse = await jiraApi.get(WEB_API_ENDPOINTS.GET_ISSUE(issueKey));
    
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
    await jiraApi.put(WEB_API_ENDPOINTS.UPDATE_ISSUE(issueKey), updatePayload);
    console.log('✅ WEB: Successfully updated ticket description with embedded images');
    
  } catch (error) {
    console.error('WEB: Error adding embedded images to description:', error);
    throw error;
  }
};

// Fetch Jira ticket history for web environment
export const fetchJiraTicketHistory = async () => {
  try {
    console.log('🌐 WEB SERVICE: fetchJiraTicketHistory called');
    
    // Get history from localStorage
    const historyData = localStorage.getItem('jiraTicketHistory');
    if (historyData) {
      const parsedHistory = JSON.parse(historyData);
      console.log('🌐 WEB SERVICE: Found ticket history:', parsedHistory);
      return parsedHistory;
    } else {
      console.log('🌐 WEB SERVICE: No ticket history found in localStorage');
      return [];
    }
  } catch (error) {
    console.error('🌐 WEB SERVICE: Error fetching Jira ticket history:', error);
    throw new Error('Failed to fetch Jira ticket history.');
  }
};

const webServiceDefault = {
  testJiraConnectivity,
  createJiraTicket,
  uploadAttachment,
  fetchJiraTicketHistory
};

export default webServiceDefault;
