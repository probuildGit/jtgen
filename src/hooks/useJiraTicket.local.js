import { useState, useCallback } from 'react';
import { createJiraTicket } from '../services/jiraApiService.local.js';
import { validateTicketData } from '../constants/validationRules';
import { extractErrorMessage } from '../utils/errorHandler';

export const useJiraTicket = () => {
  const [ticketData, setTicketData] = useState({
    platform: 'WEB', // Default to 'WEB'
    module: '',
    summary: '',
    priority: '',
    component: '',
    epicLink: '', // Keep as empty string for optional field
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    note: '',
    applicationUrl: '', // For JAM-extracted application URLs
    attachments: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Update ticket data
  const updateTicketData = useCallback((field, value) => {
    setTicketData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  }, []);

  // Add attachment
  const addAttachment = useCallback((file) => {
    setTicketData(prev => ({
      ...prev,
      attachments: [...prev.attachments, file]
    }));
  }, []);

  // Remove attachment
  const removeAttachment = useCallback((index) => {
    setTicketData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  }, []);

  // Clear form
  const clearForm = useCallback(() => {
    setTicketData({
      platform: 'WEB', // Reset to 'WEB'
      module: '',
      summary: '',
      priority: '',
      component: '',
      epicLink: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      note: '',
      applicationUrl: '',
      attachments: []
    });
    setError(null);
    setSuccess(null);
  }, []);

  // Clear success message
  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  // Submit ticket
  const submitTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form data
      const validation = validateTicketData(ticketData);
      if (!validation.isValid) {
        setError(validation.errors);
        setLoading(false);
        return;
      }

      // Create ticket (includes attachment handling)
      const createdTicket = await createJiraTicket(ticketData);

      const successMessage = ticketData.attachments.length > 0 
        ? 'Ticket created successfully! Attachments uploaded and embedded in description.'
        : 'Ticket created successfully!';
      
      setSuccess({
        message: successMessage,
        ticketKey: createdTicket.data.key,
        ticketUrl: `https://probuild.atlassian.net/browse/${createdTicket.data.key}`
      });

      // Clear form data but keep success message
      setTicketData({
        platform: 'WEB', // Reset to 'WEB' after submission
        module: '',
        summary: '',
        priority: '',
        component: '',
        epicLink: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        note: '',
        attachments: []
      });
      setError(null);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Submit ticket error:', err);
      
      // Extract error message using utility
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ticketData]);

  return {
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
  };
};

export default useJiraTicket;
