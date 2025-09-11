// Web Status Configuration
// Contains Jira status mappings for web deployment

export const STATUS_CONFIG = {
  // Status display names
  DISPLAY_NAMES: {
    'To Do': 'To Do',
    'In Progress': 'In Progress',
    'In Development': 'In Development', 
    'Ready For Deployment': 'Ready For Deployment',
    'Done': 'Done',
    'Completed (In Prod)': 'Completed (In Prod)',
    'Closed': 'Closed',
    'Cancelled': 'Cancelled',
    'Unknown': 'Unknown'
  },

  // Status colors for Material-UI
  COLORS: {
    'To Do': 'default',
    'In Progress': 'primary',
    'In Development': 'primary', 
    'Ready For Deployment': 'success',
    'Done': 'success',
    'Completed (In Prod)': 'success',
    'Closed': 'secondary',
    'Cancelled': 'error',
    'Unknown': 'default'
  },

  // Status categories
  CATEGORIES: {
    'To Do': 'new',
    'In Progress': 'indeterminate',
    'In Development': 'indeterminate',
    'Ready For Deployment': 'done',
    'Done': 'done', 
    'Completed (In Prod)': 'done',
    'Closed': 'done',
    'Cancelled': 'done',
    'Unknown': 'unknown'
  }
};

// Helper functions
export const getStatusDisplayName = (status) => {
  if (!status || status === 'unknown') {
    return STATUS_CONFIG.DISPLAY_NAMES.Unknown;
  }
  return STATUS_CONFIG.DISPLAY_NAMES[status] || status;
};

export const getStatusColor = (status) => {
  return STATUS_CONFIG.COLORS[status] || STATUS_CONFIG.COLORS.Unknown;
};

export const getStatusCategory = (status) => {
  return STATUS_CONFIG.CATEGORIES[status] || 'unknown';
};

export default STATUS_CONFIG;
