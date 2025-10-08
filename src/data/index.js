// Data exports - Environment-specific loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Import both local and web data
import * as localFormData from './formData.local.js';
import * as webFormData from './formData.web.js';
import * as localHistoryData from './historyData.local.js';
import * as webHistoryData from './historyData.web.js';

// Environment-specific data selection
const formData = isLocalDevelopment() ? localFormData : webFormData;
const historyData = isLocalDevelopment() ? localHistoryData : webHistoryData;

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