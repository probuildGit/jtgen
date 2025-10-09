// JAM Service for Web Environment
// Handles JAM content extraction through CORS proxy with Playwright

import { getFetchJamContentUrl, getFetchJamContentRenderedUrl } from '../config/jamRoutes.web.js';
import { isJamUrl, extractJamUrl } from '../utils/jamParser.js';

console.log('🔍 WEB JAM SERVICE: Loading web JAM service for web environment');

/**
 * Parse JAM content from HTML (simple parsing for web environment)
 * @param {string} htmlContent - HTML content from JAM page
 * @returns {Object} Parsed JAM data
 */
const parseJamContentFromHtml = (htmlContent) => {
  try {
    // Extract title from HTML
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Look for JAM session data in script tags
    let jamData = null;
    const scriptMatches = htmlContent.match(/<script[^>]*>[\s\S]*?window\.__INITIAL_STATE__[\s\S]*?<\/script>/gi);
    if (scriptMatches) {
      for (const script of scriptMatches) {
        try {
          const jsonMatch = script.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            if (jsonData && jsonData.session) {
              jamData = jsonData.session;
              break;
            }
          }
        } catch (e) {
          // Continue to next script if parsing fails
        }
      }
    }

    // Extract module and summary
    let module = 'General';
    let summary = 'JAM Session Content';
    
    if (jamData) {
      if (jamData.module || jamData.category) {
        module = jamData.module || jamData.category;
      }
      if (jamData.summary || jamData.description || jamData.title) {
        summary = jamData.summary || jamData.description || jamData.title;
      }
    } else {
      // Fallback: try to extract from meta tags
      const metaModule = htmlContent.match(/<meta[^>]*name=["']jam:module["'][^>]*content=["']([^"']+)["']/i);
      const metaSummary = htmlContent.match(/<meta[^>]*name=["']jam:summary["'][^>]*content=["']([^"']+)["']/i);
      
      if (metaModule) {
        module = metaModule[1];
      }
      if (metaSummary) {
        summary = metaSummary[1];
      }
    }

    return {
      title,
      module,
      summary,
      isValid: true,
      error: null
    };
  } catch (error) {
    console.error('🔍 JAM SERVICE (WEB): Error parsing HTML:', error);
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

    // Parse HTML content for basic extraction
    const jamData = parseJamContentFromHtml(htmlContent);
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
 * Fetches JAM content using Playwright service for rendered content
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {Promise<Object>} Parsed JAM content with module and summary
 */
export const fetchJamContentRendered = async (jamUrl) => {
  try {
    console.log('🔍 JAM SERVICE (WEB): Fetching rendered content from:', jamUrl);
    
    if (!isJamUrl(jamUrl)) {
      throw new Error('Invalid JAM URL provided');
    }

    const fetchUrl = getFetchJamContentRenderedUrl(jamUrl);
    console.log('🔍 JAM SERVICE (WEB): Playwright service URL:', fetchUrl);

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
    console.log('🔍 JAM SERVICE (WEB): Playwright service response:', responseData);

    // Extract data from Playwright service response
    const { title, module, summary } = responseData;
    
    return {
      title: title || '',
      module: module || 'General',
      summary: summary || 'JAM Session Content',
      isValid: true,
      error: null
    };

  } catch (error) {
    console.error('🔍 JAM SERVICE (WEB): Error fetching rendered JAM content:', error);
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

    // Try Playwright service first for better content extraction
    console.log('🔍 JAM SERVICE (WEB): Trying Playwright service for better content extraction...');
    const renderedResult = await fetchJamContentRendered(jamUrl);
    
    if (renderedResult.isValid) {
      console.log('🔍 JAM SERVICE (WEB): Playwright extraction successful');
      return renderedResult;
    }

    console.log('🔍 JAM SERVICE (WEB): Playwright failed, trying static HTML extraction...');
    const staticResult = await fetchJamContent(jamUrl);
    
    if (staticResult.isValid) {
      console.log('🔍 JAM SERVICE (WEB): Static HTML extraction successful');
      return staticResult;
    }

    console.log('🔍 JAM SERVICE (WEB): Both extraction methods failed, keeping fields empty');
    return renderedResult;
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
