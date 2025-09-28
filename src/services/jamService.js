// JAM Service Loader
// Smart loader that selects the appropriate JAM service based on environment

import { isLocalDevelopment } from '../utils/environmentDetection.js';

// Import both services
import localJamService from './jamService.local.js';
import webJamService from './jamService.web.js';

// Environment detection and service selection
const environment = isLocalDevelopment() ? 'LOCAL' : 'WEB';
const jamService = isLocalDevelopment() ? localJamService : webJamService;

console.log('🔍 JAM SERVICE SELECTION:', {
  environment,
  service: isLocalDevelopment() ? 'LOCAL JAM SERVICE' : 'WEB JAM SERVICE',
  timestamp: new Date().toISOString(),
  hostname: window.location.hostname,
  port: window.location.port,
  href: window.location.href,
  protocol: window.location.protocol
});

// Export the selected service functions
export const fetchJamContent = jamService.fetchJamContent;
export const fetchJamContentRendered = jamService.fetchJamContentRendered;
export const extractAndFetchJamContent = jamService.extractAndFetchJamContent;
export const testJamConnectivity = jamService.testJamConnectivity;

// Export the service for debugging
export default jamService;
