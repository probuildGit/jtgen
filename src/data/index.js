// Data exports - Environment-specific loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Environment-specific data
const formData = isLocalDevelopment() 
  ? require('./formData.local.js').default 
  : require('./formData.web.js').default;

const historyData = isLocalDevelopment() 
  ? require('./historyData.local.js').default 
  : require('./historyData.web.js').default;

export { formData, historyData };