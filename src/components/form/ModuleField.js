import React, { useState, useRef, useEffect } from 'react';
import { TextField, Autocomplete, Box } from '@mui/material';
import { getFieldValidationClass } from '../../utils/formHelpers';
import { MODULE_OPTIONS, FORM_LABELS, FORM_PLACEHOLDERS } from '../../data/formData';

const ModuleField = ({ 
  field,
  value,
  onChange,
  required = false,
  fullWidth = true,
  size = 'small'
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const autocompleteRef = useRef(null);

  // Update inputValue when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleChange = (event, newValue) => {
    // newValue can be a string (free text) or null
    const moduleValue = newValue || '';
    setInputValue(moduleValue);
    onChange(field, moduleValue);
  };

  const handleInputChange = (event, newInputValue) => {
    // This handles the text input changes
    setInputValue(newInputValue);
    // Don't call onChange here to avoid too many updates
    // onChange will be called when the user selects or confirms
  };

  const handleBlur = () => {
    // When user leaves the field, update the value with current input
    if (inputValue !== value) {
      onChange(field, inputValue);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Autocomplete
        ref={autocompleteRef}
        freeSolo
        fullWidth={fullWidth}
        size={size}
        value={value || ''}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleChange}
        onBlur={handleBlur}
        options={MODULE_OPTIONS}
        className={`form-control ${getFieldValidationClass(field, value, required)}`}
        renderInput={(params) => (
          <TextField
            {...params}
            required={required}
            label={FORM_LABELS.MODULE_PAGE}
            placeholder={FORM_PLACEHOLDERS.CUSTOM_MODULE}
            className={`form-text-field ${getFieldValidationClass(field, value, required)}`}
            InputProps={{
              ...params.InputProps,
              style: {
                backgroundColor: 'white',
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: '0.875rem',
                letterSpacing: '0.2px'
              }
            }}
            InputLabelProps={{
              style: {
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 400,
                letterSpacing: '0.2px'
              }
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: '0.875rem',
              letterSpacing: '0.2px'
            }}
          >
            {option}
          </Box>
        )}
        ListboxProps={{
          style: {
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: '0.875rem'
          }
        }}
        noOptionsText="Type to add custom module"
        clearOnBlur={false}
        selectOnFocus
        handleHomeEndKeys
      />
    </Box>
  );
};

export default ModuleField;
