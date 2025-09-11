// Local Jira Status Service - Uses proxy server for local development
import { LOCAL_ROUTES } from '../config/routes.local.js';

console.log('🏠 LOCAL STATUS SERVICE LOADED - Using proxy server at localhost:3001');

// Fetch status for a specific ticket using local proxy
export const fetchTicketStatus = async (ticketKey) => {
  try {
    console.log('🏠 LOCAL STATUS SERVICE: Fetching status for ticket:', ticketKey);
    
    const response = await fetch(LOCAL_ROUTES.getIssueUrl(ticketKey));
    
    if (response.ok) {
      const responseData = await response.json();
      
      // The local proxy server wraps the data in {success: true, data: {...}}
      const data = responseData.data;
      
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
    
    console.warn('🏠 LOCAL STATUS SERVICE: No status data found for ticket:', ticketKey);
    return null;
  } catch (error) {
    console.error('🏠 LOCAL STATUS SERVICE: Error fetching status for', ticketKey, ':', error);
    return null;
  }
};

// Fetch statuses for multiple tickets
export const fetchMultipleTicketStatuses = async (ticketKeys) => {
  console.log('🏠 LOCAL STATUS SERVICE: Fetching statuses for', ticketKeys.length, 'tickets');
  
  const statusPromises = ticketKeys.map(key => fetchTicketStatus(key));
  const results = await Promise.allSettled(statusPromises);
  
  const statuses = results
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => result.value);
  
  console.log('🏠 LOCAL STATUS SERVICE: Successfully fetched', statuses.length, 'statuses');
  return statuses;
};

// Default export
const localStatusService = {
  fetchTicketStatus,
  fetchMultipleTicketStatuses
};

export default localStatusService;
