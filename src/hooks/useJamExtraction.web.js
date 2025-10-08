import { useState, useCallback } from 'react';
import { extractAndFetchJamContent } from '../services/jamService.web.js';
import { extractJamUrl, isJamUrl } from '../utils/jamParser.js';

export const useJamExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [hasJamUrl, setHasJamUrl] = useState(false);

  // Extract JAM data from text
  const extractJamData = useCallback(async (text) => {
    if (!text || typeof text !== 'string') {
      return {
        title: '',
        module: '',
        summary: '',
        applicationUrl: null,
        isValid: false,
        error: 'No text provided'
      };
    }

    // Check if text contains JAM URL
    if (!isJamUrl(text)) {
      setHasJamUrl(false);
      return {
        title: '',
        module: '',
        summary: '',
        applicationUrl: null,
        isValid: false,
        error: 'No JAM URL found in text'
      };
    }

    setHasJamUrl(true);
    setIsExtracting(true);
    setExtractionError(null);

    try {
      console.log('🔍 JAM EXTRACTION (WEB): Starting extraction for text:', text);
      
      const jamUrl = extractJamUrl(text);
      console.log('🔍 JAM EXTRACTION (WEB): Extracted JAM URL:', jamUrl);
      
      const jamData = await extractAndFetchJamContent(jamUrl);
      console.log('🔍 JAM EXTRACTION (WEB): Extracted data:', jamData);
      
      setIsExtracting(false);
      return jamData;
    } catch (error) {
      console.error('🔍 JAM EXTRACTION (WEB): Error extracting JAM data:', error);
      setIsExtracting(false);
      setExtractionError(error.message);
      
      return {
        title: '',
        module: '',
        summary: '',
        applicationUrl: null,
        isValid: false,
        error: error.message
      };
    }
  }, []);

  // Clear extraction state
  const clearExtraction = useCallback(() => {
    setIsExtracting(false);
    setExtractionError(null);
    setHasJamUrl(false);
  }, []);

  return {
    isExtracting,
    extractionError,
    hasJamUrl,
    extractJamData,
    clearExtraction
  };
};

export default useJamExtraction;