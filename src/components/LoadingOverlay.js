import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper
} from '@mui/material';
import '../styles/formStyles.css';

const LoadingOverlay = ({ open, message = "Creating ticket..." }) => {
  if (!open) return null;

  return (
    <Box className="form-loading-overlay">
      <Paper elevation={8} className="form-loading-paper">
        <CircularProgress 
          size={60} 
          thickness={4} 
          color="primary" 
          className="form-loading-spinner"
        />
        <Typography 
          variant="h6" 
          className="form-loading-text"
          align="center"
        >
          {message}
        </Typography>
        <Typography 
          variant="body2" 
          className="form-loading-subtext"
          align="center"
          color="text.secondary"
        >
          Please wait while we create your ticket...
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoadingOverlay;
