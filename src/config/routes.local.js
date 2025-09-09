// Route configuration for Local Development
// These routes are used by the local proxy server

export const LOCAL_ROUTES = {
  // Base URL for local proxy server
  BASE_URL: 'http://localhost:3001',
  
  // API Endpoints
  ENDPOINTS: {
    // Health and connectivity
    HEALTH: '/health',
    TEST_CONNECTIVITY: '/test-connectivity',
    
    // Ticket operations
    CREATE_TICKET: '/create-ticket',
    GET_ISSUE: '/issue/:issueKey',
    UPDATE_ISSUE: '/issue/:issueKey',
    SEARCH_ISSUES: '/search',
    
    // Attachment operations
    UPLOAD_ATTACHMENT: '/upload-attachment/:issueKey'
  },
  
  // Helper functions to build URLs
  buildUrl: (endpoint, params = {}) => {
    let url = endpoint;
    
    // Replace path parameters
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    
    return `${LOCAL_ROUTES.BASE_URL}${url}`;
  },
  
  // Specific route builders
  getHealthUrl: () => LOCAL_ROUTES.buildUrl(LOCAL_ROUTES.ENDPOINTS.HEALTH),
  getTestConnectivityUrl: () => LOCAL_ROUTES.buildUrl(LOCAL_ROUTES.ENDPOINTS.TEST_CONNECTIVITY),
  getCreateTicketUrl: () => LOCAL_ROUTES.buildUrl(LOCAL_ROUTES.ENDPOINTS.CREATE_TICKET),
  getIssueUrl: (issueKey) => LOCAL_ROUTES.buildUrl(LOCAL_ROUTES.ENDPOINTS.GET_ISSUE, { issueKey }),
  getUpdateIssueUrl: (issueKey) => LOCAL_ROUTES.buildUrl(LOCAL_ROUTES.ENDPOINTS.UPDATE_ISSUE, { issueKey }),
  getSearchUrl: (jql, fields) => {
    const baseUrl = LOCAL_ROUTES.buildUrl(LOCAL_ROUTES.ENDPOINTS.SEARCH_ISSUES);
    const queryParams = new URLSearchParams();
    if (jql) queryParams.append('jql', jql);
    if (fields) queryParams.append('fields', fields);
    return `${baseUrl}?${queryParams.toString()}`;
  },
  getUploadAttachmentUrl: (issueKey) => LOCAL_ROUTES.buildUrl(LOCAL_ROUTES.ENDPOINTS.UPLOAD_ATTACHMENT, { issueKey })
};

export default LOCAL_ROUTES;
