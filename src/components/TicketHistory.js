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
  OpenInNew as OpenInNewIcon, 
  History as HistoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { clearCorruptedHistory } from '../utils/formHelpers';
import {
  DIALOG_TITLES,
  BUTTON_LABELS,
  ALERT_MESSAGES,
  JIRA_URLS
} from '../data/formData';
import {
  HISTORY_CONFIG,
  getStatusColor,
  getStatusDisplayName,
  HISTORY_MESSAGES,
  HISTORY_ACTIONS
} from '../data/historyData';
import { fetchTicketStatus } from '../services/jiraStatusService';
import '../styles/historyStyles.css';

const TicketHistory = ({ open, onClose }) => {

  
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Load ticket history from localStorage and fetch real statuses
  const loadTicketHistory = async () => {
    try {
      const history = localStorage.getItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY);
      
      if (history) {
        const parsedHistory = JSON.parse(history);
        
        // Check if history contains corrupted data (PB-LEGACY tickets)
        const hasCorruptedData = parsedHistory.some(ticket => 
          ticket.key === 'PB-LEGACY' || ticket.isLegacy
        );
        
        // Clear corrupted data if found
        if (hasCorruptedData) {
          clearCorruptedHistory();
          setTickets([]);
          return;
        }
        
        // Filter out any invalid tickets and set valid ones
        const validTickets = parsedHistory.filter(ticket => 
          ticket.key && ticket.key.startsWith('PB-') && !ticket.isLegacy
        );
        
        // Set initial tickets with existing status (will be updated with real statuses)
        setTickets(validTickets);
        
        // Fetch real statuses for all tickets with timeout and concurrency limit
        const updatedTickets = await Promise.all(
          validTickets.map(async (ticket, index) => {
            try {
              // Add small delay between requests to avoid overwhelming the server
              if (index > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              const statusData = await fetchTicketStatus(ticket.key);
              
              if (statusData) {
                return {
                  ...ticket,
                  status: statusData.status,
                  isDeleted: false,
                  lastStatusCheck: new Date().toISOString()
                };
              } else {
                return {
                  ...ticket,
                  isDeleted: true,
                  lastStatusCheck: new Date().toISOString()
                };
              }
            } catch (error) {
              console.error(`Error fetching status for ${ticket.key}:`, error);
              // Keep existing status on error
              return ticket;
            }
          })
        );
        
        setTickets(updatedTickets);
        
        // Update localStorage with real statuses
        localStorage.setItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY, JSON.stringify(updatedTickets));
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Error loading ticket history:', err);
      setError(HISTORY_MESSAGES.LOAD_ERROR);
    }
  };



  // Refresh ticket statuses from Jira
  const refreshTicketStatuses = useCallback(async () => {
    if (tickets.length === 0) {
      return;
    }
    
    setStatusLoading(true);
    try {
      // Check each ticket individually for more reliable results
      const updatedTickets = await Promise.all(
        tickets.map(async (ticket) => {
          if (ticket.isLegacy || !ticket.key || ticket.key.includes('LEGACY')) {
            return ticket; // Skip legacy tickets
          }
          
          try {
            // Use the status service to fetch real status
            const statusData = await fetchTicketStatus(ticket.key);
            
            if (statusData) {
              return {
                ...ticket,
                status: statusData.status,
                isDeleted: false,
                lastStatusCheck: new Date().toISOString()
              };
            } else {
              return {
                ...ticket,
                isDeleted: true,
                lastStatusCheck: new Date().toISOString()
              };
            }
          } catch (error) {
            console.error(`Error checking ${ticket.key}:`, error);
            // Keep existing status on error
            return ticket;
          }
        })
      );
      
      setTickets(updatedTickets);
      
      // Update localStorage with new statuses
      localStorage.setItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY, JSON.stringify(updatedTickets));
      
    } catch (error) {
      console.error('Error refreshing ticket statuses:', error);
      setError(HISTORY_MESSAGES.REFRESH_ERROR);
    } finally {
      setStatusLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove tickets dependency to prevent infinite loops

  // Open ticket in Jira
  const openTicketInJira = (ticketKey, isLegacy = false) => {
    if (isLegacy) {
      alert('This is a legacy ticket without a proper Jira link. Please check your Jira instance for the actual ticket.');
      return;
    }
    const jiraUrl = `${JIRA_URLS.BROWSE}/${ticketKey}`;
    window.open(jiraUrl, '_blank');
  };

  // Verify individual ticket status
  const verifyTicketStatus = async (ticketKey) => {
    try {
      const response = await fetch(`http://localhost:3001/issue/${ticketKey}`);
      if (response.ok) {
        const issueData = await response.json();
        const currentStatus = issueData.fields.status.name;
        
        // Update the specific ticket in the list
        const updatedTickets = tickets.map(ticket => 
          ticket.key === ticketKey 
            ? { ...ticket, status: currentStatus, isDeleted: false, lastStatusCheck: new Date().toISOString() }
            : ticket
        );
        
        setTickets(updatedTickets);
        localStorage.setItem(HISTORY_CONFIG.STORAGE_KEYS.TICKET_HISTORY, JSON.stringify(updatedTickets));
              } else {
          // Ticket not found or access denied
        }
    } catch (error) {
      console.error(`Error verifying ticket ${ticketKey}:`, error);
    }
  };



  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get status color


  useEffect(() => {
    if (open) {
      loadTicketHistory().catch(error => {
        console.error('Error loading ticket history:', error);
        setError(HISTORY_MESSAGES.LOAD_ERROR);
      });
      // Don't automatically refresh statuses - let user do it manually
    }
  }, [open]);

  return (
        <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      className="form-history-dialog"
      PaperProps={{
        className: 'form-history-dialog-paper'
      }}
    >
      <DialogTitle>
        <Box className="form-history-dialog-title-container">
          <HistoryIcon color="primary" />
          <Typography variant="h5" component="div" className="form-history-dialog-title">
            {DIALOG_TITLES.HISTORY.TITLE}
          </Typography>
        </Box>
        <Typography variant="subtitle2" component="div" color="text.secondary">
          {DIALOG_TITLES.HISTORY.SUBTITLE}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" className="form-history-alert">
            {error}
          </Alert>
        )}

        {tickets.length === 0 && (
          <Paper elevation={1} className="form-history-empty">
            <Typography variant="body1" color="text.secondary">
              {HISTORY_MESSAGES.NO_TICKETS}
            </Typography>
          </Paper>
        )}

        {tickets.length > 0 && (
          <Paper elevation={1}>
            <List>
              {tickets.map((ticket, index) => (
                <React.Fragment key={ticket.key}>
                  <ListItem className="form-history-list-item">
                    <Box className="form-history-item-container">
                      <Box className="form-history-item-header">
                        <Typography variant="subtitle1" component="div">
                          {ticket.isLegacy ? (
                            <span>
                              {ticket.key}
                              <span className="form-history-status-text">
                                (Legacy)
                              </span>
                            </span>
                          ) : ticket.isDeleted ? (
                            <span className="form-history-deleted-text">
                              {ticket.key}
                            </span>
                          ) : (
                            <Link
                              href={`${JIRA_URLS.BROWSE}/${ticket.key}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="form-history-ticket-link"
                              underline="hover"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTicketInJira(ticket.key, ticket.isLegacy);
                              }}
                            >
                              {ticket.key}
                            </Link>
                          )}
                        </Typography>
                                                  <Chip 
                            label={ticket.isDeleted ? 'Deleted' : getStatusDisplayName(ticket.status)} 
                            size="small" 
                            color={ticket.isDeleted ? 'error' : getStatusColor(ticket.status)}
                            variant={ticket.isDeleted ? 'outlined' : 'filled'}
                          />
                        {statusLoading && (
                          <CircularProgress size={16} className="form-history-loading-spinner" />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" component="div" className="form-history-item-content">
                          {ticket.summary}
                        </Typography>
                        <Typography variant="caption" component="div" color="text.secondary" className="form-history-item-details">
                          Created: {formatDate(ticket.created)}
                          {ticket.updated && ticket.updated !== ticket.created && 
                            ` | Updated: ${formatDate(ticket.updated)}`
                          }
                        </Typography>
                      </Box>
                    </Box>
                    <ListItemSecondaryAction>
                      {ticket.isDeleted && (
                        <IconButton
                          edge="end"
                          onClick={() => verifyTicketStatus(ticket.key)}
                          title="Verify ticket status"
                          size="small"
                          className="form-history-action-button"
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        onClick={() => openTicketInJira(ticket.key, ticket.isLegacy)}
                        title={ticket.isLegacy ? "Legacy ticket - no direct link" : ticket.isDeleted ? "Ticket deleted" : "Open in Jira"}
                        disabled={ticket.isLegacy || ticket.isDeleted}
                      >
                        <OpenInNewIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < tickets.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions className="form-history-actions">

        <Button 
          onClick={refreshTicketStatuses}
          variant="outlined" 
          disabled={statusLoading || tickets.length === 0}
          startIcon={<RefreshIcon />}
        >
          {statusLoading ? HISTORY_ACTIONS.REFRESHING : HISTORY_ACTIONS.REFRESH}
        </Button>
        <Button onClick={onClose} variant="contained">
          {HISTORY_ACTIONS.CLOSE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketHistory;
