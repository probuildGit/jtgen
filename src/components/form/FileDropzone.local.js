// FileDropzone component for local environment
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const FileDropzone = ({ onFilesAdded, maxFiles = 5, maxSize = 10 * 1024 * 1024 }) => {
  const onDrop = useCallback((acceptedFiles) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.log'],
      'application/json': ['.json']
    }
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 3,
        textAlign: 'center',
        cursor: 'pointer',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover'
        }
      }}
    >
      <input {...getInputProps()} />
      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        or click to select files
      </Typography>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Max {maxFiles} files, up to {Math.round(maxSize / (1024 * 1024))}MB each
      </Typography>
    </Paper>
  );
};

export default FileDropzone;
