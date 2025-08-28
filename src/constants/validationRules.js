import { EPICS } from '../data/formData.js';

// Validation Rules and Configuration
// Centralized validation logic for the Jira Ticket Generator App

// File validation constants
export const FILE_VALIDATION = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/plain'
  ],
  ALLOWED_EXTENSIONS: ['.jpeg', '.jpg', '.png', '.gif', '.pdf', '.txt']
};

// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Jam link detection patterns
export const JAM_LINK_PATTERNS = [
  /https?:\/\/.*\.jam\.ai/i,
  /https?:\/\/jam\.ai/i,
  /https?:\/\/.*\.jam\.com/i,
  /https?:\/\/jam\.com/i,
  /https?:\/\/.*\.jam\.dev/i,
  /https?:\/\/jam\.dev/i
];

// Required field validation rules
export const REQUIRED_FIELDS = {
  PLATFORM: 'platform',
  MODULE: 'module',
  SUMMARY: 'summary',
  PRIORITY: 'priority',
  COMPONENT: 'component'
};

// Error messages for validation
export const VALIDATION_MESSAGES = {
  REQUIRED: {
    PLATFORM: 'Platform is required',
    MODULE: 'Module/Page is required',
    SUMMARY: 'Summary is required',
    PRIORITY: 'Priority is required',
    COMPONENT: 'Component is required'
  },
  FILE: {
    SIZE_TOO_LARGE: 'File size must be less than 10MB',
    TYPE_NOT_SUPPORTED: 'File type not supported',
    INVALID_FILE: 'Invalid file'
  },
  EMAIL: {
    INVALID_FORMAT: 'Please enter a valid email address'
  }
};

// Validation functions
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

export const validateTicketData = (ticketData) => {
  const errors = {};

  // Required fields validation
  if (!validateRequired(ticketData.platform)) {
    errors.platform = VALIDATION_MESSAGES.REQUIRED.PLATFORM;
  }

  if (!validateRequired(ticketData.module)) {
    errors.module = VALIDATION_MESSAGES.REQUIRED.MODULE;
  }

  if (!validateRequired(ticketData.summary)) {
    errors.summary = VALIDATION_MESSAGES.REQUIRED.SUMMARY;
  }

  if (!validateRequired(ticketData.priority)) {
    errors.priority = VALIDATION_MESSAGES.REQUIRED.PRIORITY;
  }

  if (!validateRequired(ticketData.component)) {
    errors.component = VALIDATION_MESSAGES.REQUIRED.COMPONENT;
  }

  // Validate Epic Link if provided
  if (ticketData.epicLink && ticketData.epicLink.trim() !== '') {
    const validEpicKeys = EPICS.map(epic => epic.key);
    if (!validEpicKeys.includes(ticketData.epicLink)) {
      errors.epicLink = `Invalid Epic Link. Please select a valid Epic from the dropdown.`;
    }
    // Note: Some Epics might not be usable as parents due to Jira configuration
    // This will be handled by the API error response
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: VALIDATION_MESSAGES.FILE.INVALID_FILE };
  }

  if (file.size > FILE_VALIDATION.MAX_SIZE) {
    return { isValid: false, error: VALIDATION_MESSAGES.FILE.SIZE_TOO_LARGE };
  }

  if (!FILE_VALIDATION.ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, error: VALIDATION_MESSAGES.FILE.TYPE_NOT_SUPPORTED };
  }

  return { isValid: true };
};

// Helper function to detect Jam links in text
export const containsJamLink = (text) => {
  if (!text) return false;
  return JAM_LINK_PATTERNS.some(pattern => pattern.test(text));
};

// Validation utilities
export const getFieldValidation = (fieldName) => {
  const fieldValidations = {
    platform: {
      required: true,
      message: VALIDATION_MESSAGES.REQUIRED.PLATFORM
    },
    module: {
      required: true,
      message: VALIDATION_MESSAGES.REQUIRED.MODULE
    },
    summary: {
      required: true,
      message: VALIDATION_MESSAGES.REQUIRED.SUMMARY
    },
    priority: {
      required: true,
      message: VALIDATION_MESSAGES.REQUIRED.PRIORITY
    },
    component: {
      required: true,
      message: VALIDATION_MESSAGES.REQUIRED.COMPONENT
    },
    epicLink: {
      required: false
    },
    stepsToReproduce: {
      required: false
    },
    expectedBehavior: {
      required: false
    },
    actualBehavior: {
      required: false
    },
    note: {
      required: false
    }
  };

  return fieldValidations[fieldName] || { required: false };
};

// Batch validation for multiple fields
export const validateFields = (data, fieldsToValidate = Object.keys(REQUIRED_FIELDS)) => {
  const errors = {};
  
  fieldsToValidate.forEach(field => {
    const validation = getFieldValidation(field);
    if (validation.required && !validateRequired(data[field])) {
      errors[field] = validation.message;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
