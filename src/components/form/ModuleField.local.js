// ModuleField component for local environment
import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const ModuleField = ({ value, onChange, error, helperText }) => {
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

  return (
    <TextField
      select
      fullWidth
      label="Module"
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      variant="outlined"
      margin="normal"
    >
      {modules.map((module) => (
        <MenuItem key={module.value} value={module.value}>
          {module.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default ModuleField;
