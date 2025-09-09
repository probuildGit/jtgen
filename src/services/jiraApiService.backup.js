// Smart Jira API Service Loader
// Automatically loads the appropriate service based on environment

import localService from './jiraApiService.local.js';
import webService from './jiraApiService.web.js';
import { isLocalDevelopment, logEnvironmentInfo } from '../utils/environmentDetection.js';
import { verifyEnvironmentSeparation } from '../utils/verifyEnvironmentSeparation.js';

// Log environment detection information
logEnvironmentInfo();

// Verify environment separation
verifyEnvironmentSeparation();

// Select appropriate service based on environment
const jiraApiService = isLocalDevelopment() ? localService : webService;

console.log('🎯 SELECTED SERVICE:', isLocalDevelopment() ? 'LOCAL SERVICE' : 'WEB SERVICE');
console.log('⏰ Service loaded at:', new Date().toISOString());
console.log('🔧 Service object:', jiraApiService);

// Export functions that delegate to the appropriate service
export const testJiraConnectivity = async () => {
  console.log('🔌 Testing connectivity with:', isLocalDevelopment() ? 'LOCAL SERVICE' : 'WEB SERVICE');
  return await jiraApiService.testJiraConnectivity();
};

export const createJiraTicket = async (ticketData) => {
  console.log('🎫 Creating ticket with:', isLocalDevelopment() ? 'LOCAL SERVICE' : 'WEB SERVICE');
  return await jiraApiService.createJiraTicket(ticketData);
};

export const uploadAttachment = async (issueKey, file) => {
  console.log('📎 Uploading attachment with:', isLocalDevelopment() ? 'LOCAL SERVICE' : 'WEB SERVICE');
  return await jiraApiService.uploadAttachment(issueKey, file);
};

// Export default for backward compatibility
const jiraApiServiceDefault = {
  testJiraConnectivity,
  createJiraTicket,
  uploadAttachment
};

export default jiraApiServiceDefault;