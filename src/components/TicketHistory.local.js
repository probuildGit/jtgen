import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Link
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { fetchTicketStatus } from '../services/jiraStatusService.local.js';
import { 
  HISTORY_CONFIG, 
  HISTORY_MESSAGES, 
  HISTORY_ACTIONS,
  getStatusColor,
  getStatusDisplayName,
  LOCAL_HISTORY_DATA
} from '../data/historyData.local.js';

const TicketHistory = ({ open, onClose }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load ticket history from localStorage
  const loadTicketHistory = useCallback(() => {
    try {
      const historyData = localStorage.getItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY);
      if (historyData) {
        const parsedHistory = JSON.parse(historyData);
        setTickets(parsedHistory);
        console.log('🏠 LOCAL: Loaded ticket history:', parsedHistory);
      } else {
        // If no history exists, show sample data for local development
        setTickets(LOCAL_HISTORY_DATA.SAMPLE_TICKETS);
        console.log('🏠 LOCAL: No history found, showing sample data');
      }
    } catch (error) {
      console.error('🏠 LOCAL: Error loading ticket history:', error);
      setError(HISTORY_MESSAGES.LOAD_ERROR);
    }
  }, []);

  // Refresh ticket statuses
  const refreshTicketStatuses = useCallback(async () => {
    if (tickets.length === 0) return;

    setRefreshing(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedTickets = [];
      
      for (const ticket of tickets) {
        try {
          const statusData = await fetchTicketStatus(ticket.key);
          const updatedTicket = {
            ...ticket,
            status: statusData.status || ticket.status,
            lastUpdated: new Date().toISOString()
          };
          updatedTickets.push(updatedTicket);
        } catch (statusError) {
          console.warn(`🏠 LOCAL: Failed to fetch status for ${ticket.key}:`, statusError);
          updatedTickets.push(ticket); // Keep original ticket if status fetch fails
        }
      }

      setTickets(updatedTickets);
      
      // Update localStorage
      localStorage.setItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY, JSON.stringify(updatedTickets));
      
      setSuccess(HISTORY_MESSAGES.REFRESH_SUCCESS);
      console.log('🏠 LOCAL: Ticket statuses refreshed successfully');
    } catch (error) {
      console.error('🏠 LOCAL: Error refreshing ticket statuses:', error);
      setError(HISTORY_MESSAGES.REFRESH_ERROR);
    } finally {
      setRefreshing(false);
    }
  }, [tickets]);

  // Clear ticket history
  const clearHistory = useCallback(() => {
    if (window.confirm(HISTORY_MESSAGES.CLEAR_CONFIRM)) {
      localStorage.removeItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY);
      setTickets([]);
      setSuccess(HISTORY_MESSAGES.CLEAR_SUCCESS);
      console.log('🏠 LOCAL: Ticket history cleared');
    }
  }, []);

  // Open ticket in Jira
  const openInJira = useCallback((ticketKey) => {
    const jiraUrl = `https://probuild.atlassian.net/browse/${ticketKey}`;
    window.open(jiraUrl, '_blank');
  }, []);

  // Load history when dialog opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      loadTicketHistory();
      setLoading(false);
    }
  }, [open, loadTicketHistory]);

  // Auto-refresh when dialog opens
  useEffect(() => {
    if (open && tickets.length > 0) {
      const timer = setTimeout(() => {
        refreshTicketStatuses();
      }, HISTORY_CONFIG.REFRESH_DELAY);

      return () => clearTimeout(timer);
    }
  }, [open, tickets.length, refreshTicketStatuses]);

  // Clear messages after a delay
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const getStatusIcon = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('done') || statusLower.includes('completed')) {
      return <CheckCircleIcon />;
    } else if (statusLower.includes('error') || statusLower.includes('blocked')) {
      return <ErrorIcon />;
    } else if (statusLower.includes('review') || statusLower.includes('warning')) {
      return <WarningIcon />;
    } else {
      return <InfoIcon />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" component="div">
          Ticket History (Local Environment)
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              {HISTORY_MESSAGES.LOADING}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ m: 2 }}>
            {success}
          </Alert>
        )}

        {!loading && tickets.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {HISTORY_MESSAGES.NO_TICKETS}
            </Typography>
          </Box>
        )}

        {!loading && tickets.length > 0 && (
          <List sx={{ p: 0 }}>
            {tickets.map((ticket, index) => (
              <React.Fragment key={ticket.key || index}>
                <ListItem sx={{ py: 2, px: 3 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ mr: 2 }}>
                        {ticket.key}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(ticket.status)}
                        label={getStatusDisplayName(ticket.status)}
                        color={getStatusColor(ticket.status)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {ticket.summary}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(ticket.created).toLocaleString()}
                      </Typography>
                      {ticket.lastUpdated && (
                        <Typography variant="caption" color="text.secondary">
                          Updated: {new Date(ticket.lastUpdated).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => openInJira(ticket.key)}
                      title="Open in Jira"
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < tickets.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        backgroundColor: '#f5f5f5', 
        borderTop: '1px solid #e0e0e0',
        gap: 1
      }}>
        <Button
          onClick={refreshTicketStatuses}
          disabled={refreshing || tickets.length === 0}
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          variant="outlined"
        >
          {refreshing ? HISTORY_ACTIONS.REFRESHING : HISTORY_ACTIONS.REFRESH}
        </Button>
        <Button
          onClick={clearHistory}
          disabled={tickets.length === 0}
          variant="outlined"
          color="error"
        >
          {HISTORY_ACTIONS.CLEAR}
        </Button>
        <Button onClick={onClose} variant="contained">
          {HISTORY_ACTIONS.CLOSE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketHistory;