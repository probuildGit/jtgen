// Configuration Template - Copy this to config.js and fill in your values
// NEVER commit the actual config.js file with real credentials

export const CONFIG = {
  // Jira Configuration
  JIRA: {
    BASE_URL: 'https://your-domain.atlassian.net',
    PROJECT_KEY: 'YOUR_PROJECT_KEY',
    PROJECT_NAME: 'Your Project Name',
    AUTH_TOKEN: 'YOUR_AUTH_TOKEN_HERE',
    EMAIL: 'your-email@domain.com'
  },
  
  // Server Configuration
  SERVER: {
    PORT: 3001,
    CORS_ORIGIN: 'http://localhost:3000'
  },
  
  // App Configuration
  APP: {
    NAME: 'JTGen - Jira Ticket Generator',
    VERSION: '1.0.0',
    DESCRIPTION: 'Create Bug Tickets for Your Project'
  }
};

export default CONFIG;
