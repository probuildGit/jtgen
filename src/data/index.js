// Data exports - Environment-specific loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Environment-specific data
export { default as formData } from isLocalDevelopment() ? './formData.local.js' : './formData.web.js';
export { default as historyData } from isLocalDevelopment() ? './historyData.local.js' : './historyData.web.js';
