import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { formatFileSize } from '../../utils/formHelpers';

const AttachmentList = ({ attachments, onRemoveAttachment }) => {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <Box className="form-attachments-list">
      <Typography variant="subtitle2" gutterBottom className="form-attachment-title">
        Attached Files:
      </Typography>
      {attachments.map((file, index) => (
        <Chip
          key={index}
          label={`${file.name} (${formatFileSize(file.size)})`}
          onDelete={() => onRemoveAttachment(index)}
          deleteIcon={<DeleteIcon />}
          className="form-attachment-chip"
        />
      ))}
    </Box>
  );
};

export default AttachmentList;
