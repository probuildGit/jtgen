import React from 'react';
import { Box, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DROPZONE_CONFIG } from '../../data/formData';

const FileDropzone = ({ getRootProps, getInputProps, isDragActive }) => {
  return (
    <Box
      {...getRootProps()}
      className={`form-dropzone ${isDragActive ? 'active' : ''}`}
    >
      <input {...getInputProps()} />
      <AddIcon className="form-dropzone-icon" />
      <Typography className="form-dropzone-text">
        {isDragActive
          ? DROPZONE_CONFIG.TEXT.DRAG_ACTIVE
          : DROPZONE_CONFIG.TEXT.DRAG_INACTIVE
        }
      </Typography>
      <Typography variant="caption" color="text.secondary" className="form-dropzone-caption">
        {DROPZONE_CONFIG.TEXT.CAPTION}
      </Typography>
    </Box>
  );
};

export default FileDropzone;
