// Configuration for JTGenWeb
// Do not put real Jira tokens in this file. Use the in-app Settings button.

export const CONFIG = {
  JIRA: {
    BASE_URL: 'https://probuild.atlassian.net',
    PROJECT_KEY: 'PB',
    PROJECT_NAME: 'ProBuild',
    AUTH_TOKEN: '',
    EMAIL: ''
  },

  SERVER: {
    PORT: null,
    CORS_ORIGIN: 'https://probuildgit.github.io',
    USE_PROXY: false,
    CORS_PROXY: 'https://corsproxy.io/?'
  },

  APP: {
    NAME: 'JTGen - Jira Ticket Generator (Web)',
    VERSION: '1.0.0',
    DESCRIPTION: 'Create Bug Tickets for Your Project - Web Deployment'
  }
};

export const WEB_API_ENDPOINTS = {
  GET_ISSUE: (ticketKey) => `${CONFIG.SERVER.CORS_PROXY}${CONFIG.JIRA.BASE_URL}/rest/api/3/issue/${ticketKey}`,
  CREATE_ISSUE: () => `${CONFIG.SERVER.CORS_PROXY}${CONFIG.JIRA.BASE_URL}/rest/api/3/issue`,
  GET_PROJECT: () => `${CONFIG.SERVER.CORS_PROXY}${CONFIG.JIRA.BASE_URL}/rest/api/3/project/${CONFIG.JIRA.PROJECT_KEY}`,
  GET_PROJECTS: () => `${CONFIG.SERVER.CORS_PROXY}${CONFIG.JIRA.BASE_URL}/rest/api/3/project`
};

export default CONFIG;
