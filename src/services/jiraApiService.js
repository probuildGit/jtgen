// Environment-specific Jira API Service loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';
import localJiraApiService from './jiraApiService.local.js';
import webJiraApiService from './jiraApiService.web.js';

// Log environment detection
const environment = isLocalDevelopment() ? 'LOCAL' : 'WEB';
const jiraApiService = isLocalDevelopment() ? localJiraApiService : webJiraApiService;

console.log('🔍 JIRA API SERVICE SELECTION:', {
  environment,
  service: isLocalDevelopment() ? 'LOCAL JIRA API SERVICE' : 'WEB JIRA API SERVICE',
  timestamp: new Date().toISOString(),
  hostname: window.location.hostname,
  port: window.location.port,
  href: window.location.href,
  protocol: window.location.protocol
});

// Export functions that delegate to the appropriate service
export const testJiraConnectivity = jiraApiService.testJiraConnectivity;
export const createJiraTicket = jiraApiService.createJiraTicket;
export const uploadAttachment = jiraApiService.uploadAttachment;
export const fetchJiraTicketHistory = jiraApiService.fetchJiraTicketHistory;

export default jiraApiService;
