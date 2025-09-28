import React, { useState } from 'react';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import ApiConfigPopup from './ApiConfigPopup.web.js';

const SettingsButton = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <Tooltip title="API Configuration Settings">
        <IconButton
          onClick={handleSettingsClick}
          sx={{
            color: '#1976d2',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
          }}
          aria-label="API Configuration Settings"
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      
      <ApiConfigPopup
        open={isPopupOpen}
        onClose={handleClosePopup}
      />
    </>
  );
};

export default SettingsButton;
