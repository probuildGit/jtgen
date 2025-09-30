// Main components exports - Environment-specific loader
import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Static components (same for both environments)
export { default as LoadingOverlay } from './LoadingOverlay';

// Environment-specific components
const JiraTicketForm = isLocalDevelopment() 
  ? require('./JiraTicketForm.local.js').default 
  : require('./JiraTicketForm.web.js').default;

const InfoButton = isLocalDevelopment() 
  ? require('./InfoButton.local.js').default 
  : require('./InfoButton.web.js').default;

const SuccessPopup = isLocalDevelopment() 
  ? require('./SuccessPopup.local.js').default 
  : require('./SuccessPopup.web.js').default;

const TicketHistory = isLocalDevelopment() 
  ? require('./TicketHistory.local.js').default 
  : require('./TicketHistory.web.js').default;

const TicketPreview = isLocalDevelopment() 
  ? require('./TicketPreview.local.js').default 
  : require('./TicketPreview.web.js').default;

const SettingsButton = isLocalDevelopment() 
  ? require('./SettingsButton.local.js').default 
  : require('./SettingsButton.web.js').default;

const ApiConfigPopup = isLocalDevelopment() 
  ? require('./ApiConfigPopup.local.js').default 
  : require('./ApiConfigPopup.web.js').default;

export { 
  JiraTicketForm, 
  InfoButton, 
  SuccessPopup, 
  TicketHistory, 
  TicketPreview, 
  SettingsButton, 
  ApiConfigPopup 
};