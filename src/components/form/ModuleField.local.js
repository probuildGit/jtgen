// ModuleField component for local environment
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getFieldValidationClass } from '../../utils/formHelpers';

const ModuleField = ({ field, value, onChange, required = false, fullWidth = true, size = 'small' }) => {
  const modules = [
    { value: 'Authentication', label: 'Authentication' },
    { value: 'User Management', label: 'User Management' },
    { value: 'Order Processing', label: 'Order Processing' },
    { value: 'Payment Gateway', label: 'Payment Gateway' },
    { value: 'Inventory Management', label: 'Inventory Management' },
    { value: 'Reporting', label: 'Reporting' },
    { value: 'API Integration', label: 'API Integration' },
    { value: 'Database', label: 'Database' },
    { value: 'Frontend', label: 'Frontend' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Mobile App', label: 'Mobile App' },
    { value: 'Other', label: 'Other' }
  ];

  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(field, e.target.value);
    }
  };

  return (
    <FormControl 
      fullWidth={fullWidth} 
      required={required} 
      size={size} 
      className={`form-control ${getFieldValidationClass(field, value, required)}`}
    >
      <InputLabel>Module/Page</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label="Module/Page"
      >
        {modules.map((module) => (
          <MenuItem key={module.value} value={module.value}>
            {module.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ModuleField;