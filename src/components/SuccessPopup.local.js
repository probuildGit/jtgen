import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { DIALOG_TITLES, BUTTON_LABELS } from '../data/formData.local.js';
import '../styles/successStyles.css';

const SuccessPopup = ({ open, onClose, successData }) => {
  if (!successData) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 64, 
              color: 'success.main' 
            }} 
          />
          <Typography variant="h5" component="div" color="success.main">
            {DIALOG_TITLES.SUCCESS}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Paper elevation={1} sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="body1" gutterBottom>
            Your Jira ticket has been created successfully!
          </Typography>
          
          {successData.ticketKey && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Ticket Key:
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontFamily: 'monospace' }}>
                {successData.ticketKey}
              </Typography>
            </Box>
          )}
          
          {successData.ticketUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                You can view your ticket at:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  wordBreak: 'break-all',
                  color: 'primary.main',
                  textDecoration: 'underline'
                }}
              >
                {successData.ticketUrl}
              </Typography>
            </Box>
          )}
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          size="large"
        >
          {BUTTON_LABELS.CLOSE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessPopup;
