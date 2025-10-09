// JAM Routes Configuration for Web Environment
// Routes for JAM content extraction in web deployment

const WEB_JAM_ROUTES = {
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',
  PLAYWRIGHT_SERVICE: 'https://render-html-api.vercel.app/api/render',
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
 * Get the full URL for fetching JAM content (rendered) using Playwright service
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {string} Full URL for the rendered fetch endpoint
 */
export const getFetchJamContentRenderedUrl = (jamUrl) => {
  // Use Playwright service for rendered content
  return `${WEB_JAM_ROUTES.PLAYWRIGHT_SERVICE}?url=${encodeURIComponent(jamUrl)}`;
};

export default WEB_JAM_ROUTES;
