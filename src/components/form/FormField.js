import React from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getFieldValidationClass } from '../../utils/formHelpers';

// Reusable form field component
const FormField = ({ 
  type = 'text',
  field,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  multiline = false,
  rows = 1,
  options = [],
  fullWidth = true,
  size = 'small'
}) => {
  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(field, e.target.value);
    }
  };

  if (type === 'select') {
    return (
      <FormControl 
        fullWidth={fullWidth} 
        required={required} 
        size={size} 
        className={`form-control ${getFieldValidationClass(field, value, required)}`}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          onChange={handleChange}
          label={label}
        >
          {options.map(option => (
            <MenuItem key={option.value || option.id || option.key} value={option.value || option.id || option.key}>
              {option.label || option.name || `${option.key} - ${option.name}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <TextField
      fullWidth={fullWidth}
      required={required}
      size={size}
      multiline={multiline}
      rows={rows}
      className={`form-text-field ${getFieldValidationClass(field, value, required)}`}
      label={label}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
};

export default FormField;
