// Web Jira Status Service - For web deployment only
// This file is used for web deployment and uses CORS proxy

import webStatusService from './jiraStatusService.web.js';
import { logEnvironmentInfo } from '../utils/environmentDetection.js';

// Log environment detection information
logEnvironmentInfo();

// Always use web status service for web deployment
const statusService = webStatusService;

console.log('🎯 SELECTED STATUS SERVICE: WEB STATUS SERVICE');
console.log('⏰ Status service loaded at:', new Date().toISOString());

// Export functions that delegate to the appropriate service
export const fetchTicketStatus = async (ticketKey) => {
  console.log('🔍 Fetching ticket status with: WEB STATUS SERVICE');
  return await statusService.fetchTicketStatus(ticketKey);
};

export const fetchMultipleTicketStatuses = async (ticketKeys) => {
  console.log('🔍 Fetching multiple ticket statuses with: WEB STATUS SERVICE');
  return await statusService.fetchMultipleTicketStatuses(ticketKeys);
};

// Export default for backward compatibility
const statusServiceDefault = {
  fetchTicketStatus,
  fetchMultipleTicketStatuses
};

export default statusServiceDefault;