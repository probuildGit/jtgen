// Web Jira Status Service - Uses the JTGenWeb proxy on port 3004.
import { WEB_ROUTES } from '../config/routes.web.js';
import { jiraAuthHeaders } from './jiraAuth.web.js';

console.log('🌐 WEB STATUS SERVICE LOADED - Using proxy at localhost:3004');

export const fetchTicketStatus = async (ticketKey) => {
  try {
    const response = await fetch(WEB_ROUTES.getIssueUrl(ticketKey), {
      headers: jiraAuthHeaders()
    });

    if (response.ok) {
      const responseData = await response.json();
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
    console.error('🌐 WEB STATUS SERVICE: Error fetching status for', ticketKey, ':', error);
    return null;
  }
};

export const fetchMultipleTicketStatuses = async (ticketKeys) => {
  const results = await Promise.allSettled(ticketKeys.map(key => fetchTicketStatus(key)));
  return results
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => result.value);
};

const webStatusService = {
  fetchTicketStatus,
  fetchMultipleTicketStatuses
};

export default webStatusService;
