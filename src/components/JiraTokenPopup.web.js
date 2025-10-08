import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { testJiraConnectivity } from '../services/jiraApiService.web.js';
import '../styles/infoButtonStyles.css';

const JiraTokenPopup = ({ open, onClose }) => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savedToken, setSavedToken] = useState('');

  // Load saved token on component mount
  useEffect(() => {
    const saved = localStorage.getItem('jiraToken');
    if (saved) {
      setSavedToken(saved);
      setToken(saved);
    }
  }, []);

  const handleTokenChange = (event) => {
    setToken(event.target.value);
    setTestResult(null);
  };

  const handleToggleVisibility = () => {
    setShowToken(!showToken);
  };

  const handleTestToken = async () => {
    if (!token.trim()) {
      setTestResult({ success: false, message: 'Please enter a token' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Temporarily save token for testing
      localStorage.setItem('jiraToken', token);
      
      const result = await testJiraConnectivity();
      
      if (result.success) {
        setTestResult({ success: true, message: 'Token is valid and working!' });
        setSavedToken(token);
      } else {
        setTestResult({ success: false, message: result.error || 'Token test failed' });
        localStorage.removeItem('jiraToken');
      }
    } catch (error) {
      setTestResult({ success: false, message: `Test failed: ${error.message}` });
      localStorage.removeItem('jiraToken');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveToken = () => {
    if (token.trim()) {
      localStorage.setItem('jiraToken', token);
      setSavedToken(token);
      setTestResult({ success: true, message: 'Token saved successfully!' });
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem('jiraToken');
    setToken('');
    setSavedToken('');
    setTestResult(null);
  };

  const handleClose = () => {
    setTestResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      className="jira-token-dialog"
      PaperProps={{
        className: 'jira-token-dialog-paper'
      }}
    >
      <DialogTitle className="jira-token-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">
            JIRA API Token Configuration
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Enter your JIRA API token to enable ticket creation
        </Typography>
      </DialogTitle>

      <DialogContent dividers className="jira-token-dialog-content">
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            To get your JIRA API token:
          </Typography>
          <Box component="ol" pl={2} mb={2}>
            <li>Go to your JIRA account settings</li>
            <li>Navigate to Security → API tokens</li>
            <li>Create a new API token</li>
            <li>Copy the token and paste it below</li>
          </Box>
        </Box>

        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel htmlFor="jira-token-input">JIRA API Token</InputLabel>
          <OutlinedInput
            id="jira-token-input"
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={handleTokenChange}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle token visibility"
                  onClick={handleToggleVisibility}
                  edge="end"
                >
                  {showToken ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="JIRA API Token"
            placeholder="Enter your JIRA API token"
          />
        </FormControl>

        {savedToken && (
          <Alert severity="success" className="jira-token-saved-alert">
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon fontSize="small" />
              <Typography variant="body2">
                Token is saved and ready to use
              </Typography>
            </Box>
          </Alert>
        )}

        {testResult && (
          <Alert 
            severity={testResult.success ? 'success' : 'error'}
            className="jira-token-test-alert"
          >
            <Box display="flex" alignItems="center" gap={1}>
              {testResult.success ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <ErrorIcon fontSize="small" />
              )}
              <Typography variant="body2">
                {testResult.message}
              </Typography>
            </Box>
          </Alert>
        )}
      </DialogContent>

      <DialogActions className="jira-token-dialog-actions">
        <Button onClick={handleClearToken} color="error" variant="outlined">
          Clear Token
        </Button>
        <Button onClick={handleTestToken} disabled={!token.trim() || isTesting} variant="outlined">
          {isTesting ? 'Testing...' : 'Test Token'}
        </Button>
        <Button onClick={handleSaveToken} disabled={!token.trim()} variant="contained" color="primary">
          Save Token
        </Button>
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JiraTokenPopup;
