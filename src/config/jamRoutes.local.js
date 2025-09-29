// Local JAM Routes Configuration
// Defines routes for fetching JAM content in local development environment

const LOCAL_JAM_ROUTES = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    FETCH_JAM_CONTENT: '/jam/fetch-content',
    FETCH_JAM_CONTENT_RENDERED: '/jam/fetch-content-rendered'
  }
};

/**
 * Get the full URL for fetching JAM content from local server
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {string} Full URL for the fetch endpoint
 */
export const getFetchJamContentUrl = (jamUrl) => {
  const encodedUrl = encodeURIComponent(jamUrl);
  return `${LOCAL_JAM_ROUTES.BASE_URL}${LOCAL_JAM_ROUTES.ENDPOINTS.FETCH_JAM_CONTENT}?url=${encodedUrl}`;
};

/**
 * Get the full URL for fetching JAM content (rendered) from local server
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {string} Full URL for the rendered fetch endpoint
 */
export const getFetchJamContentRenderedUrl = (jamUrl) => {
  const encodedUrl = encodeURIComponent(jamUrl);
  return `${LOCAL_JAM_ROUTES.BASE_URL}${LOCAL_JAM_ROUTES.ENDPOINTS.FETCH_JAM_CONTENT_RENDERED}?url=${encodedUrl}`;
};

export default LOCAL_JAM_ROUTES;
