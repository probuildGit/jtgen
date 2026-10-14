// JAM Routes Configuration for Web Environment
// Routes for JAM content extraction in web deployment

const WEB_JAM_ROUTES = {
  CORS_PROXY: 'https://corsproxy.io/?',
  ENDPOINTS: {
    FETCH_JAM_CONTENT: '/jam/fetch-content',
    FETCH_JAM_CONTENT_RENDERED: '/jam/fetch-content-rendered'
  }
};

/**
 * Get the full URL for fetching JAM content using CORS proxy
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {string} Full URL for the fetch endpoint
 */
export const getFetchJamContentUrl = (jamUrl) => {
  const encodedUrl = encodeURIComponent(jamUrl);
  return `${WEB_JAM_ROUTES.CORS_PROXY}${encodedUrl}`;
};

/**
 * Get the full URL for fetching JAM content (rendered) using CORS proxy
 * Note: Rendered content extraction is not supported in web environment
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {string} Full URL for the rendered fetch endpoint
 */
export const getFetchJamContentRenderedUrl = (jamUrl) => {
  // For web, a dedicated CORS-enabled rendering service would be needed.
  // For now, we'll use the same CORS proxy, but it won't render JS.
  const encodedUrl = encodeURIComponent(jamUrl);
  return `${WEB_JAM_ROUTES.CORS_PROXY}${encodedUrl}`;
};

export default WEB_JAM_ROUTES;
