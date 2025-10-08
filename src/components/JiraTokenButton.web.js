import React, { useState } from 'react';
import { IconButton, Tooltip, Badge } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import JiraTokenPopup from './JiraTokenPopup.web.js';
import '../styles/jiraTokenStyles.css';

const JiraTokenButton = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Check if token exists on component mount
  React.useEffect(() => {
    const token = localStorage.getItem('jiraToken');
    setHasToken(!!token);
  }, []);

  const handleOpenPopup = () => {
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    // Check if token was saved/cleared
    const token = localStorage.getItem('jiraToken');
    setHasToken(!!token);
  };

  return (
    <>
      <Tooltip title="JIRA Token Configuration" arrow>
        <IconButton
          onClick={handleOpenPopup}
          className="jira-token-button"
          sx={{
            backgroundColor: hasToken ? '#4caf50' : '#ff9800',
            color: 'white',
            '&:hover': {
              backgroundColor: hasToken ? '#45a049' : '#f57c00',
            },
            transition: 'all 0.3s ease',
            boxShadow: hasToken ? '0 2px 8px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(255, 152, 0, 0.3)',
          }}
        >
          <Badge
            color={hasToken ? 'success' : 'warning'}
            variant="dot"
            invisible={!hasToken}
          >
            <SecurityIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <JiraTokenPopup
        open={popupOpen}
        onClose={handleClosePopup}
      />
    </>
  );
};

export default JiraTokenButton;
