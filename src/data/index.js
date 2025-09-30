// Data exports - Environment-specific loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Environment-specific data
const formData = isLocalDevelopment() 
  ? require('./formData.local.js') 
  : require('./formData.web.js');

const historyData = isLocalDevelopment() 
  ? require('./historyData.local.js') 
  : require('./historyData.web.js');

// Export individual constants from formData
export const {
  PLATFORM_OPTIONS,
  PRIORITY_OPTIONS,
  COMPONENTS,
  EPICS,
  MODULE_OPTIONS,
  ALERT_MESSAGES,
  BUTTON_LABELS
} = formData;

// Export the full objects
export { formData, historyData };