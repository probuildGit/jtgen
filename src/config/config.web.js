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
    AUTH_TOKEN: '', // Will be set by user via Settings button
    EMAIL: '', // Will be set by user via Settings button
    DEMO_MODE: false // Demo mode disabled - use Settings button for credentials
  },
  
  // Server Configuration
  SERVER: {
    PORT: 3001, // Local proxy server port
    CORS_ORIGIN: 'http://localhost:3000',
    USE_PROXY: true, // Web deployment uses local proxy server
    BASE_URL: 'http://localhost:3001'
  },
  
  // CORS Configuration
  CORS: {
    TIMEOUT: 30000 // 30 seconds timeout for CORS requests
  },
  
  // App Configuration
  APP: {
    NAME: 'JTGen - Jira Ticket Generator (Web)',
    VERSION: '1.0.0',
    DESCRIPTION: 'Create Bug Tickets for Your Project - Web Deployment'
  }
};

// Web API Endpoints for local proxy server
export const WEB_API_ENDPOINTS = {
  PROJECT: `${CONFIG.SERVER.BASE_URL}/project/${CONFIG.JIRA.PROJECT_KEY}`,
  CREATE_TICKET: `${CONFIG.SERVER.BASE_URL}/issue`,
  UPLOAD_ATTACHMENT: (issueKey) => `${CONFIG.SERVER.BASE_URL}/issue/${issueKey}/attachments`,
  GET_ISSUE: (issueKey) => `${CONFIG.SERVER.BASE_URL}/issue/${issueKey}`,
  UPDATE_ISSUE: (issueKey) => `${CONFIG.SERVER.BASE_URL}/issue/${issueKey}`
};

export default CONFIG;
