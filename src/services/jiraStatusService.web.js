// Web Jira Status Service - Uses CORS proxy for web deployment
import { CONFIG, WEB_API_ENDPOINTS } from '../config/config.web.js';

console.log('🌐 WEB STATUS SERVICE LOADED - Using CORS proxy');

// Helper function to get auth header
const getAuthHeader = () => {
  const credentials = btoa(`${CONFIG.JIRA.EMAIL}:${CONFIG.JIRA.AUTH_TOKEN}`);
  return `Basic ${credentials}`;
};

// Fetch status for a specific ticket using CORS proxy
export const fetchTicketStatus = async (ticketKey) => {
  try {
    console.log('🌐 WEB STATUS SERVICE: Fetching status for ticket:', ticketKey);
    
    const response = await fetch(WEB_API_ENDPOINTS.GET_ISSUE(ticketKey), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': getAuthHeader()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data && data.fields && data.fields.status) {
        return {
          key: ticketKey,
          status: data.fields.status.name,
          statusId: data.fields.status.id,
          statusCategory: data.fields.status.statusCategory?.name || 'unknown',
          lastUpdated: new Date().toISOString()
        };
      }
    }
    
    console.warn('🌐 WEB STATUS SERVICE: No status data found for ticket:', ticketKey);
    return null;
  } catch (error) {
    console.error('🌐 WEB STATUS SERVICE: Error fetching status for', ticketKey, ':', error);
    return null;
  }
};

// Fetch statuses for multiple tickets
export const fetchMultipleTicketStatuses = async (ticketKeys) => {
  console.log('🌐 WEB STATUS SERVICE: Fetching statuses for', ticketKeys.length, 'tickets');
  
  const statusPromises = ticketKeys.map(key => fetchTicketStatus(key));
  const results = await Promise.allSettled(statusPromises);
  
  const statuses = results
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => result.value);
  
  console.log('🌐 WEB STATUS SERVICE: Successfully fetched', statuses.length, 'statuses');
  return statuses;
};

// Default export
const webStatusService = {
  fetchTicketStatus,
  fetchMultipleTicketStatuses
};

export default webStatusService;