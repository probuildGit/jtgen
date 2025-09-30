// GitHub Pages Configuration - Replace with actual values
export const JIRA_CONFIG = {
  BASE_URL: 'https://probuild.atlassian.net',
  PROJECT_KEY: 'PB',
  PROJECT_NAME: 'Probuild-V2',
  AUTH_TOKEN: 'YOUR_ACTUAL_TOKEN_HERE',
  EMAIL: 'dana@codelovers.com'
};

// Import data lists from environment-specific formData
export {
  PLATFORM_OPTIONS,
  PRIORITY_OPTIONS,
  COMPONENTS,
  EPICS
} from '../data/index.js';
