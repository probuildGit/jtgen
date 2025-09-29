// Import validation functions from centralized validation rules

export { 
  validateRequired, 
  validateEmail, 
  validateTicketData, 
  validateFile, 
  containsJamLink 
} from '../constants/validationRules';

// Data formatting helpers
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB');
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};



// Field validation class helper
export const getFieldValidationClass = (fieldName, value, isMandatory = false) => {
  const hasValue = value && value.toString().trim() !== '';
  
  if (isMandatory) {
    return hasValue ? 'form-field-mandatory-filled' : 'form-field-mandatory-empty';
  } else {
    return hasValue ? 'form-field-optional-filled' : 'form-field-optional-empty';
  }
};



// Clear corrupted history and reset
export const clearCorruptedHistory = () => {
  try {
    // Clear the ticket history from localStorage
    localStorage.removeItem('jiraTicketHistory');
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};




