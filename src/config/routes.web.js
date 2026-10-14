// Routes for the JTGenWeb proxy. Same endpoints as the working local app, on port 3004.

export const WEB_ROUTES = {
  BASE_URL: 'http://localhost:3004',

  ENDPOINTS: {
    HEALTH: '/health',
    TEST_CONNECTIVITY: '/test-connectivity',
    CREATE_TICKET: '/create-ticket',
    GET_ISSUE: '/issue/:issueKey',
    UPDATE_ISSUE: '/issue/:issueKey',
    SEARCH_ISSUES: '/search',
    UPLOAD_ATTACHMENT: '/upload-attachment/:issueKey'
  },

  buildUrl: (endpoint, params = {}) => {
    let url = endpoint;
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    return `${WEB_ROUTES.BASE_URL}${url}`;
  },

  getHealthUrl: () => WEB_ROUTES.buildUrl(WEB_ROUTES.ENDPOINTS.HEALTH),
  getTestConnectivityUrl: () => WEB_ROUTES.buildUrl(WEB_ROUTES.ENDPOINTS.TEST_CONNECTIVITY),
  getCreateTicketUrl: () => WEB_ROUTES.buildUrl(WEB_ROUTES.ENDPOINTS.CREATE_TICKET),
  getIssueUrl: (issueKey) => WEB_ROUTES.buildUrl(WEB_ROUTES.ENDPOINTS.GET_ISSUE, { issueKey }),
  getUpdateIssueUrl: (issueKey) => WEB_ROUTES.buildUrl(WEB_ROUTES.ENDPOINTS.UPDATE_ISSUE, { issueKey }),
  getSearchUrl: (jql, fields) => {
    const baseUrl = WEB_ROUTES.buildUrl(WEB_ROUTES.ENDPOINTS.SEARCH_ISSUES);
    const queryParams = new URLSearchParams();
    if (jql) queryParams.append('jql', jql);
    if (fields) queryParams.append('fields', fields);
    return `${baseUrl}?${queryParams.toString()}`;
  },
  getUploadAttachmentUrl: (issueKey) => WEB_ROUTES.buildUrl(WEB_ROUTES.ENDPOINTS.UPLOAD_ATTACHMENT, { issueKey })
};

export default WEB_ROUTES;
