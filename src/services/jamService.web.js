// JAM Service for Local Environment
// Handles JAM content extraction through local proxy server

import { getFetchJamContentUrl, getFetchJamContentRenderedUrl } from '../config/jamRoutes.web.js';
import { extractJamContent, parseJamTitle, isJamUrl, extractJamUrl } from '../utils/jamParser.js';

console.log('🔍 WEB JAM SERVICE: Loading web JAM service through the JTGenWeb proxy');
console.log('🔍 WEB JAM SERVICE: This is the WEB service, using the JTGenWeb proxy on port 3004');

/**
 * Fetches JAM content from a JAM URL using the JTGenWeb proxy
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
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch JAM content: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('🔍 JAM SERVICE (WEB): Server response:', responseData);

    if (!responseData.success) {
      throw new Error(responseData.error || 'Failed to fetch JAM content from server');
    }

    const { title, htmlContent } = responseData.data;
    console.log('🔍 JAM SERVICE (WEB): Extracted title:', title);

    // Try to extract content from HTML, but fallback to parsing the title
    const jamData = extractJamContent(htmlContent);
    console.log('🔍 JAM SERVICE (WEB): Extracted JAM data:', jamData);

    // If HTML extraction failed, try parsing the title directly
    if (!jamData.isValid || !jamData.module || !jamData.summary) {
      console.log('🔍 JAM SERVICE (WEB): HTML extraction failed, trying title parsing...');
      const parsed = parseJamTitle(title);
      
      // Even if parser says invalid, if we have a title, use it
      if (title && title !== 'Untitled JAM') {
        return {
          title: title,
          module: parsed.module || 'General',
          summary: parsed.summary || title,
          isValid: true, // Accept any title we got
          error: parsed.error
        };
      }
      
      return {
        title: title,
        module: parsed.module,
        summary: parsed.summary,
        isValid: parsed.isValid,
        error: parsed.error
      };
    }

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
 * Fetches JAM content using rendered content (Playwright)
 * @param {string} jamUrl - The JAM URL to fetch content from
 * @returns {Promise<Object>} Parsed JAM content with module and summary
 */
export const fetchJamContentRendered = async (jamUrl) => {
  try {
    console.log('🔍 JAM SERVICE (WEB): Fetching rendered content from:', jamUrl);
    console.log('🔍 JAM SERVICE (WEB): This is the WEB service calling the JTGenWeb proxy');
    
    if (!isJamUrl(jamUrl)) {
      throw new Error('Invalid JAM URL provided');
    }

    const fetchUrl = getFetchJamContentRenderedUrl(jamUrl);
    console.log('🔍 JAM SERVICE (WEB): Fetch URL:', fetchUrl);

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
    console.log('🔍 JAM SERVICE (WEB): Server response:', responseData);

    if (!responseData.success) {
      throw new Error(responseData.error || 'Failed to fetch rendered JAM content from server');
    }

    const { title, module, summary, originalTitle, applicationUrl } = responseData.data;
    console.log('🔍 JAM SERVICE (WEB): Extracted data:', { title, module, summary, originalTitle, applicationUrl });

    // The server already parsed the content, so use it directly
    // Be more flexible - accept if we have title OR module OR summary
    const hasContent = !!(title || module || summary);
    const finalModule = module || 'General';
    const finalSummary = summary || title || 'JAM Session';
    
    return {
      title: title || originalTitle || '',
      module: finalModule,
      summary: finalSummary,
      applicationUrl: applicationUrl || null,
      isValid: hasContent, // Accept if we have any content
      error: hasContent ? null : 'No content found in JAM page'
    };
  } catch (error) {
    console.error('🔍 JAM SERVICE (WEB): Error fetching rendered JAM content:', error);
    return {
      title: '',
      module: '',
      summary: '',
      applicationUrl: null,
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
        applicationUrl: null,
        isValid: false,
        error: 'No JAM URL found in text'
      };
    }

    console.log('🔍 JAM SERVICE (WEB): Trying Playwright extraction...');
    let renderedResult;
    try {
      renderedResult = await fetchJamContentRendered(jamUrl);
      
      // Accept result if it has any content (title, module, or summary)
      if (renderedResult && (renderedResult.title || renderedResult.module || renderedResult.summary)) {
        console.log('🔍 JAM SERVICE (WEB): Playwright extraction successful');
        // Ensure both fields have values, use title as fallback
        const finalModule = renderedResult.module || 'General';
        const finalSummary = renderedResult.summary || renderedResult.title || 'JAM Session';
        
        return {
          ...renderedResult,
          module: finalModule,
          summary: finalSummary,
          isValid: true // Mark as valid if we have any content
        };
      }
    } catch (playwrightError) {
      console.log('🔍 JAM SERVICE (WEB): Playwright extraction error:', playwrightError.message);
    }

    console.log('🔍 JAM SERVICE (WEB): Playwright failed, trying static HTML extraction...');
    let staticResult;
    try {
      staticResult = await fetchJamContent(jamUrl);
      
      // Accept result if it has any content (title, module, or summary)
      if (staticResult && (staticResult.title || staticResult.module || staticResult.summary)) {
        console.log('🔍 JAM SERVICE (WEB): Static HTML extraction successful');
        // Ensure both fields have values, use title as fallback
        const finalModule = staticResult.module || 'General';
        const finalSummary = staticResult.summary || staticResult.title || 'JAM Session';
        
        return {
          ...staticResult,
          module: finalModule,
          summary: finalSummary,
          isValid: true // Mark as valid if we have any content
        };
      }
    } catch (staticError) {
      console.log('🔍 JAM SERVICE (WEB): Static HTML extraction error:', staticError.message);
    }

    // If both methods failed, return the best result we have
    const bestResult = renderedResult || staticResult;
    if (bestResult && (bestResult.title || bestResult.module || bestResult.summary)) {
      console.log('🔍 JAM SERVICE (WEB): Using partial result from extraction');
      return {
        title: bestResult.title || '',
        module: bestResult.module || 'General',
        summary: bestResult.summary || bestResult.title || 'JAM Session',
        applicationUrl: bestResult.applicationUrl || null,
        isValid: true, // Accept partial results - mark as valid if we have any data
        error: null, // Don't show error if we have usable data
        jamUrl: jamUrl
      };
    }

    // URL is valid (we extracted it) but server extraction failed (e.g. page requires login,
    // slow load, or jam.dev DOM changed). Populate with defaults so the user can still create a ticket.
    console.log('🔍 JAM SERVICE (WEB): Both extraction methods failed; using fallback for valid JAM URL');
    return {
      title: 'JAM Session',
      module: 'General',
      summary: 'JAM Session',
      applicationUrl: null,
      isValid: true,
      error: null,
      jamUrl: jamUrl,
      extractionNote:
        'This JAM may be private (login required in a browser), so the title could not be read. Module and Summary are set to defaults—edit them as needed. The JAM link has been added to Steps to Reproduce (ticket description) for reviewers.'
    };
  } catch (error) {
    console.error('🔍 JAM SERVICE (WEB): Error extracting and fetching JAM content:', error);
    return {
      title: '',
      module: '',
      summary: '',
      applicationUrl: null,
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
    console.error('🔍 JAM SERVICE (WEB): Connectivity test failed:', error);
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
