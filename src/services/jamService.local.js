// JAM Service for Local Environment
// Handles JAM content extraction through local proxy server

import { getFetchJamContentUrl, getFetchJamContentRenderedUrl } from '../config/jamRoutes.local.js';
import { extractJamContent, parseJamTitle, isJamUrl, extractJamUrl } from '../utils/jamParser.js';

console.log('🔍 LOCAL JAM SERVICE: Loading local JAM service for local environment');

/**
 * Fetches JAM content from a JAM URL using local proxy server
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {Promise<Object>} Parsed JAM content with module and summary
 */
export const fetchJamContent = async (jamUrl) => {
  try {
    console.log('🔍 JAM SERVICE (LOCAL): Fetching content from:', jamUrl);
    
    if (!isJamUrl(jamUrl)) {
      throw new Error('Invalid JAM URL provided');
    }

    const fetchUrl = getFetchJamContentUrl(jamUrl);
    console.log('🔍 JAM SERVICE (LOCAL): Fetch URL:', fetchUrl);

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch JAM content: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('🔍 JAM SERVICE (LOCAL): Server response:', responseData);

    if (!responseData.success) {
      throw new Error(responseData.error || 'Failed to fetch JAM content from server');
    }

    const { title, htmlContent } = responseData.data;
    console.log('🔍 JAM SERVICE (LOCAL): Extracted title:', title);

    const jamData = extractJamContent(htmlContent);
    console.log('🔍 JAM SERVICE (LOCAL): Extracted JAM data:', jamData);

    return jamData;
  } catch (error) {
    console.error('🔍 JAM SERVICE (LOCAL): Error fetching JAM content:', error);
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
 * Fetches JAM content using rendered content (Playwright)
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {Promise<Object>} Parsed JAM content with module and summary
 */
export const fetchJamContentRendered = async (jamUrl) => {
  try {
    console.log('🔍 JAM SERVICE (LOCAL): Fetching rendered content from:', jamUrl);
    
    if (!isJamUrl(jamUrl)) {
      throw new Error('Invalid JAM URL provided');
    }

    const fetchUrl = getFetchJamContentRenderedUrl(jamUrl);
    console.log('🔍 JAM SERVICE (LOCAL): Fetch URL:', fetchUrl);

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rendered JAM content: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('🔍 JAM SERVICE (LOCAL): Server response:', responseData);

    if (!responseData.success) {
      throw new Error(responseData.error || 'Failed to fetch rendered JAM content from server');
    }

    const { title, additionalContent } = responseData.data;
    console.log('🔍 JAM SERVICE (LOCAL): Extracted title:', title);
    console.log('🔍 JAM SERVICE (LOCAL): Additional content:', additionalContent);

    // Always use the main title for parsing, not additional content
    const contentToParse = title;
    const parsed = parseJamTitle(contentToParse);

    return {
      title: contentToParse,
      module: parsed.module,
      summary: parsed.summary,
      isValid: parsed.isValid,
      error: parsed.error
    };
  } catch (error) {
    console.error('🔍 JAM SERVICE (LOCAL): Error fetching rendered JAM content:', error);
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

    console.log('🔍 JAM SERVICE (LOCAL): Trying Playwright extraction first...');
    const renderedResult = await fetchJamContentRendered(jamUrl);
    
    if (renderedResult.isValid) {
      console.log('🔍 JAM SERVICE (LOCAL): Playwright extraction successful');
      return renderedResult;
    }

    console.log('🔍 JAM SERVICE (LOCAL): Playwright failed, trying static HTML extraction...');
    const staticResult = await fetchJamContent(jamUrl);
    
    if (staticResult.isValid) {
      console.log('🔍 JAM SERVICE (LOCAL): Static HTML extraction successful');
      return staticResult;
    }

    console.log('🔍 JAM SERVICE (LOCAL): Both extraction methods failed');
    return renderedResult;
  } catch (error) {
    console.error('🔍 JAM SERVICE (LOCAL): Error extracting and fetching JAM content:', error);
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
    console.log('🔍 JAM SERVICE (LOCAL): Testing connectivity...');
    // Test with a known JAM URL structure
    const testUrl = 'https://jam.dev/c/test';
    const fetchUrl = getFetchJamContentRenderedUrl(testUrl); // Use rendered endpoint for connectivity test
    
    const response = await fetch(fetchUrl, {
      method: 'HEAD', // Just check if endpoint is reachable
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: 'JAM service is reachable',
      status: response.status
    };
  } catch (error) {
    console.error('🔍 JAM SERVICE (LOCAL): Connectivity test failed:', error);
    return {
      success: false,
      message: `JAM service connectivity test failed: ${error.message}`,
      error: error.message
    };
  }
};

const localJamService = {
  fetchJamContent,
  fetchJamContentRendered,
  extractAndFetchJamContent,
  testJamConnectivity
};

export default localJamService;
