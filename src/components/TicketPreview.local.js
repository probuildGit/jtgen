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
import { PRIORITY_OPTIONS, COMPONENTS, EPICS } from '../data/formData.local.js';
import {
  TEAM_MEMBERS,
  DIALOG_TITLES,
  SECTION_TITLES,
  BUTTON_LABELS
} from '../data/formData.local.js';

const TicketPreview = ({ open, onClose, ticketData, attachments = [] }) => {
  if (!ticketData) return null;

  const getPriorityLabel = (priority) => {
    const option = PRIORITY_OPTIONS.find(opt => opt.value === priority);
    return option ? option.label : priority;
  };

  const getComponentLabel = (component) => {
    const comp = COMPONENTS.find(c => c.value === component);
    return comp ? comp.label : component;
  };

  const getEpicLabel = (epic) => {
    const epicOption = EPICS.find(e => e.value === epic);
    return epicOption ? epicOption.label : epic;
  };

  const getAssigneeLabel = (assignee) => {
    const member = TEAM_MEMBERS.find(m => m.value === assignee);
    return member ? member.label : assignee;
  };

  const hasJamLink = containsJamLink(ticketData.summary || '') || 
                     containsJamLink(ticketData.description || '');

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            {DIALOG_TITLES.PREVIEW}
          </Typography>
          {hasJamLink && (
            <Chip 
              label="JAM Link Detected" 
              color="primary" 
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              {SECTION_TITLES.BASIC_INFO}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Platform
                </Typography>
                <Typography variant="body1">
                  {ticketData.platform || 'Not specified'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Module
                </Typography>
                <Typography variant="body1">
                  {ticketData.module || 'Not specified'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Priority
                </Typography>
                <Typography variant="body1">
                  {getPriorityLabel(ticketData.priority)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Component
                </Typography>
                <Typography variant="body1">
                  {getComponentLabel(ticketData.component)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Summary */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Summary
            </Typography>
            <Typography variant="body1">
              {ticketData.summary || 'No summary provided'}
            </Typography>
          </Paper>

          {/* Description */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {ticketData.description || 'No description provided'}
            </Typography>
          </Paper>

          {/* Additional Information */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Additional Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Epic
                </Typography>
                <Typography variant="body1">
                  {getEpicLabel(ticketData.epic)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Assignee
                </Typography>
                <Typography variant="body1">
                  {getAssigneeLabel(ticketData.assignee)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Attachments ({attachments.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {attachments.map((file, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {BUTTON_LABELS.CLOSE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketPreview;
