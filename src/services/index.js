// Services exports - Environment-specific loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Static services (same for both environments)
export { default as jamService } from './jamService';

// Environment-specific services
export { default as jiraApiService } from isLocalDevelopment() ? './jiraApiService.local.js' : './jiraApiService.web.js';
export { default as jiraStatusService } from isLocalDevelopment() ? './jiraStatusService.local.js' : './jiraStatusService.web.js';
