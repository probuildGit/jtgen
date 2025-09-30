// Form components exports - Environment-specific loader
import { isLocalDevelopment } from '../../utils/environmentDetection.js';

// Static components (same for both environments)
export { default as FormField } from './FormField';
export { default as FormSection } from './FormSection';
export { default as AttachmentList } from './AttachmentList';

// Environment-specific components
export { default as ModuleField } from isLocalDevelopment() ? './ModuleField.local.js' : './ModuleField.web.js';
export { default as ActionButtons } from isLocalDevelopment() ? './ActionButtons.local.js' : './ActionButtons.web.js';
export { default as FileDropzone } from isLocalDevelopment() ? './FileDropzone.local.js' : './FileDropzone.web.js';