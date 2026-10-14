// JAM routes for the JTGenWeb proxy on port 3004.

const WEB_JAM_ROUTES = {
  BASE_URL: 'http://localhost:3004',
  ENDPOINTS: {
    FETCH_JAM_CONTENT: '/jam/fetch-content',
    FETCH_JAM_CONTENT_RENDERED: '/jam/fetch-content-rendered'
  }
};

export const getFetchJamContentUrl = (jamUrl) => {
  const encodedUrl = encodeURIComponent(jamUrl);
  return `${WEB_JAM_ROUTES.BASE_URL}${WEB_JAM_ROUTES.ENDPOINTS.FETCH_JAM_CONTENT}?url=${encodedUrl}`;
};

export const getFetchJamContentRenderedUrl = (jamUrl) => {
  const encodedUrl = encodeURIComponent(jamUrl);
  return `${WEB_JAM_ROUTES.BASE_URL}${WEB_JAM_ROUTES.ENDPOINTS.FETCH_JAM_CONTENT_RENDERED}?url=${encodedUrl}`;
};

export default WEB_JAM_ROUTES;
