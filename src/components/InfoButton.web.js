import React, { useState } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper
} from '@mui/material';
import { HelpOutline, Download, Close } from '@mui/icons-material';
import { DIALOG_TITLES, BUTTON_LABELS } from '../data/formData';
import '../styles/infoButtonStyles.css';

const InfoButton = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDownloadPDF = () => {
    // Create a link to download the HTML manual
    // The HTML file can be easily converted to PDF by the browser
    const link = document.createElement('a');
    link.href = '/JTGen_App_Manual.html';
    link.download = 'JTGen_App_Manual.html';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Also provide instructions for PDF conversion
    setTimeout(() => {
      alert('Manual downloaded! To convert to PDF:\n\n1. Open the downloaded HTML file in your browser\n2. Press Ctrl+P (or Cmd+P on Mac)\n3. Select "Save as PDF" as destination\n4. Click Save');
    }, 1000);
  };

  return (
    <>
      {/* Info Button */}
      <IconButton
        onClick={handleOpen}
        className="info-button"
        title="Download App Manual"
        size="large"
      >
        <HelpOutline />
      </IconButton>

      {/* Info Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        className="info-dialog"
      >
        <DialogTitle className="info-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpOutline color="primary" />
            <Typography variant="h6" component="span">
              {DIALOG_TITLES.MANUAL?.TITLE || 'App Manual'}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent className="info-dialog-content">
          <Paper elevation={1} className="info-content-paper">
            <Typography variant="body1" paragraph>
              Download the complete JTGen application manual to learn about:
            </Typography>
            
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Typography component="li" variant="body2" paragraph>
                <strong>User Guide:</strong> How to use all form fields, buttons, and features
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                <strong>Field Explanations:</strong> Detailed descriptions of every form field
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                <strong>Features:</strong> Image embedding, custom modules, validation, and more
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                <strong>Troubleshooting:</strong> Common issues and solutions
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                <strong>Developer Documentation:</strong> Architecture, code structure, and deployment
              </Typography>
            </Box>

            <Paper elevation={2} className="info-feature-highlight">
              <Typography variant="subtitle2" color="primary" gutterBottom>
                📖 Complete Manual Includes:
              </Typography>
              <Typography variant="body2" component="div">
                • Step-by-step field guides<br/>
                • Button functionality explanations<br/>
                • Feature descriptions with examples<br/>
                • Troubleshooting section<br/>
                • Developer architecture documentation<br/>
                • Environment separation details<br/>
                • Deployment instructions
              </Typography>
            </Paper>
          </Paper>
        </DialogContent>

        <DialogActions className="info-dialog-actions">
          <Button
            onClick={handleClose}
            startIcon={<Close />}
            variant="outlined"
            className="info-cancel-button"
          >
            {BUTTON_LABELS.CLOSE}
          </Button>
          <Button
            onClick={handleDownloadPDF}
            startIcon={<Download />}
            variant="contained"
            color="primary"
            className="info-download-button"
          >
            Download Manual
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InfoButton;
