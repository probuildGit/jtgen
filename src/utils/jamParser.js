// JAM Content Parser Utility
// Shared utility for parsing JAM content and extracting Module and Summary

/**
 * Parses JAM title to extract Module and Summary
 * @param {string} jamTitle - The JAM session title
 * @returns {Object} Parsed data with module and summary
 */
export const parseJamTitle = (jamTitle) => {
  if (!jamTitle || typeof jamTitle !== 'string') {
    return {
      module: '',
      summary: '',
      isValid: false,
      error: 'Invalid JAM title provided'
    };
  }

  // Remove "Jam |" prefix if present (case insensitive)
  const cleanTitle = jamTitle.replace(/^jam\s*\|\s*/i, '').trim();
  
  console.log('🔍 JAM PARSER: Original title:', jamTitle);
  console.log('🔍 JAM PARSER: Cleaned title:', cleanTitle);
  
  // Split on " - " to separate module and summary
  const parts = cleanTitle.split(' - ');
  
  console.log('🔍 JAM PARSER: Split parts:', parts);
  
  if (parts.length < 2) {
    return {
      module: cleanTitle,
      summary: '',
      isValid: false,
      error: 'JAM title does not follow expected format: "Module - Summary"'
    };
  }

  const module = parts[0].trim();
  const summary = parts.slice(1).join(' - ').trim(); // Join remaining parts in case summary contains " - "

  console.log('🔍 JAM PARSER: Extracted module:', module);
  console.log('🔍 JAM PARSER: Extracted summary:', summary);

  return {
    module,
    summary,
    isValid: true,
    error: null
  };
};

/**
 * Extracts JAM content from HTML page content
 * @param {string} htmlContent - The HTML content of the JAM page
 * @returns {Object} Extracted JAM data
 */
export const extractJamContent = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return {
      title: '',
      module: '',
      summary: '',
      isValid: false,
      error: 'Invalid HTML content provided'
    };
  }

  try {
    // Extract title from HTML
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    if (!titleMatch || !titleMatch[1]) {
      return {
        title: '',
        module: '',
        summary: '',
        isValid: false,
        error: 'Could not extract title from JAM page'
      };
    }

    const title = titleMatch[1].trim();
    const parsed = parseJamTitle(title);

    return {
      title,
      module: parsed.module,
      summary: parsed.summary,
      isValid: parsed.isValid,
      error: parsed.error
    };
  } catch (error) {
    return {
      title: '',
      module: '',
      summary: '',
      isValid: false,
      error: `Error parsing JAM content: ${error.message}`
    };
  }
};

/**
 * Validates if a URL is a JAM link
 * @param {string} url - The URL to validate
 * @returns {boolean} True if it's a JAM link
 */
export const isJamUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const jamPatterns = [
    /https?:\/\/.*\.jam\.dev/i,
    /https?:\/\/jam\.dev/i,
    /https?:\/\/.*\.jam\.ai/i,
    /https?:\/\/jam\.ai/i,
    /https?:\/\/.*\.jam\.com/i,
    /https?:\/\/jam\.com/i
  ];

  return jamPatterns.some(pattern => pattern.test(url));
};

/**
 * Extracts JAM URL from text content
 * @param {string} text - Text that may contain JAM URLs
 * @returns {string|null} The first JAM URL found, or null if none found
 */
export const extractJamUrl = (text) => {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const jamUrlPattern = /https?:\/\/[^\s]*(?:jam\.dev|jam\.ai|jam\.com)[^\s]*/i;
  const match = text.match(jamUrlPattern);
  
  return match ? match[0] : null;
};
