// Main components exports - Environment-specific loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Static components (same for both environments)
export { default as LoadingOverlay } from './LoadingOverlay';

// Environment-specific components
export { default as JiraTicketForm } from isLocalDevelopment() ? './JiraTicketForm.local.js' : './JiraTicketForm.web.js';
export { default as InfoButton } from isLocalDevelopment() ? './InfoButton.local.js' : './InfoButton.web.js';
export { default as SuccessPopup } from isLocalDevelopment() ? './SuccessPopup.local.js' : './SuccessPopup.web.js';
export { default as TicketHistory } from isLocalDevelopment() ? './TicketHistory.local.js' : './TicketHistory.web.js';
export { default as TicketPreview } from isLocalDevelopment() ? './TicketPreview.local.js' : './TicketPreview.web.js';
export { default as SettingsButton } from isLocalDevelopment() ? './SettingsButton.local.js' : './SettingsButton.web.js';
export { default as ApiConfigPopup } from isLocalDevelopment() ? './ApiConfigPopup.local.js' : './ApiConfigPopup.web.js';
