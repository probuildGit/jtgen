// JAM Extraction Hook
// Custom hook for extracting Module and Summary from JAM links

import { useState, useCallback } from 'react';
import { extractAndFetchJamContent } from '../services/jamService.local.js';
import { extractJamUrl, isJamUrl } from '../utils/jamParser.js';

export const useJamExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [lastExtractedData, setLastExtractedData] = useState(null);

  /**
   * Extracts JAM content from text and returns parsed data
   * @param {string} text - Text that may contain JAM URLs
   * @returns {Promise<Object>} Extracted JAM data
   */
  const extractJamData = useCallback(async (text) => {
    if (!text || typeof text !== 'string') {
      return {
        module: '',
        summary: '',
        isValid: false,
        error: 'No text provided'
      };
    }

    setIsExtracting(true);
    setExtractionError(null);

    try {
      console.log('🔍 JAM HOOK: Extracting from text:', text);
      
      const jamData = await extractAndFetchJamContent(text);
      
      if (jamData.isValid) {
        setLastExtractedData(jamData);
        console.log('🔍 JAM HOOK: Successfully extracted:', jamData);
      } else {
        setExtractionError(jamData.error);
        console.log('🔍 JAM HOOK: Extraction failed:', jamData.error);
      }

      return jamData;
    } catch (error) {
      const errorMessage = error.message || 'Failed to extract JAM data';
      setExtractionError(errorMessage);
      console.error('🔍 JAM HOOK: Error during extraction:', error);
      
      return {
        module: '',
        summary: '',
        isValid: false,
        error: errorMessage
      };
    } finally {
      setIsExtracting(false);
    }
  }, []);

  /**
   * Checks if text contains a JAM URL
   * @param {string} text - Text to check
   * @returns {boolean} True if JAM URL is found
   */
  const hasJamUrl = useCallback((text) => {
    if (!text || typeof text !== 'string') {
      return false;
    }
    return !!extractJamUrl(text);
  }, []);

  /**
   * Gets the JAM URL from text
   * @param {string} text - Text that may contain JAM URLs
   * @returns {string|null} JAM URL if found, null otherwise
   */
  const getJamUrl = useCallback((text) => {
    if (!text || typeof text !== 'string') {
      return null;
    }
    return extractJamUrl(text);
  }, []);

  /**
   * Clears extraction state
   */
  const clearExtraction = useCallback(() => {
    setExtractionError(null);
    setLastExtractedData(null);
  }, []);

  return {
    extractJamData,
    hasJamUrl,
    getJamUrl,
    clearExtraction,
    isExtracting,
    extractionError,
    lastExtractedData
  };
};
