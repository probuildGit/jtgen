import React from 'react';
import { Box, Button } from '@mui/material';
import { 
  History as HistoryIcon, 
  Visibility as VisibilityIcon 
} from '@mui/icons-material';
import { BUTTON_LABELS } from '../../data/formData';

const ActionButtons = ({ 
  loading, 
  isOffline, 
  onClear, 
  onHistory, 
  onPreview, 
  onSubmit 
}) => {
  return (
    <Box className="form-action-buttons">
      <Button
        variant="outlined"
        onClick={onClear}
        disabled={loading}
        size="large"
        className="form-button form-button-secondary"
      >
        {loading ? 'Creating...' : BUTTON_LABELS.CLEAR_FORM}
      </Button>

      <Button
        variant="outlined"
        onClick={onHistory}
        disabled={loading}
        size="large"
        startIcon={<HistoryIcon />}
        className="form-button form-button-secondary"
      >
        {loading ? 'Creating...' : BUTTON_LABELS.HISTORY}
      </Button>

      <Button
        variant="outlined"
        onClick={onPreview}
        disabled={loading}
        size="large"
        startIcon={<VisibilityIcon />}
        className="form-button form-button-secondary"
      >
        {loading ? 'Creating...' : BUTTON_LABELS.PREVIEW_TICKET}
      </Button>

      <Button
        type="submit"
        variant="contained"
        disabled={loading || isOffline}
        size="large"
        className="form-button form-button-primary"
        title={isOffline ? "Cannot create tickets in offline mode" : ""}
        onClick={onSubmit}
      >
        {loading ? BUTTON_LABELS.CREATING_TICKET : 
         isOffline ? "Create Ticket (Offline)" : BUTTON_LABELS.CREATE_TICKET}
      </Button>
    </Box>
  );
};

export default ActionButtons;
