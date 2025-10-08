import { useState, useCallback, useRef } from 'react';
import { checkSpelling, getSuggestions, correctText } from '../services/spellCheckService.js';

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
        setErrors(result.errors || []);
      } catch (error) {
        console.error('Web spell check error:', error);
        setErrors([]);
      } finally {
        setIsChecking(false);
      }
    }, 300); // 300ms debounce
  }, [enabled]);

  // Get suggestions for a specific word
  const getWordSuggestions = useCallback(async (word) => {
    try {
      return await getSuggestions(word);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }, []);

  // Apply a suggestion to replace a word
  const applySuggestion = useCallback((originalWord, suggestion) => {
    // This is a simple implementation - in a real app you'd want to be more sophisticated
    return suggestion;
  }, []);

  // Auto-correct text
  const correctTextContent = useCallback((text) => {
    if (!autoCorrectEnabled || !text) return text;
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
