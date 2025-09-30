// Hooks exports - Environment-specific loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Static hooks (same for both environments)
export { default as useFileUpload } from './useFileUpload';

// Environment-specific hooks
export { default as useJiraTicket } from isLocalDevelopment() ? './useJiraTicket.local.js' : './useJiraTicket.web.js';
