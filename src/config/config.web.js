// Configuration for JTGen - Web Deployment (GitHub Pages)
// This file contains the configuration for web deployment
// Uses CORS proxy for API calls

export const CONFIG = {
  // Web Environment Configuration
  WEB: {
    ENVIRONMENT: 'web'
  },
  
  // Jira Configuration for Web Deployment
  JIRA: {
    BASE_URL: 'https://probuild.atlassian.net',
    PROJECT_KEY: 'PB',
    PROJECT_NAME: 'ProBuild',
    AUTH_TOKEN: 'YOUR_JIRA_TOKEN_HERE', // Replace with actual token
    EMAIL: 'YOUR_EMAIL_HERE' // Replace with actual email
  },
  
  // Server Configuration
  SERVER: {
    PORT: null, // Not applicable for web deployment
    CORS_ORIGIN: 'https://probuildgit.github.io',
    USE_PROXY: false, // Web deployment uses CORS proxy
    CORS_PROXY: 'https://corsproxy.io/?'
  },
  
  // App Configuration
  APP: {
    NAME: 'JTGen - Jira Ticket Generator (Web)',
    VERSION: '1.0.0',
    DESCRIPTION: 'Create Bug Tickets for Your Project - Web Deployment'
  }
};

// Web API Endpoints for CORS proxy
export const WEB_API_ENDPOINTS = {
  PROJECT: `${CONFIG.SERVER.CORS_PROXY}${encodeURIComponent(`${CONFIG.JIRA.BASE_URL}/rest/api/3/project/${CONFIG.JIRA.PROJECT_KEY}`)}`,
  CREATE_TICKET: `${CONFIG.SERVER.CORS_PROXY}${encodeURIComponent(`${CONFIG.JIRA.BASE_URL}/rest/api/3/issue`)}`,
  UPLOAD_ATTACHMENT: (issueKey) => `${CONFIG.SERVER.CORS_PROXY}${encodeURIComponent(`${CONFIG.JIRA.BASE_URL}/rest/api/3/issue/${issueKey}/attachments`)}`,
  GET_ISSUE: (issueKey) => `${CONFIG.SERVER.CORS_PROXY}${encodeURIComponent(`${CONFIG.JIRA.BASE_URL}/rest/api/3/issue/${issueKey}`)}`,
  UPDATE_ISSUE: (issueKey) => `${CONFIG.SERVER.CORS_PROXY}${encodeURIComponent(`${CONFIG.JIRA.BASE_URL}/rest/api/3/issue/${issueKey}`)}`
};

export default CONFIG;
