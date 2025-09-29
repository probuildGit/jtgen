// Environment-specific Jira Status Service loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';
import localStatusService from './jiraStatusService.local.js';
import webStatusService from './jiraStatusService.web.js';

// Log environment detection
const environment = isLocalDevelopment() ? 'LOCAL' : 'WEB';
const statusService = isLocalDevelopment() ? localStatusService : webStatusService;

console.log('🔍 JIRA STATUS SERVICE SELECTION:', {
  environment,
  service: isLocalDevelopment() ? 'LOCAL STATUS SERVICE' : 'WEB STATUS SERVICE',
  timestamp: new Date().toISOString(),
  hostname: window.location.hostname,
  port: window.location.port,
  href: window.location.href,
  protocol: window.location.protocol
});

// Export functions that delegate to the appropriate service
export const fetchTicketStatus = statusService.fetchTicketStatus;
export const fetchMultipleTicketStatuses = statusService.fetchMultipleTicketStatuses;

export default statusService;