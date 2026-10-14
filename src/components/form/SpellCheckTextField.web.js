// Web-specific SpellCheckTextField component
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  TextField,
  Box,
  Chip,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AutoFixHigh as AutoFixHighIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useSpellCheck } from '../../hooks/useSpellCheck.web.js';
import { getFieldValidationClass } from '../../utils/formHelpers';

const SpellCheckTextField = ({
  field,
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  rows = 1,
  required = false,
  fullWidth = true,
  size = 'small',
  placeholder,
  disabled = false,
  spellCheckEnabled = true,
  autoCorrectEnabled = true,
  showSpellCheckIndicator = true,
  isJamPopulated = false,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const textFieldRef = useRef(null);
  
  const {
    errors: rawErrors,
    isChecking,
    hasErrors,
    errorCount,
    checkText,
    getWordSuggestions,
    applySuggestion,
    correctText,
    clearErrors
  } = useSpellCheck({
    enabled: spellCheckEnabled,
    autoCorrectEnabled
  });

  // Ensure errors is always an array
  const errors = Array.isArray(rawErrors) ? rawErrors : [];

  // Trigger spell check when value changes from external sources (like JAM population)
  useEffect(() => {
    if (spellCheckEnabled && value && value.trim() !== '') {
      console.log('🔍 SPELL CHECK: External value change detected:', value);
      checkText(value);
    }
  }, [value, spellCheckEnabled, checkText]);

  // Handle text change (no automatic correction)
  const handleTextChange = useCallback((event) => {
    const newValue = event.target.value;
    
    // Call the original onChange
    onChange(field, newValue);
    
    // Trigger spell check
    if (spellCheckEnabled && newValue) {
      checkText(newValue);
    }
  }, [field, onChange, spellCheckEnabled, checkText]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion) => {
    if (selectedError && value) {
      const correctedText = applySuggestion(value, selectedError.word, suggestion);
      onChange(field, correctedText);
      
      // Re-check spelling after correction
      if (spellCheckEnabled) {
        checkText(correctedText);
      }
    }
    
    setAnchorEl(null);
    setSelectedError(null);
  }, [selectedError, value, applySuggestion, field, onChange, spellCheckEnabled, checkText]);

  // Handle error chip click
  const handleErrorClick = useCallback((error, event) => {
    setSelectedError(error);
    setAnchorEl(event.currentTarget);
  }, []);

  // Handle manual auto-correct
  const handleManualAutoCorrect = useCallback(() => {
    if (value && autoCorrectEnabled) {
      const correctedValue = correctText(value);
      if (correctedValue !== value) {
        onChange(field, correctedValue);
        // Re-check spelling after correction
        if (spellCheckEnabled) {
          checkText(correctedValue);
        }
      }
    }
  }, [value, autoCorrectEnabled, correctText, field, onChange, spellCheckEnabled, checkText]);

  // Get spell check indicator
  const getSpellCheckIndicator = () => {
    if (!spellCheckEnabled) return null;
    
    if (isChecking) {
      return (
        <Tooltip title="Checking spelling...">
          <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Tooltip>
      );
    }
    
    if (hasErrors) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={`${errorCount} spelling error${errorCount > 1 ? 's' : ''} found`}>
            <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
          </Tooltip>
          {autoCorrectEnabled && (
            <Tooltip title="Auto-correct all errors">
              <IconButton
                size="small"
                onClick={handleManualAutoCorrect}
                sx={{ 
                  padding: 0.25,
                  '&:hover': { backgroundColor: 'error.light' }
                }}
              >
                <AutoFixHighIcon sx={{ fontSize: 14, color: 'error.main' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    }
    
    if (value && value.trim()) {
      return (
        <Tooltip title="No spelling errors found">
          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
        </Tooltip>
      );
    }
    
    return null;
  };

  // Get CSS classes for misspelled words
  const getSpellCheckClasses = () => {
    if (!hasErrors || !value) return '';
    
    // Create CSS custom properties for misspelled words
    const errorWords = errors.map(error => error.word.toLowerCase()).join(',');
    return `spell-check-errors: ${errorWords}`;
  };

  // Render error chips
  const renderErrorChips = () => {
    if (!hasErrors || !value) return null;
    
    return (
      <Box className="spell-check-error-chips">
        {errors.map((error, index) => (
          <Chip
            key={index}
            label={error.word}
            size="small"
            color="error"
            variant="outlined"
            onClick={(event) => handleErrorClick(error, event)}
            className="spell-check-error-chip"
          />
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        <TextField
          ref={textFieldRef}
          fullWidth={fullWidth}
          size={size}
          multiline={multiline}
          rows={multiline ? rows : undefined}
          type={type}
          label={label}
          value={value || ''}
          onChange={handleTextChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-text-field ${getFieldValidationClass(field, value, required)}`}
          InputProps={{
            endAdornment: showSpellCheckIndicator ? getSpellCheckIndicator() : null,
            ...props.InputProps
          }}
          InputLabelProps={{
            ...props.InputLabelProps
          }}
          {...props}
        />
        
        {/* Overlay for red underlines */}
        {hasErrors && value && (
          <Box
            className="spell-check-overlay"
            sx={{
              top: multiline ? '16px' : '8px',
              left: '14px',
              right: '14px',
              bottom: multiline ? '8px' : '8px',
              fontSize: size === 'small' ? '0.875rem' : '1rem',
              lineHeight: multiline ? '1.5' : '1.4375',
              whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
              wordBreak: multiline ? 'break-word' : 'normal'
            }}
          >
            {value.split(' ').map((word, index) => {
              const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
              const hasError = errors.some(error => error.word.toLowerCase() === cleanWord);
              
              return (
                <span key={index}>
                  {hasError ? (
                    <span className="spell-check-error">
                      {word}
                    </span>
                  ) : (
                    word
                  )}
                  {index < value.split(' ').length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </Box>
        )}
      </Box>
      
      {/* JAM populated indicator */}
      {isJamPopulated && value && (
        <Box className="spell-check-jam-indicator">
          <Typography variant="caption">
            📝 Text populated from JAM - please review for accuracy
          </Typography>
        </Box>
      )}
      
      {/* Error chips */}
      {renderErrorChips()}
      
      {/* Suggestions popup */}
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        className="spell-check-suggestions-popup"
      >
        <Paper elevation={3}>
          {selectedError && (
            <Box className="spell-check-suggestions-list">
              <Typography className="spell-check-suggestions-title">
                Suggestions for "{selectedError.word}":
              </Typography>
              <List dense>
                {selectedError.suggestions?.map((suggestion, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="spell-check-suggestion-item"
                  >
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      </Popper>
    </Box>
  );
};

export default SpellCheckTextField;
