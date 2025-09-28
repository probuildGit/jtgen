import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Alert, Box } from '@mui/material';
import JiraTicketForm from './components/JiraTicketForm.local.js';
import InfoButton from './components/InfoButton.local.js';
import { testJiraConnectivity } from './services/jiraApiService.local.js';
import { ALERT_MESSAGES } from './data/formData.local.js';
import './styles/formStyles.css';
import './styles/infoButtonStyles.css';

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
    // Test environment detection in browser
    const testEnv = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.port === '3000';
    
    console.log('🏠 LOCAL ENVIRONMENT TEST:', {
      hostname: window.location.hostname,
      port: window.location.port,
      href: window.location.href,
      testEnv
    });

    const checkConnectivity = async () => {
      setIsConnecting(true);
      
      // Set a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        setIsConnecting(false);
        setConnectivityStatus('⚠️ Connection timeout - App will work in offline mode');
      }, 10000);

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

    const retryConnectivity = async (attempt = 1, maxAttempts = 3) => {
      try {
        await checkConnectivity();
      } catch (error) {
        if (attempt < maxAttempts) {
          console.log(`Connection attempt ${attempt} failed, retrying in ${2 * attempt} seconds...`);
          setTimeout(() => retryConnectivity(attempt + 1, maxAttempts), 2000 * attempt);
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
      
      {/* Info Button Only - Fixed position (Local environment) */}
      <Box sx={{ position: 'fixed', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 1000 }}>
        <InfoButton />
      </Box>
    </ThemeProvider>
  );
}

export default App;
