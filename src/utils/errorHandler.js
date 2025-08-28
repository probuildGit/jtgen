// Error handling utilities

// Extract error message from various error formats
export const extractErrorMessage = (error) => {
  if (error.response?.data?.errorMessages) {
    return error.response.data.errorMessages.join(', ');
  }
  
  if (error.response?.data?.errors) {
    return Object.entries(error.response.data.errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Unknown error occurred';
};

// Handle specific error types
export const handleSpecificErrors = (errorMessage, ticketData) => {
  if (errorMessage.includes('INVALID_INPUT') && ticketData.epicLink) {
    return `Invalid Epic Link "${ticketData.epicLink}". This Epic might not be configured to accept child issues or may have been deleted. Please try a different Epic or create the ticket without an Epic Link.`;
  }
  
  return errorMessage;
};

// Log error with context
export const logError = (context, error, additionalData = {}) => {
  console.error(`${context} error:`, error);
  
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
  }
  
  if (Object.keys(additionalData).length > 0) {
    console.error('Additional data:', additionalData);
  }
};
