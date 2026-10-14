// JAM Content Parser Utility
// Shared utility for parsing JAM content and extracting Module and Summary

/**
 * Parses a screen-recording filename (e.g. ".mov", ".mp4") using the same rules as JAM titles.
 * Strips common video extensions first.
 * @param {string} fileName - File name including extension
 * @returns {Object} Same shape as parseJamTitle: module, summary, isValid, error
 */
export const parseRecordingFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') {
    return {
      module: '',
      summary: '',
      isValid: false,
      error: 'Invalid file name provided'
    };
  }
  const withoutExt = fileName.replace(/\.(mov|mp4|webm|mkv)$/i, '').trim();
  return parseJamTitle(withoutExt);
};

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
  
  // If title is empty, return invalid
  if (!cleanTitle) {
    console.log('🔍 JAM PARSER: Empty JAM title, no content to extract');
    return {
      module: '',
      summary: '',
      isValid: false,
      error: 'JAM title does not contain extractable content'
    };
  }
  
  // If title is just "Jam", use it as summary
  if (cleanTitle.toLowerCase() === 'jam') {
    console.log('🔍 JAM PARSER: Generic JAM title, using as summary');
    return {
      module: 'General',
      summary: 'JAM Session',
      isValid: true,
      error: null
    };
  }
  
  // Try multiple separator patterns: " - ", " – ", " — ", " | ", ": "
  const separators = [' - ', ' – ', ' — ', ' | ', ': '];
  let parts = [cleanTitle];
  let usedSeparator = null;
  
  for (const sep of separators) {
    if (cleanTitle.includes(sep)) {
      parts = cleanTitle.split(sep);
      usedSeparator = sep;
      break;
    }
  }
  
  console.log('🔍 JAM PARSER: Split parts:', parts);
  console.log('🔍 JAM PARSER: Used separator:', usedSeparator || 'none');
  
  if (parts.length < 2) {
    // If no separator found, try to be more flexible:
    // - Use the whole title as summary
    // - Set module to "General" or try to infer from first word
    console.log('🔍 JAM PARSER: No separator found, using flexible parsing');
    
    // Try to infer module from first word if title is long enough
    const words = cleanTitle.split(/\s+/);
    if (words.length > 3) {
      // If title has multiple words, use first word as module hint
      const firstWord = words[0];
      // Check if first word looks like a module name (capitalized, short)
      if (firstWord.length <= 20 && /^[A-Z]/.test(firstWord)) {
        return {
          module: firstWord,
          summary: words.slice(1).join(' '),
          isValid: true,
          error: null
        };
      }
    }
    
    // Fallback: use whole title as summary, General as module
    return {
      module: 'General',
      summary: cleanTitle,
      isValid: true, // Changed to true - we have content even if format isn't perfect
      error: null
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
