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
  MODULE_OPTIONS,
  FORM_LABELS,
  FORM_PLACEHOLDERS,
  SECTION_TITLES
} from '../data/formData';
import {
  FormField,
  FormSection,
  CustomModuleInput,
  ActionButtons,
  AttachmentList,
  FileDropzone
} from './form';
import TicketPreview from './TicketPreview';
import TicketHistory from './TicketHistory';
import SuccessPopup from './SuccessPopup';
import LoadingOverlay from './LoadingOverlay';
import '../styles/formStyles.css';


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

  const [showCustomModule, setShowCustomModule] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // File upload hook
  const { getRootProps, getInputProps, isDragActive, handleRemoveFile } = useFileUpload(
    addAttachment,
    removeAttachment
  );

  const handleModuleChange = (value) => {
    if (value === 'custom') {
      setShowCustomModule(true);
      updateTicketData('module', '');
    } else {
      setShowCustomModule(false);
      updateTicketData('module', value);
    }
  };

  const handleCustomModuleSubmit = (customModule) => {
    updateTicketData('module', customModule);
    setShowCustomModule(false);
  };

  const handleCustomModuleCancel = () => {
    setShowCustomModule(false);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
  };

  const handlePreviewConfirm = () => {
    setShowPreview(false);
    submitTicket();
  };

  const handleHistoryOpen = () => {
    setShowHistory(true);
  };

  const handleHistoryClose = () => {
    setShowHistory(false);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  // Show success popup when success is set
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);



  return (
    <Box className="form-container">
      <Paper elevation={3} className="form-paper">
        <Typography variant="h5" gutterBottom align="center" color="primary" className="form-title">
          JTGen - Jira Ticket Generator
        </Typography>
        <Typography variant="body2" gutterBottom align="center" color="text.secondary" className="form-subtitle">
          Create Bug Tickets for ProBuild Project
        </Typography>

        {error && (
          <Alert severity="error" className="form-alert">
            {typeof error === 'object' ? Object.values(error).join(', ') : error}
          </Alert>
        )}



        <form onSubmit={(e) => { e.preventDefault(); submitTicket(); }}>
          <Grid container className="form-grid">
            {/* Summary Section */}
            <FormSection title="Summary">
              <Grid item xs={12} sm={4}>
                <FormField
                  type="select"
                  field="platform"
                  value={ticketData.platform}
                  onChange={updateTicketData}
                  label="Platform"
                  required={true}
                  options={PLATFORM_OPTIONS}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormField
                  type="select"
                  field="module"
                  value={ticketData.module}
                  onChange={(field, value) => {
                    if (value === 'custom') {
                      handleModuleChange(value);
                    } else {
                      updateTicketData(field, value);
                    }
                  }}
                  label={FORM_LABELS.MODULE_PAGE}
                  required={true}
                  options={[...MODULE_OPTIONS.map(module => ({ value: module, label: module })), { value: 'custom', label: '+ Add Custom Module' }]}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormField
                  type="text"
                  field="summary"
                  value={ticketData.summary}
                  onChange={updateTicketData}
                  label={FORM_LABELS.SUMMARY}
                  placeholder={FORM_PLACEHOLDERS.SUMMARY}
                  required={true}
                />
              </Grid>
            </FormSection>

            {showCustomModule && (
              <Grid item xs={12}>
                <CustomModuleInput
                  onSubmit={handleCustomModuleSubmit}
                  onCancel={handleCustomModuleCancel}
                />
              </Grid>
            )}

            {/* Basic Fields */}
            <FormSection title="">
              <Grid item xs={12} sm={4}>
                <FormField
                  type="select"
                  field="priority"
                  value={ticketData.priority}
                  onChange={updateTicketData}
                  label="Priority"
                  required={true}
                  options={PRIORITY_OPTIONS}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormField
                  type="select"
                  field="component"
                  value={ticketData.component}
                  onChange={updateTicketData}
                  label="Component"
                  required={true}
                  options={COMPONENTS}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormField
                  type="select"
                  field="epicLink"
                  value={ticketData.epicLink}
                  onChange={updateTicketData}
                  label={FORM_LABELS.EPIC_LINK}
                  required={true}
                  options={[{ value: '', label: 'None' }, ...EPICS]}
                />
              </Grid>
            </FormSection>

            {/* Description Fields */}
            <FormSection title={SECTION_TITLES.DESCRIPTION_DETAILS}>
              <Grid item xs={12} sm={6}>
                <FormField
                  type="text"
                  field="stepsToReproduce"
                  value={ticketData.stepsToReproduce}
                  onChange={updateTicketData}
                  label={FORM_LABELS.STEPS_TO_REPRODUCE}
                  placeholder={FORM_PLACEHOLDERS.STEPS_TO_REPRODUCE}
                  multiline={true}
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormField
                  type="text"
                  field="expectedBehavior"
                  value={ticketData.expectedBehavior}
                  onChange={updateTicketData}
                  label={FORM_LABELS.EXPECTED_BEHAVIOR}
                  placeholder={FORM_PLACEHOLDERS.EXPECTED_BEHAVIOR}
                  multiline={true}
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormField
                  type="text"
                  field="actualBehavior"
                  value={ticketData.actualBehavior}
                  onChange={updateTicketData}
                  label={FORM_LABELS.ACTUAL_BEHAVIOR}
                  placeholder={FORM_PLACEHOLDERS.ACTUAL_BEHAVIOR}
                  multiline={true}
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormField
                  type="text"
                  field="note"
                  value={ticketData.note}
                  onChange={updateTicketData}
                  label={FORM_LABELS.NOTE}
                  placeholder={FORM_PLACEHOLDERS.NOTE}
                  multiline={true}
                  rows={3}
                />
              </Grid>
            </FormSection>

            {/* Attachments */}
            <FormSection title="" showDivider={false}>
              <Grid item xs={12}>
                <FileDropzone
                  getRootProps={getRootProps}
                  getInputProps={getInputProps}
                  isDragActive={isDragActive}
                />
                <AttachmentList
                  attachments={ticketData.attachments}
                  onRemoveAttachment={handleRemoveFile}
                />
              </Grid>
            </FormSection>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <ActionButtons
                loading={loading}
                isOffline={isOffline}
                onClear={clearForm}
                onHistory={handleHistoryOpen}
                onPreview={handlePreview}
                onSubmit={submitTicket}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Ticket Preview Dialog */}
      <TicketPreview
        open={showPreview}
        onClose={handlePreviewClose}
        ticketData={ticketData}
        onConfirm={handlePreviewConfirm}
      />
      
      {/* Ticket History Dialog */}
              <TicketHistory 
          open={showHistory} 
          onClose={handleHistoryClose} 
        />
        <SuccessPopup
          open={showSuccess}
          onClose={handleSuccessClose}
          successData={success}
        />
        
        {/* Loading Overlay */}
        <LoadingOverlay 
          open={loading} 
          message="Creating ticket..."
        />
      </Box>
    );
  };

export default JiraTicketForm;
