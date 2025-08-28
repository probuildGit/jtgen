import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { FORM_LABELS, FORM_PLACEHOLDERS, BUTTON_LABELS } from '../../data/formData';

const CustomModuleInput = ({ onSubmit, onCancel }) => {
  const [customModule, setCustomModule] = useState('');

  const handleSubmit = () => {
    if (customModule.trim()) {
      onSubmit(customModule.trim());
      setCustomModule('');
    }
  };

  const handleCancel = () => {
    setCustomModule('');
    onCancel();
  };

  return (
    <Box className="form-attachments-container">
      <TextField
        label={FORM_LABELS.CUSTOM_MODULE}
        value={customModule}
        onChange={(e) => setCustomModule(e.target.value)}
        placeholder={FORM_PLACEHOLDERS.CUSTOM_MODULE}
        size="small"
        className="form-custom-module-input"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!customModule.trim()}
        className="form-custom-module-button"
      >
        {BUTTON_LABELS.ADD}
      </Button>
      <Button
        variant="outlined"
        onClick={handleCancel}
        className="form-custom-module-cancel-button"
      >
        Cancel
      </Button>
    </Box>
  );
};

export default CustomModuleInput;
