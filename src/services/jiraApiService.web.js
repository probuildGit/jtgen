// Web Jira API Service - Uses the JTGenWeb proxy (port 3004), same contract as the working local app.
import axios from 'axios';
import { CONFIG } from '../config/config.web.js';
import { WEB_ROUTES } from '../config/routes.web.js';
import { TEAM_MEMBERS } from '../data/formData.web.js';
import { HISTORY_CONFIG } from '../data/historyData.web.js';
import {
  buildDescriptionContent,
  buildJiraAttachmentUrl,
  createAttachmentDescriptionNodes,
  createVideoAttachmentLinkNodes,
  isVideoAttachment
} from '../utils/adfBuilder';
import { extractErrorMessage, handleSpecificErrors, logError } from '../utils/errorHandler';

console.log('🌐 WEB SERVICE LOADED - Using JTGenWeb proxy at localhost:3004');

// Create axios instance for the JTGenWeb proxy
const jiraApi = axios.create({
  baseURL: WEB_ROUTES.BASE_URL,
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
    const response = await jiraApi.get(WEB_ROUTES.ENDPOINTS.TEST_CONNECTIVITY);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create Jira ticket with enhanced attachment handling
export const createJiraTicket = async (ticketData) => {
  try {
    // Validate required fields before building summary
    if (!ticketData.platform || !ticketData.module || !ticketData.summary) {
      const missingFields = [];
      if (!ticketData.platform) missingFields.push('platform');
      if (!ticketData.module) missingFields.push('module');
      if (!ticketData.summary) missingFields.push('summary');
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Ensure values are trimmed and not empty
    const platform = (ticketData.platform || '').trim();
    const module = (ticketData.module || '').trim();
    const summaryText = (ticketData.summary || '').trim();
    
    if (!platform || !module || !summaryText) {
      throw new Error('Required fields cannot be empty after trimming');
    }
    
    // Build summary with platform, module, and summary fields
    const summary = `${platform} - ${module} - ${summaryText}`;
    
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
    const response = await jiraApi.post(WEB_ROUTES.ENDPOINTS.CREATE_TICKET, ticketPayload);
    
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
      const storageKey = HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY;
      const existingHistory = localStorage.getItem(storageKey);
      const ticketHistory = existingHistory ? JSON.parse(existingHistory) : [];
      
      console.log('🌐 SERVICE: Saving ticket to history, current history length:', ticketHistory.length);
      
      const newTicket = {
        key: ticketKey,
        summary: summary,
        created: new Date().toISOString(),
        status: 'Created',
        url: `https://probuild.atlassian.net/browse/${ticketKey}`
      };
      
      console.log('🌐 SERVICE: New ticket to save:', newTicket);
      
      ticketHistory.unshift(newTicket);
      const updatedHistory = ticketHistory.slice(0, 50); // Keep only last 50 tickets
      
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      console.log('🌐 SERVICE: Saved ticket to history, new history length:', updatedHistory.length);
      console.log('🌐 SERVICE: Storage key used:', storageKey);
      
      return {
        success: true,
        data: {
          key: ticketKey,
          summary: summary,
          url: `https://probuild.atlassian.net/browse/${ticketKey}`
        }
      };
    } else {
      const details = response.data?.details || response.data?.error || response.data;
      const detailText = typeof details === 'string' ? details : JSON.stringify(details);
      throw new Error(detailText || 'Failed to create ticket: Invalid response format');
    }
  } catch (error) {
    const isNetworkError = error.code === 'ERR_NETWORK' || error.message === 'Network Error';
    if (isNetworkError) {
      logError('Creating Jira ticket error (proxy unreachable):', error, { ticketData });
      throw new Error(
        'Cannot reach the JTGenWeb proxy. Start it with npm start (proxy on port 3004) or run node server.js in the JTGenWeb folder.'
      );
    }
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

const waitForJiraMediaProcessing = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

const createAttachmentsHeaderNodes = () => [
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
];

const getIssueDescriptionContent = async (issueKey) => {
  const currentResponse = await jiraApi.get(WEB_ROUTES.ENDPOINTS.GET_ISSUE.replace(':issueKey', issueKey));
  const responseData = currentResponse.data.data || currentResponse.data;
  if (!responseData || !responseData.fields || !responseData.fields.description) {
    console.warn('Ticket response does not contain description field:', currentResponse.data);
    throw new Error('No description field found in ticket response');
  }
  return responseData.fields.description?.content || [];
};

const updateIssueDescriptionContent = async (issueKey, content) => {
  const updatePayload = {
    fields: {
      description: {
        type: 'doc',
        version: 1,
        content
      }
    }
  };
  const response = await jiraApi.put(WEB_ROUTES.ENDPOINTS.UPDATE_ISSUE.replace(':issueKey', issueKey), updatePayload);
  if (!response.data?.success) {
    const details = response.data?.details || response.data?.error || response.statusText || 'Unknown Jira update failure';
    throw new Error(`Jira description update failed: ${JSON.stringify(details)}`);
  }
  return response.data;
};

const createEmbeddedVideoNodes = (attachmentData) => {
  const url = buildJiraAttachmentUrl(attachmentData) || attachmentData?.content;
  if (!url) {
    return createVideoAttachmentLinkNodes(attachmentData);
  }

  return [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Screen recording:',
          marks: [{ type: 'strong' }]
        }
      ]
    },
    {
      type: 'mediaSingle',
      attrs: {
        layout: 'center'
      },
      content: [
        {
          type: 'media',
          attrs: {
            type: 'external',
            url
          }
        }
      ]
    }
  ];
};

// Add embedded attachments to description. Video media is attempted separately so it cannot break image embeds.
const addEmbeddedImagesToDescription = async (issueKey, uploadedAttachments) => {
  console.log('🖼️ Adding embedded attachments to description for ticket:', issueKey);
  console.log('📎 Uploaded attachments:', uploadedAttachments);

  const nonVideoAttachments = uploadedAttachments.filter((attachment) => !isVideoAttachment(attachment));
  const videoAttachments = uploadedAttachments.filter((attachment) => isVideoAttachment(attachment));

  let descriptionContent = await getIssueDescriptionContent(issueKey);
  const safeNodes = [];

  for (const attachmentData of nonVideoAttachments) {
    const attachmentNodes = createAttachmentDescriptionNodes(attachmentData);
    console.log('🖼️ Created image attachment description nodes:', attachmentNodes);
    safeNodes.push(...attachmentNodes, { type: 'paragraph' });
  }

  if (safeNodes.length > 0 || videoAttachments.length > 0) {
    descriptionContent = [
      ...descriptionContent,
      ...createAttachmentsHeaderNodes(),
      ...safeNodes
    ];
    await updateIssueDescriptionContent(issueKey, descriptionContent);
    console.log('✅ Successfully updated ticket description with non-video attachments');
  }

  if (videoAttachments.length > 0) {
    await waitForJiraMediaProcessing();
  }

  for (const attachmentData of videoAttachments) {
    const videoNodes = createEmbeddedVideoNodes(attachmentData);
    try {
      const nextContent = [
        ...descriptionContent,
        ...videoNodes,
        { type: 'paragraph' }
      ];
      console.log('🎥 Adding embedded video attachment nodes:', videoNodes);
      await updateIssueDescriptionContent(issueKey, nextContent);
      descriptionContent = nextContent;
      console.log('✅ Successfully updated ticket description with video media');
    } catch (videoError) {
      console.warn('Video media embed failed, falling back to attachment link:', videoError);
      const fallbackNodes = createVideoAttachmentLinkNodes(attachmentData);
      const nextContent = [
        ...descriptionContent,
        ...fallbackNodes,
        { type: 'paragraph' }
      ];
      await updateIssueDescriptionContent(issueKey, nextContent);
      descriptionContent = nextContent;
    }
  }
};

// Upload attachment to Jira
const uploadAttachmentFile = async (issueKey, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    WEB_ROUTES.getUploadAttachmentUrl(issueKey),
    formData,
    {
      headers: {
        'Accept': 'application/json',
        'X-Atlassian-Token': 'no-check'
      }
    }
  );

  return response.data.data;
};

