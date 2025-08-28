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
  Divider,
  Chip
} from '@mui/material';
import { formatFileSize } from '../utils/formHelpers';
import { containsJamLink } from '../constants/validationRules';
import { PRIORITY_OPTIONS, COMPONENTS, EPICS } from '../data/formData';
import {
  TEAM_MEMBERS,
  DIALOG_TITLES,
  SECTION_TITLES,
  BUTTON_LABELS
} from '../data/formData';
import '../styles/previewStyles.css';

const TicketPreview = ({ open, onClose, ticketData, onConfirm }) => {

  const summary = `${ticketData.platform} - ${ticketData.module} - ${ticketData.summary}`;

  // Helper functions to get actual text values
  const getPriorityLabel = (priorityId) => {
    const priority = PRIORITY_OPTIONS.find(p => p.value === priorityId);
    return priority ? priority.label : priorityId;
  };

  const getComponentName = (componentId) => {
    const component = COMPONENTS.find(c => c.id === componentId);
    return component ? `${componentId} - ${component.name}` : componentId;
  };

  const getEpicName = (epicKey) => {
    const epic = EPICS.find(e => e.key === epicKey);
    return epic ? `${epic.key} - ${epic.name}` : epicKey;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      className="form-preview-dialog"
      PaperProps={{
        className: 'form-preview-dialog-paper'
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" className="form-preview-dialog-title">
          {DIALOG_TITLES.PREVIEW.TITLE}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {DIALOG_TITLES.PREVIEW.SUBTITLE}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Paper elevation={1} className="form-preview-paper">
          <Typography variant="h6" gutterBottom color="primary">
            {SECTION_TITLES.SUMMARY}
          </Typography>
          <Typography variant="body1" className="form-preview-summary">
            {summary}
          </Typography>
          
          <Divider className="form-preview-divider" />
          
          <Typography variant="subtitle1" gutterBottom color="primary">
            {SECTION_TITLES.TICKET_DETAILS}
          </Typography>
          
          <Box className="form-preview-grid">
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Platform</Typography>
              <Typography variant="body2">{ticketData.platform}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Module/Page</Typography>
              <Typography variant="body2">{ticketData.module}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
              <Typography variant="body2">{getPriorityLabel(ticketData.priority)}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Component</Typography>
              <Typography variant="body2">{ticketData.component ? getComponentName(ticketData.component) : 'None'}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Epic Link</Typography>
              <Typography variant="body2">{ticketData.epicLink ? getEpicName(ticketData.epicLink) : 'None'}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Assignee</Typography>
              <Typography variant="body2">{TEAM_MEMBERS.ASSIGNEE.emailAddress}</Typography>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={1} className="form-preview-content-paper">
          <Typography variant="subtitle1" gutterBottom color="primary">
            {SECTION_TITLES.DESCRIPTION_PREVIEW}
          </Typography>
          

          
                    <Box className="form-preview-description">
            <Typography variant="subtitle2" className="form-preview-section-title">
              Description:
            </Typography>
            <Typography variant="body2" className="form-preview-section-content">
              {summary}
            </Typography>
            
            {ticketData.stepsToReproduce && (
              <>
                <Typography variant="subtitle2" className="form-preview-section-title">
                  {containsJamLink(ticketData.stepsToReproduce) ? 'JAM:' : 'Steps to Reproduce:'}
                </Typography>
                <Typography variant="body2" className="form-preview-section-content">
                  {ticketData.stepsToReproduce}
                </Typography>
              </>
            )}
            
            {ticketData.expectedBehavior && (
              <>
                <Typography variant="subtitle2" className="form-preview-section-title">
                  Expected Behavior:
                </Typography>
                <Typography variant="body2" className="form-preview-section-content">
                  {ticketData.expectedBehavior}
                </Typography>
              </>
            )}
            
            {ticketData.actualBehavior && (
              <>
                <Typography variant="subtitle2" className="form-preview-section-title">
                  {containsJamLink(ticketData.actualBehavior) ? 'JAM:' : 'Actual Behavior:'}
                </Typography>
                <Typography variant="body2" className="form-preview-section-content">
                  {ticketData.actualBehavior}
                </Typography>
              </>
            )}
            
            {ticketData.note && (
              <>
                <Typography variant="subtitle2" className="form-preview-section-title">
                  Note:
                </Typography>
                <Typography variant="body2" className="form-preview-section-content">
                  {ticketData.note}
                </Typography>
              </>
            )}
            
            {ticketData.attachments.length > 0 && (
              <>
                <Typography variant="subtitle2" className="form-preview-section-title">
                  Attachments:
                </Typography>
                <Box className="form-preview-attachments">
                  {ticketData.attachments.map((file, index) => {
                    // Check if it's an image file
                    const isImage = file.type.startsWith('image/');
                    
                    return (
                      <Box key={index} className="form-preview-attachment-item">
                        {isImage ? (
                          // Display image preview
                          <Box className="form-preview-image-container">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="form-preview-embedded-image"
                              onLoad={(e) => {
                                // Clean up the object URL after loading
                                setTimeout(() => URL.revokeObjectURL(e.target.src), 1000);
                              }}
                            />
                            <Typography variant="caption" className="form-preview-image-caption">
                              {file.name} ({formatFileSize(file.size)})
                            </Typography>
                          </Box>
                        ) : (
                          // Display non-image files as chips
                          <Chip
                            label={`${file.name} (${formatFileSize(file.size)})`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
            
            <Typography variant="subtitle2" className="form-preview-date">
              Date:
            </Typography>
            <Typography variant="body2" className="form-preview-section-content">
              {new Date().toLocaleDateString('en-GB')}
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
      
      <DialogActions className="form-preview-actions">
        <Button onClick={onClose} variant="outlined">
          {BUTTON_LABELS.BACK_TO_FORM}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          {BUTTON_LABELS.CREATE_TICKET}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketPreview;
