// Service for handling Jira status operations
import { HISTORY_CONFIG } from '../data/historyData';



// Fetch status for a specific ticket
export const fetchTicketStatus = async (ticketKey) => {
  try {
    const response = await fetch(`http://localhost:3001/issue/${ticketKey}`);
    
    if (response.ok) {
      const responseData = await response.json();
      
      // The server wraps the data in {success: true, data: {...}}
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
    return null;
  } catch (error) {
    console.error(`Error fetching status for ${ticketKey}:`, error);
    return null;
  }
};


