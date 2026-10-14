// Configuration for JTGenWeb.
// Jira credentials stay on the proxy (JTGenWeb/.env), not in the browser bundle.

export const CONFIG = {
  JIRA: {
    BASE_URL: 'https://probuild.atlassian.net',
    PROJECT_KEY: 'PB',
    PROJECT_NAME: 'ProBuild'
  },

  SERVER: {
    PORT: 3004,
    BASE_URL: 'http://localhost:3004'
  },

  APP: {
    NAME: 'JTGen - Jira Ticket Generator (Web)',
    VERSION: '1.0.0',
    DESCRIPTION: 'Create Bug Tickets for Your Project - Web Deployment'
  }
};

export default CONFIG;
