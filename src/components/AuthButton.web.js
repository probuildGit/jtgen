import React, { useEffect, useState } from 'react';
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  Box
} from '@mui/material';
import { VpnKey as AuthIcon } from '@mui/icons-material';
import { clearJiraAuth, getJiraAuth, saveJiraAuth } from '../services/jiraAuth.web.js';

const AuthButton = ({ connected = false }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [hasSavedToken, setHasSavedToken] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const loadSaved = () => {
    const auth = getJiraAuth();
    setEmail(auth?.email || '');
    setToken('');
    setHasSavedToken(!!auth?.token);
    setSignedInEmail(auth?.email || '');
  };

  useEffect(() => {
    loadSaved();
    const onChange = () => loadSaved();
    window.addEventListener('jtgen-auth-changed', onChange);
    return () => window.removeEventListener('jtgen-auth-changed', onChange);
  }, []);

  const handleOpen = () => {
    loadSaved();
    setErrors({});
    setSaved(false);
    setOpen(true);
  };

  const handleSave = () => {
    const nextErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      nextErrors.email = 'Jira email is required';
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address';
    }

    const trimmedToken = token.trim();
    const existing = getJiraAuth();
    const tokenToSave = trimmedToken || (hasSavedToken ? existing?.token : '');
    if (!tokenToSave) {
      nextErrors.token = 'Jira API token is required';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    saveJiraAuth(trimmedEmail, tokenToSave);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 700);
  };

  const handleSignOut = () => {
    clearJiraAuth();
    setEmail('');
    setToken('');
    setHasSavedToken(false);
    setErrors({});
    setOpen(false);
  };

  const isValid = hasSavedToken && connected;

  return (
    <>
      <Tooltip title={isValid ? `Connected as ${signedInEmail}` : (hasSavedToken ? 'Saved token is not connected yet' : 'Enter your Jira API token')}>
        <IconButton
          onClick={handleOpen}
          className={`auth-button ${isValid ? 'auth-button--valid' : 'auth-button--missing'}`}
          aria-label="Jira Auth"
        >
          <AuthIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Jira Auth</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the Jira account email and personal API token used to create tickets. They stay in this browser only and are not saved in Git.
          </Typography>
          {saved && <Alert severity="success" sx={{ mb: 2 }}>Saved. Ticket creation will use this token.</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Jira email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={!!errors.email}
              helperText={errors.email || 'Email for your Jira account'}
              autoComplete="username"
              fullWidth
            />
            <TextField
              label="Jira API token"
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              error={!!errors.token}
              helperText={errors.token || (hasSavedToken ? 'A token is already saved. Enter a new one to replace it.' : 'Create a token at id.atlassian.com')}
              autoComplete="current-password"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {hasSavedToken && (
            <Button onClick={handleSignOut} color="inherit">
              Sign out
            </Button>
          )}
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuthButton;
