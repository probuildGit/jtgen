// Local-specific spell check hook
import { useState, useCallback, useRef } from 'react';
import { checkSpelling, getSuggestions, correctText } from '../services/spellCheckService';

export const useSpellCheck = ({ enabled = true, autoCorrectEnabled = true } = {}) => {
  const [errors, setErrors] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const debounceTimeoutRef = useRef(null);

  // Check spelling with debouncing
  const checkText = useCallback(async (text) => {
    if (!enabled || !text || text.trim() === '') {
      setErrors([]);
      return;
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the spell check
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsChecking(true);
      
      try {
        const result = await checkSpelling(text);
        console.log('🔍 SPELL CHECK RESULT:', { text, result });
        setErrors(result.errors || []);
      } catch (error) {
        console.error('Local spell check error:', error);
        setErrors([]);
      } finally {
        setIsChecking(false);
      }
    }, 300); // 300ms debounce
  }, [enabled]);

  // Get suggestions for a word
  const getWordSuggestions = useCallback(async (word) => {
    try {
      return await getSuggestions(word);
    } catch (error) {
      console.error('Local suggestions error:', error);
      return [];
    }
  }, []);

  // Apply suggestion to text
  const applySuggestion = useCallback((text, word, suggestion) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    return text.replace(regex, suggestion);
  }, []);

  // Auto-correct text
  const correctTextContent = useCallback((text) => {
    if (!autoCorrectEnabled) return text;
    return correctText(text);
  }, [autoCorrectEnabled]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors: Array.isArray(errors) ? errors : [],
    isChecking,
    hasErrors: Array.isArray(errors) && errors.length > 0,
    errorCount: Array.isArray(errors) ? errors.length : 0,
    checkText,
    getWordSuggestions,
    applySuggestion,
    correctText: correctTextContent,
    clearErrors
  };
};

export default useSpellCheck;
