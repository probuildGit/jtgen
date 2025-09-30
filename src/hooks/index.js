// Hooks exports - Environment-specific loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Static hooks (same for both environments)
export { default as useFileUpload } from './useFileUpload';

// Environment-specific hooks
const useJiraTicket = isLocalDevelopment() 
  ? require('./useJiraTicket.local.js').default 
  : require('./useJiraTicket.web.js').default;

export { useJiraTicket };