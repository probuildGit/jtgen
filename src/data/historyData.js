// History page data and configuration
export const HISTORY_CONFIG = {
  // Status refresh settings
  REFRESH_DELAY: 1000, // Delay before auto-refresh (ms)
  MAX_RETRIES: 3, // Maximum retry attempts for failed API calls
  
  // Local storage keys
  STORAGE_KEYS: {
    TICKET_HISTORY: 'jiraTicketHistory',
    LAST_REFRESH: 'lastStatusRefresh'
  }
};

// Jira status mapping and colors
export const JIRA_STATUSES = {
  // Common Jira statuses with their display names and colors
  'To Do': {
    displayName: 'To Do',
    color: 'default',
    category: 'todo'
  },
  'In Progress': {
    displayName: 'In Progress', 
    color: 'primary',
    category: 'inprogress'
  },
  'Done': {
    displayName: 'Done',
    color: 'success',
    category: 'done'
  },
  'Completed (In Prod)': {
    displayName: 'Completed (In Prod)',
    color: 'success',
    category: 'done'
  },
  'In Review': {
    displayName: 'In Review',
    color: 'warning',
    category: 'review'
  },
  'Blocked': {
    displayName: 'Blocked',
    color: 'error',
    category: 'blocked'
  },
  'Cancelled': {
    displayName: 'Cancelled',
    color: 'error',
    category: 'cancelled'
  },
  'Reopened': {
    displayName: 'Reopened',
    color: 'info',
    category: 'reopened'
  }
};

// Default status for unknown statuses
export const DEFAULT_STATUS = {
  displayName: 'Unknown',
  color: 'default',
  category: 'unknown'
};

// Status categories for grouping
export const STATUS_CATEGORIES = {
  todo: {
    name: 'To Do',
    color: 'default',
    icon: 'pending'
  },
  inprogress: {
    name: 'In Progress',
    color: 'primary', 
    icon: 'play_arrow'
  },
  review: {
    name: 'Review',
    color: 'warning',
    icon: 'rate_review'
  },
  done: {
    name: 'Done',
    color: 'success',
    icon: 'check_circle'
  },
  blocked: {
    name: 'Blocked',
    color: 'error',
    icon: 'block'
  },
  cancelled: {
    name: 'Cancelled',
    color: 'error',
    icon: 'cancel'
  },
  reopened: {
    name: 'Reopened',
    color: 'info',
    icon: 'refresh'
  },
  unknown: {
    name: 'Unknown',
    color: 'default',
    icon: 'help'
  }
};

// Helper function to get status info
export const getStatusInfo = (statusName) => {
  if (!statusName) return DEFAULT_STATUS;
  
  // Check if we have a direct match
  if (JIRA_STATUSES[statusName]) {
    return JIRA_STATUSES[statusName];
  }
  
  // Check for partial matches (case insensitive)
  const lowerStatusName = statusName.toLowerCase();
  for (const [key, value] of Object.entries(JIRA_STATUSES)) {
    if (key.toLowerCase().includes(lowerStatusName) || 
        lowerStatusName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Return default for unknown status
  return DEFAULT_STATUS;
};

// Helper function to get status color
export const getStatusColor = (statusName) => {
  const statusInfo = getStatusInfo(statusName);
  return statusInfo.color;
};

// Helper function to get status display name
export const getStatusDisplayName = (statusName) => {
  const statusInfo = getStatusInfo(statusName);
  return statusInfo.displayName;
};

// History page messages
export const HISTORY_MESSAGES = {
  LOADING: 'Loading ticket history...',
  NO_TICKETS: 'No tickets found in history',
  REFRESHING: 'Refreshing ticket statuses...',
  REFRESH_SUCCESS: 'Ticket statuses updated successfully',
  REFRESH_ERROR: 'Failed to refresh ticket statuses',
  LOAD_ERROR: 'Failed to load ticket history',
  CLEAR_CONFIRM: 'Are you sure you want to clear all ticket history?',
  CLEAR_SUCCESS: 'Ticket history cleared successfully'
};

// History page actions
export const HISTORY_ACTIONS = {
  REFRESH: 'Refresh Statuses',
  REFRESHING: 'Refreshing...',
  CLEAR: 'Clear History',
  CLOSE: 'Close',
  OPEN_IN_JIRA: 'Open in Jira',
  VERIFY_STATUS: 'Verify Status'
};
