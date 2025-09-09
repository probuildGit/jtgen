// Route configuration for Web Deployment
// These routes are used by the web service with CORS proxy

export const WEB_ROUTES = {
  // CORS proxy configuration
  CORS_PROXY: 'https://corsproxy.io/?',
  
  // Jira API base URL
  JIRA_BASE_URL: 'https://probuild.atlassian.net/rest/api/3',
  
  // API Endpoints (relative to Jira API base)
  ENDPOINTS: {
    // Project operations
    PROJECT: '/project/:projectKey',
    
    // Ticket operations
    CREATE_TICKET: '/issue',
    GET_ISSUE: '/issue/:issueKey',
    UPDATE_ISSUE: '/issue/:issueKey',
    SEARCH_ISSUES: '/search',
    
    // Attachment operations
    UPLOAD_ATTACHMENT: '/issue/:issueKey/attachments'
  },
  
  // Helper function to encode URL for CORS proxy
  encodeUrl: (url) => encodeURIComponent(url),
  
  // Helper functions to build URLs
  buildUrl: (endpoint, params = {}) => {
    let url = endpoint;
    
    // Replace path parameters
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    
    return `${WEB_ROUTES.JIRA_BASE_URL}${url}`;
  },
  
  // Build CORS proxy URL
  buildCorsUrl: (endpoint, params = {}) => {
    const jiraUrl = WEB_ROUTES.buildUrl(endpoint, params);
    return `${WEB_ROUTES.CORS_PROXY}${WEB_ROUTES.encodeUrl(jiraUrl)}`;
  },
  
  // Specific route builders
  getProjectUrl: (projectKey) => WEB_ROUTES.buildCorsUrl(WEB_ROUTES.ENDPOINTS.PROJECT, { projectKey }),
  getCreateTicketUrl: () => WEB_ROUTES.buildCorsUrl(WEB_ROUTES.ENDPOINTS.CREATE_TICKET),
  getIssueUrl: (issueKey) => WEB_ROUTES.buildCorsUrl(WEB_ROUTES.ENDPOINTS.GET_ISSUE, { issueKey }),
  getUpdateIssueUrl: (issueKey) => WEB_ROUTES.buildCorsUrl(WEB_ROUTES.ENDPOINTS.UPDATE_ISSUE, { issueKey }),
  getSearchUrl: (jql, fields) => {
    const baseUrl = WEB_ROUTES.buildCorsUrl(WEB_ROUTES.ENDPOINTS.SEARCH_ISSUES);
    const queryParams = new URLSearchParams();
    if (jql) queryParams.append('jql', jql);
    if (fields) queryParams.append('fields', fields);
    return `${baseUrl}&${queryParams.toString()}`;
  },
  getUploadAttachmentUrl: (issueKey) => WEB_ROUTES.buildCorsUrl(WEB_ROUTES.ENDPOINTS.UPLOAD_ATTACHMENT, { issueKey })
};

export default WEB_ROUTES;
