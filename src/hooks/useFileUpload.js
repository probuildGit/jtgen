import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateFile } from '../utils/formHelpers';

export const useFileUpload = (onAddFile, onRemoveFile) => {
  // Dropzone configuration
  const dropzoneConfig = {
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach(file => {
        const validation = validateFile(file);
        if (validation.isValid) {
          onAddFile(file);
        } else {
          alert(validation.error);
        }
      });
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig);

  // Remove file handler
  const handleRemoveFile = useCallback((index) => {
    onRemoveFile(index);
  }, [onRemoveFile]);

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveFile
  };
};
