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
import { DIALOG_TITLES, BUTTON_LABELS } from '../data/formData.local.js';
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
        aria-label="Help and Information"
        title="Help and Information"
      >
        <HelpOutline />
      </IconButton>

      {/* Info Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        className="info-dialog"
      >
        <DialogTitle className="info-dialog-title">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="div">
              🎫 JTGen App - Help & Information
            </Typography>
            <IconButton
              onClick={handleClose}
              size="small"
              className="info-dialog-close"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent className="info-dialog-content">
          <Paper elevation={1} className="info-content-paper">
            <Typography variant="h6" gutterBottom>
              📋 How to Use JTGen App
            </Typography>
            
            <Typography variant="body1" paragraph>
              JTGen App is a powerful tool for creating Jira tickets quickly and efficiently. 
              Follow these steps to get started:
            </Typography>

            <Typography variant="h6" gutterBottom>
              1. 📝 Fill Out the Form
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>Platform:</strong> Select WEB or APP based on where the issue occurs<br/>
              • <strong>Module/Page:</strong> Choose from the dropdown or enter a custom module name<br/>
              • <strong>Summary:</strong> Provide a brief description of the issue<br/>
              • <strong>Priority:</strong> Set the priority level (Highest, High, Medium, Low)<br/>
              • <strong>Component:</strong> Select the relevant component<br/>
              • <strong>Epic Link:</strong> Link to an existing epic (optional)
            </Typography>

            <Typography variant="h6" gutterBottom>
              2. 📖 Describe the Issue
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>Steps to Reproduce:</strong> Detailed steps to recreate the issue<br/>
              • <strong>Expected Behavior:</strong> What should happen<br/>
              • <strong>Actual Behavior:</strong> What actually happens<br/>
              • <strong>Note:</strong> Additional context or information (optional)
            </Typography>

            <Typography variant="h6" gutterBottom>
              3. 📎 Add Attachments (Optional)
            </Typography>
            <Typography variant="body2" paragraph>
              • Drag and drop files or click to select<br/>
              • Supported formats: Images (JPEG, PNG, GIF), PDF, Text files<br/>
              • Maximum file size: 10MB each
            </Typography>

            <Typography variant="h6" gutterBottom>
              4. 🎯 Create Your Ticket
            </Typography>
            <Typography variant="body2" paragraph>
              • Click <strong>"Preview Ticket"</strong> to review before creating<br/>
              • Click <strong>"Create Ticket"</strong> to submit to Jira<br/>
              • Use <strong>"History"</strong> to view previously created tickets<br/>
              • Use <strong>"Clear Form"</strong> to reset all fields
            </Typography>

            <Typography variant="h6" gutterBottom>
              💡 Pro Tips
            </Typography>
            <Typography variant="body2" paragraph>
              • Use the Module/Page dropdown for common modules, or type custom names<br/>
              • The form auto-saves your progress as you type<br/>
              • Check the History tab to see all your created tickets<br/>
              • Use Preview to catch any issues before submitting
            </Typography>

            <Typography variant="h6" gutterBottom>
              🔧 Troubleshooting
            </Typography>
            <Typography variant="body2" paragraph>
              • If you see connection errors, check your internet connection<br/>
              • Make sure all required fields are filled out (marked with *)<br/>
              • For file upload issues, check file size and format<br/>
              • Contact support if you encounter persistent issues
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions className="info-dialog-actions">
          <Button
            onClick={handleDownloadPDF}
            variant="contained"
            startIcon={<Download />}
            className="info-download-button"
          >
            📥 Download Manual
          </Button>
          <Button
            onClick={handleClose}
            variant="outlined"
            className="info-close-button"
          >
            {BUTTON_LABELS.CLOSE}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InfoButton;
