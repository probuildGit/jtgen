import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const ApiConfigPopup = ({ open, onClose }) => {
  const [config, setConfig] = useState({
    jiraToken: '',
    email: '',
    baseUrl: 'https://probuild.atlassian.net',
    projectKey: 'PB',
    useCustomCredentials: false
  });
  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved configuration on component mount
  useEffect(() => {
    if (open) {
      const savedConfig = localStorage.getItem('jiraApiConfig');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setConfig(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Error loading saved API config:', error);
        }
      }
    }
  }, [open]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSwitchChange = (field) => (event) => {
    setConfig(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const validateConfig = () => {
    const newErrors = {};
    
    if (config.useCustomCredentials) {
      if (!config.jiraToken.trim()) {
        newErrors.jiraToken = 'Jira Token is required';
      }
      if (!config.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(config.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!config.baseUrl.trim()) {
        newErrors.baseUrl = 'Base URL is required';
      }
      if (!config.projectKey.trim()) {
        newErrors.projectKey = 'Project Key is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateConfig()) {
      return;
    }

    try {
      // Save to localStorage
      localStorage.setItem('jiraApiConfig', JSON.stringify(config));
      
      // Update global config if custom credentials are enabled
      if (config.useCustomCredentials) {
        // Update the global CONFIG object
        if (window.JTGenConfig) {
          window.JTGenConfig.JIRA.AUTH_TOKEN = config.jiraToken;
          window.JTGenConfig.JIRA.EMAIL = config.email;
          window.JTGenConfig.JIRA.BASE_URL = config.baseUrl;
          window.JTGenConfig.JIRA.PROJECT_KEY = config.projectKey;
          window.JTGenConfig.JIRA.DEMO_MODE = false;
        }
      } else {
        // Reset to demo mode
        if (window.JTGenConfig) {
          window.JTGenConfig.JIRA.DEMO_MODE = true;
        }
      }
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving API config:', error);
      setErrors({ general: 'Failed to save configuration' });
    }
  };

  const handleCancel = () => {
    setErrors({});
    setSaveSuccess(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <SaveIcon color="primary" />
        <Typography variant="h6" component="div">
          API Configuration
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Configuration saved successfully! The app will now use your custom credentials.
          </Alert>
        )}
        
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={config.useCustomCredentials}
                onChange={handleSwitchChange('useCustomCredentials')}
                color="primary"
              />
            }
            label={
              <Typography variant="body1" fontWeight="medium">
                Use Custom Jira Credentials
              </Typography>
            }
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {config.useCustomCredentials 
              ? 'Enter your Jira API credentials to create real tickets'
              : 'Using demo mode - no real API calls will be made'
            }
          </Typography>
        </Box>

        {config.useCustomCredentials && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Jira API Token"
                type="password"
                value={config.jiraToken}
                onChange={handleInputChange('jiraToken')}
                error={!!errors.jiraToken}
                helperText={errors.jiraToken || 'Your personal Jira API token'}
                placeholder="Your_Jira_API_Token_Here"
              />
              
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={config.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email || 'Email associated with your Jira account'}
                placeholder="your.email@company.com"
              />
              
              <TextField
                fullWidth
                label="Jira Base URL"
                value={config.baseUrl}
                onChange={handleInputChange('baseUrl')}
                error={!!errors.baseUrl}
                helperText={errors.baseUrl || 'Your Jira instance URL'}
                placeholder="https://yourcompany.atlassian.net"
              />
              
              <TextField
                fullWidth
                label="Project Key"
                value={config.projectKey}
                onChange={handleInputChange('projectKey')}
                error={!!errors.projectKey}
                helperText={errors.projectKey || 'The key of your Jira project (e.g., PB, PROJ, etc.)'}
                placeholder="PB"
              />
            </Box>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Security Note:</strong> Your credentials are stored locally in your browser and are not sent to any external servers except your Jira instance.
              </Typography>
            </Alert>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={handleCancel}
          startIcon={<CancelIcon />}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          startIcon={<SaveIcon />}
          variant="contained"
          color="primary"
          disabled={saveSuccess}
        >
          {saveSuccess ? 'Saved!' : 'Save Configuration'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiConfigPopup;
