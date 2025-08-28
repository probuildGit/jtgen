import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Alert } from '@mui/material';
import JiraTicketForm from './components/JiraTicketForm';
import { testJiraConnectivity } from './services/jiraApiService';
import { ALERT_MESSAGES } from './data/formData';
import './styles/formStyles.css';

// Create a minimal theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [connectivityStatus, setConnectivityStatus] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  // Check connectivity on app start with defensive logic
  useEffect(() => {
    const checkConnectivity = async () => {
      setIsConnecting(true);
      
      // Set a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        setIsConnecting(false);
        setConnectivityStatus('⚠️ Connection timeout - App will work in offline mode');
      }, 10000); // 10 second timeout

      try {
        const result = await testJiraConnectivity();
        clearTimeout(timeoutId);
        
        if (result.success) {
          setConnectivityStatus('✅ Connected to Jira API');
        } else {
          setConnectivityStatus('⚠️ Limited connectivity - Some features may not work');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Jira API connection failed:', error);
        setConnectivityStatus('⚠️ Offline mode - Form will work but tickets cannot be created');
      } finally {
        setIsConnecting(false);
      }
    };

    // Add retry logic with exponential backoff
    const retryConnectivity = async (attempt = 1, maxAttempts = 3) => {
      try {
        await checkConnectivity();
      } catch (error) {
        if (attempt < maxAttempts) {
          setTimeout(() => retryConnectivity(attempt + 1, maxAttempts), attempt * 2000);
        } else {
          console.warn('All connection attempts failed, starting in offline mode');
          setIsConnecting(false);
          setConnectivityStatus('⚠️ Offline mode - Form will work but tickets cannot be created');
        }
      }
    };

    retryConnectivity();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Jira API Connectivity Status Banner - Outside Form */}
      {isConnecting && (
        <Alert severity="info" className="form-connectivity-banner">
          {ALERT_MESSAGES.CONNECTING}
        </Alert>
      )}

      {!isConnecting && connectivityStatus && (
        <Alert 
          severity={
            connectivityStatus.includes('✅') ? 'success' : 
            connectivityStatus.includes('⚠️') ? 'warning' : 'error'
          } 
          className="form-connectivity-banner"
        >
          {connectivityStatus}
        </Alert>
      )}

      <Container maxWidth="xl" className="form-container-main">
        <JiraTicketForm isOffline={!connectivityStatus?.includes('✅')} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
