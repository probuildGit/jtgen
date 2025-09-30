// Form components exports - Environment-specific loader
import { isLocalDevelopment } from '../../utils/environmentDetection.js';

// Static components (same for both environments)
export { default as FormField } from './FormField';
export { default as FormSection } from './FormSection';
export { default as AttachmentList } from './AttachmentList';

// Environment-specific components
const ModuleField = isLocalDevelopment() 
  ? require('./ModuleField.local.js').default 
  : require('./ModuleField.web.js').default;

const ActionButtons = isLocalDevelopment() 
  ? require('./ActionButtons.local.js').default 
  : require('./ActionButtons.web.js').default;

const FileDropzone = isLocalDevelopment() 
  ? require('./FileDropzone.local.js').default 
  : require('./FileDropzone.web.js').default;

export { ModuleField, ActionButtons, FileDropzone };