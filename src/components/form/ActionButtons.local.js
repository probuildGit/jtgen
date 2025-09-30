// ActionButtons component for local environment
import React from 'react';
import { Button, Box } from '@mui/material';
import { Save, Clear, History } from '@mui/icons-material';

const ActionButtons = ({ 
  onSave, 
  onClear, 
  onViewHistory, 
  loading, 
  disabled 
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Save />}
        onClick={onSave}
        disabled={disabled || loading}
        size="large"
      >
        {loading ? 'Creating...' : 'Create Ticket'}
      </Button>
      
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<Clear />}
        onClick={onClear}
        disabled={loading}
        size="large"
      >
        Clear Form
      </Button>
      
      <Button
        variant="outlined"
        color="info"
        startIcon={<History />}
        onClick={onViewHistory}
        disabled={loading}
        size="large"
      >
        View History
      </Button>
    </Box>
  );
};

export default ActionButtons;
