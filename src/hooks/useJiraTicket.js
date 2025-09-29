// Environment-specific useJiraTicket loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';
import LocalUseJiraTicket from './useJiraTicket.local.js';
import WebUseJiraTicket from './useJiraTicket.web.js';

// Export the appropriate hook based on environment
const useJiraTicket = isLocalDevelopment() ? LocalUseJiraTicket : WebUseJiraTicket;

export { useJiraTicket };
