import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Link
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { DIALOG_TITLES, BUTTON_LABELS } from '../data/formData';
import '../styles/successStyles.css';

const SuccessPopup = ({ open, onClose, successData }) => {
  if (!successData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="form-success-dialog"
      PaperProps={{
        className: 'form-success-dialog-paper'
      }}
    >
      <DialogTitle>
        <Box className="form-dialog-title-container">
          <CheckCircleIcon color="success" />
          <Typography variant="h5" component="div" className="form-success-dialog-title">
            {DIALOG_TITLES.SUCCESS.TITLE}
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {DIALOG_TITLES.SUCCESS.SUBTITLE}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Paper elevation={1} className="form-success-paper">
          <Typography variant="body1" className="form-success-message">
            {successData.message}
          </Typography>
          
          {successData.ticketKey && (
            <Box className="form-success-ticket-info">
              <Typography variant="subtitle1" className="form-success-ticket-label">
                Ticket Created:
              </Typography>
              <Link
                href={successData.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="form-success-ticket-link"
                underline="hover"
              >
                {successData.ticketKey}
              </Link>
            </Box>
          )}
        </Paper>
      </DialogContent>
      
      <DialogActions className="form-success-actions">
        <Button onClick={onClose} variant="contained" color="primary">
          {BUTTON_LABELS.CLOSE}
        </Button>
        {successData.ticketUrl && (
          <Button
            onClick={() => window.open(successData.ticketUrl, '_blank')}
            variant="outlined"
            color="primary"
          >
            {BUTTON_LABELS.VIEW_TICKET}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SuccessPopup;
