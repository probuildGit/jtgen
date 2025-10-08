import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Alert
} from '@mui/material';
import { useJiraTicket } from '../hooks/useJiraTicket';
import { useFileUpload } from '../hooks/useFileUpload';
import {
  PLATFORM_OPTIONS,
  PRIORITY_OPTIONS,
  COMPONENTS,
  EPICS,
  FORM_LABELS,
  FORM_PLACEHOLDERS,
  SECTION_TITLES
} from '../data/formData.local.js';
import FormField from './form/FormField.js';
import FormSection from './form/FormSection.js';
import ModuleField from './form/ModuleField.local.js';
import ActionButtons from './form/ActionButtons.local.js';
import AttachmentList from './form/AttachmentList.js';
import FileDropzone from './form/FileDropzone.local.js';
import TicketPreview from './TicketPreview.local.js';
import TicketHistory from './TicketHistory.local.js';
import SuccessPopup from './SuccessPopup.local.js';
import LoadingOverlay from './LoadingOverlay.local.js';
import '../styles/formStyles.local.css';


const JiraTicketForm = ({ isOffline = false }) => {
  const {
    ticketData,
    loading,
    error,
    success,
    updateTicketData,
    addAttachment,
    removeAttachment,
    clearForm,
    submitTicket
  } = useJiraTicket();

  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    files,
    addFile,
    removeFile,
    clearFiles
  } = useFileUpload();

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const result = await submitTicket();
      if (result && result.success) {
        setShowSuccess(true);
        clearForm();
        clearFiles();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // Handle preview
  const handlePreview = () => {
    setShowPreview(true);
  };

  // Handle history
  const handleHistory = () => {
    setShowHistory(true);
  };

  // Handle form clearing
  const handleClearForm = () => {
    clearForm();
    clearFiles();
  };

  // Handle file operations
  const handleAddFile = (file) => {
    addFile(file);
    addAttachment(file);
  };

  const handleRemoveFile = (index) => {
    removeFile(index);
    removeAttachment(index);
  };

  // Close dialogs
  const handleClosePreview = () => setShowPreview(false);
  const handleCloseHistory = () => setShowHistory(false);
  const handleCloseSuccess = () => setShowSuccess(false);

  // Handle success popup close
  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  return (
    <Box className="form-container">
      <Paper elevation={3} className="form-paper">
        <Typography variant="h4" component="h1" className="form-title">
          🎫 Jira Ticket Generator
        </Typography>
        
        {error && (
          <Alert severity="error" className="form-alert">
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="form-alert">
            {success}
          </Alert>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <Grid container spacing={3}>
            {/* Summary Section */}
            <FormSection title={SECTION_TITLES.SUMMARY}>
              <Grid item xs={12} md={6}>
                <FormField
                  label={FORM_LABELS.PLATFORM}
                  value={ticketData.platform}
                  onChange={(value) => updateTicketData('platform', value)}
                  type="select"
                  options={PLATFORM_OPTIONS}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <ModuleField
                  label={FORM_LABELS.MODULE_PAGE}
                  value={ticketData.module}
                  onChange={(value) => updateTicketData('module', value)}
                  placeholder={FORM_PLACEHOLDERS.CUSTOM_MODULE}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormField
                  label={FORM_LABELS.SUMMARY}
                  value={ticketData.summary}
                  onChange={(value) => updateTicketData('summary', value)}
                  placeholder={FORM_PLACEHOLDERS.SUMMARY}
                  required
                />
              </Grid>
            </FormSection>

            {/* Ticket Details Section */}
            <FormSection title={SECTION_TITLES.TICKET_DETAILS}>
              <Grid item xs={12} md={6}>
                <FormField
                  label={FORM_LABELS.PRIORITY}
                  value={ticketData.priority}
                  onChange={(value) => updateTicketData('priority', value)}
                  type="select"
                  options={PRIORITY_OPTIONS}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormField
                  label={FORM_LABELS.COMPONENT}
                  value={ticketData.component}
                  onChange={(value) => updateTicketData('component', value)}
                  type="select"
                  options={COMPONENTS}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormField
                  label={FORM_LABELS.EPIC_LINK}
                  value={ticketData.epicLink}
                  onChange={(value) => updateTicketData('epicLink', value)}
                  type="select"
                  options={EPICS}
                />
              </Grid>
            </FormSection>

            {/* Description Details Section */}
            <FormSection title={SECTION_TITLES.DESCRIPTION_DETAILS}>
              <Grid item xs={12}>
                <FormField
                  label={FORM_LABELS.STEPS_TO_REPRODUCE}
                  value={ticketData.stepsToReproduce}
                  onChange={(value) => updateTicketData('stepsToReproduce', value)}
                  placeholder={FORM_PLACEHOLDERS.STEPS_TO_REPRODUCE}
                  type="textarea"
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormField
                  label={FORM_LABELS.EXPECTED_BEHAVIOR}
                  value={ticketData.expectedBehavior}
                  onChange={(value) => updateTicketData('expectedBehavior', value)}
                  placeholder={FORM_PLACEHOLDERS.EXPECTED_BEHAVIOR}
                  type="textarea"
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormField
                  label={FORM_LABELS.ACTUAL_BEHAVIOR}
                  value={ticketData.actualBehavior}
                  onChange={(value) => updateTicketData('actualBehavior', value)}
                  placeholder={FORM_PLACEHOLDERS.ACTUAL_BEHAVIOR}
                  type="textarea"
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormField
                  label={FORM_LABELS.NOTE}
                  value={ticketData.note}
                  onChange={(value) => updateTicketData('note', value)}
                  placeholder={FORM_PLACEHOLDERS.NOTE}
                  type="textarea"
                />
              </Grid>
            </FormSection>

            {/* Attachments Section */}
            <FormSection title={SECTION_TITLES.ATTACHMENTS}>
              <Grid item xs={12}>
                <FileDropzone onFileAdd={handleAddFile} />
                <AttachmentList 
                  files={files} 
                  onRemove={handleRemoveFile}
                />
              </Grid>
            </FormSection>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <ActionButtons
                onPreview={handlePreview}
                onHistory={handleHistory}
                onSubmit={handleSubmit}
                onClear={handleClearForm}
                loading={loading}
                isOffline={isOffline}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Dialogs */}
      {showPreview && (
        <TicketPreview
          ticketData={ticketData}
          files={files}
          onClose={handleClosePreview}
        />
      )}

      {showHistory && (
        <TicketHistory
          onClose={handleCloseHistory}
        />
      )}

      {showSuccess && (
        <SuccessPopup
          onClose={handleSuccessClose}
        />
      )}

      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}
    </Box>
  );
};

export default JiraTicketForm;
