// JAM Service for Web Environment
// Handles JAM content extraction through CORS proxy

import { getFetchJamContentUrl } from '../config/jamRoutes.web.js';
import { extractJamContent, isJamUrl, extractJamUrl } from '../utils/jamParser.js';

console.log('🔍 WEB JAM SERVICE: Loading web JAM service for web environment');

/**
 * Fetches JAM content from a JAM URL using CORS proxy
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {Promise<Object>} Parsed JAM content with module and summary
 */
export const fetchJamContent = async (jamUrl) => {
  try {
    console.log('🔍 JAM SERVICE (WEB): Fetching content from:', jamUrl);
    
    if (!isJamUrl(jamUrl)) {
      throw new Error('Invalid JAM URL provided');
    }

    const fetchUrl = getFetchJamContentUrl(jamUrl);
    console.log('🔍 JAM SERVICE (WEB): Fetch URL:', fetchUrl);

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; JTGenApp/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch JAM content: ${response.status} ${response.statusText}`);
    }

    const htmlContent = await response.text();
    console.log('🔍 JAM SERVICE (WEB): HTML content length:', htmlContent.length);

    const jamData = extractJamContent(htmlContent);
    console.log('🔍 JAM SERVICE (WEB): Extracted JAM data:', jamData);

    return jamData;
  } catch (error) {
    console.error('🔍 JAM SERVICE (WEB): Error fetching JAM content:', error);
    return {
      title: '',
      module: '',
      summary: '',
      isValid: false,
      error: error.message
    };
  }
};

/**
 * Fetches JAM content using rendered content (not supported in web environment)
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {Promise<Object>} Error message since rendered extraction is not supported
 */
export const fetchJamContentRendered = async (jamUrl) => {
  console.log('🔍 JAM SERVICE (WEB): Rendered content fetching is not supported directly in web environment.');
  return {
    title: '',
    module: '',
    summary: '',
    isValid: false,
    error: 'Rendered JAM content extraction is not supported in the web environment without a dedicated server-side rendering proxy.'
  };
};

/**
 * Extracts JAM URL from text and fetches its content
 * @param {string} text - Text that may contain JAM URLs
 * @returns {Promise<Object>} Parsed JAM content or null if no JAM URL found
 */
export const extractAndFetchJamContent = async (text) => {
  try {
    const jamUrl = extractJamUrl(text);
    
    if (!jamUrl) {
      return {
        title: '',
        module: '',
        summary: '',
        isValid: false,
        error: 'No JAM URL found in text'
      };
    }

    return await fetchJamContent(jamUrl);
  } catch (error) {
    console.error('🔍 JAM SERVICE (WEB): Error extracting and fetching JAM content:', error);
    return {
      title: '',
      module: '',
      summary: '',
      isValid: false,
      error: error.message
    };
  }
};

/**
 * Tests JAM service connectivity
 * @returns {Promise<Object>} Test result
 */
export const testJamConnectivity = async () => {
  try {
    console.log('🔍 JAM SERVICE (WEB): Testing connectivity...');
    
    // Test with a known JAM URL structure
    const testUrl = 'https://jam.dev/c/test';
    const fetchUrl = getFetchJamContentUrl(testUrl);
    
    const response = await fetch(fetchUrl, {
      method: 'HEAD', // Just check if endpoint is reachable
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    return {
      success: true,
      message: 'JAM service is reachable',
      status: response.status
    };
  } catch (error) {
    console.error('🔍 JAM SERVICE (WEB): Connectivity test failed:', error);
    return {
      success: false,
      message: `JAM service connectivity test failed: ${error.message}`,
      error: error.message
    };
  }
};

const webJamService = {
  fetchJamContent,
  fetchJamContentRendered,
  extractAndFetchJamContent,
  testJamConnectivity
};

export default webJamService;
