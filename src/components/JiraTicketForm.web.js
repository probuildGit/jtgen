import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Alert
} from '@mui/material';
import { useJiraTicket } from '../hooks/useJiraTicket.web.js';
import { useFileUpload } from '../hooks/useFileUpload';
import { useJamExtraction } from '../hooks/useJamExtraction.web.js';
import {
  PLATFORM_OPTIONS,
  PRIORITY_OPTIONS,
  COMPONENTS,
  EPICS,
  FORM_LABELS,
  FORM_PLACEHOLDERS,
  SECTION_TITLES
} from '../data/formData.web.js';
import FormField from './form/FormField.js';
import FormSection from './form/FormSection.js';
import ModuleField from './form/ModuleField.web.js';
import ActionButtons from './form/ActionButtons.web.js';
import AttachmentList from './form/AttachmentList.js';
import FileDropzone from './form/FileDropzone.web.js';
import SpellCheckTextField from './form/SpellCheckTextField.web.js';
import TicketPreview from './TicketPreview.web.js';
import TicketHistory from './TicketHistory.web.js';
import SuccessPopup from './SuccessPopup.web.js';
import LoadingOverlay from './LoadingOverlay.web.js';
import '../styles/formStyles.web.css';


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
    clearSuccess,
    submitTicket
  } = useJiraTicket();

  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [jamPopulatedFields, setJamPopulatedFields] = useState(new Set());

  // File upload hook
  const { getRootProps, getInputProps, isDragActive, handleRemoveFile } = useFileUpload(
    addAttachment,
    removeAttachment
  );

  // JAM extraction hook
  const { 
    extractJamData, 
    hasJamUrl, 
    isExtracting, 
    extractionError
  } = useJamExtraction();

  // Handle text changes with JAM URL detection
  const handleTextChange = async (field, value) => {
    // Update the field first
    updateTicketData(field, value);
    
    // Check if the text contains a JAM URL
    if (hasJamUrl(value)) {
      console.log('🔍 JAM FORM (WEB): JAM URL detected in field:', field);
      
      try {
        const jamData = await extractJamData(value);
        
        if (jamData.isValid) {
          console.log('🔍 JAM FORM (WEB): Auto-populating fields with JAM data:', jamData);
          
          // Track which fields are populated by JAM
          const populatedFields = new Set();
          
          // Always populate module and summary with JAM data
          if (jamData.module) {
            updateTicketData('module', jamData.module);
            populatedFields.add('module');
          }
          
          if (jamData.summary) {
            updateTicketData('summary', jamData.summary);
            populatedFields.add('summary');
          }
          
          // Add application URL if available
          if (jamData.applicationUrl) {
            console.log('🔍 JAM FORM (WEB): Setting applicationUrl:', jamData.applicationUrl);
            updateTicketData('applicationUrl', jamData.applicationUrl);
            populatedFields.add('applicationUrl');
          } else {
            console.log('🔍 JAM FORM (WEB): No applicationUrl found in JAM data');
          }
          
          // Update the JAM populated fields state
          setJamPopulatedFields(populatedFields);
          
          // Clear the JAM populated indicator after 10 seconds
          setTimeout(() => {
            setJamPopulatedFields(new Set());
          }, 10000);
        }
      } catch (error) {
        console.error('🔍 JAM FORM (WEB): Error extracting JAM data:', error);
      }
    }
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
    clearSuccess();
  };



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

        {extractionError && (
          <Alert severity="warning" className="form-alert">
            JAM Extraction Warning: {extractionError}
          </Alert>
        )}

        {isExtracting && (
          <Alert severity="info" className="form-alert">
            Extracting JAM content...
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
                <ModuleField
                  field="module"
                  value={ticketData.module}
                  onChange={updateTicketData}
                  required={true}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <SpellCheckTextField
                  field="summary"
                  label={FORM_LABELS.SUMMARY}
                  value={ticketData.summary}
                  onChange={updateTicketData}
                  placeholder={FORM_PLACEHOLDERS.SUMMARY}
                  required
                  spellCheckEnabled={true}
                  autoCorrectEnabled={true}
                  showSpellCheckIndicator={true}
                  isJamPopulated={jamPopulatedFields.has('summary')}
                />
              </Grid>
            </FormSection>


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
                <SpellCheckTextField
                  field="stepsToReproduce"
                  value={ticketData.stepsToReproduce}
                  onChange={handleTextChange}
                  label={FORM_LABELS.STEPS_TO_REPRODUCE}
                  placeholder={FORM_PLACEHOLDERS.STEPS_TO_REPRODUCE}
                  multiline={true}
                  rows={3}
                  required
                  spellCheckEnabled={true}
                  autoCorrectEnabled={true}
                  showSpellCheckIndicator={true}
                  isJamPopulated={jamPopulatedFields.has('stepsToReproduce')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SpellCheckTextField
                  field="expectedBehavior"
                  value={ticketData.expectedBehavior}
                  onChange={handleTextChange}
                  label={FORM_LABELS.EXPECTED_BEHAVIOR}
                  placeholder={FORM_PLACEHOLDERS.EXPECTED_BEHAVIOR}
                  multiline={true}
                  rows={3}
                  required
                  spellCheckEnabled={true}
                  autoCorrectEnabled={true}
                  showSpellCheckIndicator={true}
                  isJamPopulated={jamPopulatedFields.has('expectedBehavior')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SpellCheckTextField
                  field="actualBehavior"
                  value={ticketData.actualBehavior}
                  onChange={handleTextChange}
                  label={FORM_LABELS.ACTUAL_BEHAVIOR}
                  placeholder={FORM_PLACEHOLDERS.ACTUAL_BEHAVIOR}
                  multiline={true}
                  rows={3}
                  required
                  spellCheckEnabled={true}
                  autoCorrectEnabled={true}
                  showSpellCheckIndicator={true}
                  isJamPopulated={jamPopulatedFields.has('actualBehavior')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SpellCheckTextField
                  field="note"
                  value={ticketData.note}
                  onChange={handleTextChange}
                  label={FORM_LABELS.NOTE}
                  placeholder={FORM_PLACEHOLDERS.NOTE}
                  multiline={true}
                  rows={3}
                  spellCheckEnabled={true}
                  autoCorrectEnabled={true}
                  showSpellCheckIndicator={true}
                  isJamPopulated={jamPopulatedFields.has('note')}
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
        {success && success.ticketKey && (
          <SuccessPopup
            open={true}
            onClose={handleSuccessClose}
            successData={success}
          />
        )}
        
        {/* Loading Overlay */}
        <LoadingOverlay 
          open={loading} 
          message="Creating ticket..."
        />
      </Box>
    );
  };

export default JiraTicketForm;
