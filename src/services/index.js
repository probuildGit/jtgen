// Services exports - Environment-specific loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Static services (same for both environments)
export { default as jamService } from './jamService';

// Environment-specific services
const jiraApiService = isLocalDevelopment() 
  ? require('./jiraApiService.local.js').default 
  : require('./jiraApiService.web.js').default;

const jiraStatusService = isLocalDevelopment() 
  ? require('./jiraStatusService.local.js').default 
  : require('./jiraStatusService.web.js').default;

export { jiraApiService, jiraStatusService };