export const uploadAttachment = async (issueKey, file) => {
  try {
    return await uploadAttachmentFile(issueKey, file);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

// Fetch Jira ticket history from localStorage
export const fetchJiraTicketHistory = async () => {
  try {
    const historyKey = 'jiraTicketHistory';
    const historyData = localStorage.getItem(historyKey);
    
    if (!historyData) {
      return {
        success: true,
        data: []
      };
    }
    
    try {
      const parsedHistory = JSON.parse(historyData);
      return {
        success: true,
        data: Array.isArray(parsedHistory) ? parsedHistory : []
      };
    } catch (parseError) {
      console.warn('Failed to parse history data, clearing corrupted data');
      localStorage.removeItem(historyKey);
      return {
        success: true,
        data: []
      };
    }
  } catch (error) {
    console.error('Error fetching ticket history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Clear corrupted history data
export const clearCorruptedHistory = async () => {
  try {
    const historyKey = 'jiraTicketHistory';
    localStorage.removeItem(historyKey);
    return { success: true };
  } catch (error) {
    console.error('Error clearing history:', error);
    return { success: false, error: error.message };
  }
};

const localService = {
  testJiraConnectivity,
  createJiraTicket,
  uploadAttachment,
  fetchJiraTicketHistory,
  clearCorruptedHistory
};

export default localService;
