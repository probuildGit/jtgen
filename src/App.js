// Environment-specific App loader
import { isLocalDevelopment } from './utils/environmentDetection.js';
import LocalApp from './App.local.js';
import WebApp from './App.web.js';

// Log environment detection
const environment = isLocalDevelopment() ? 'LOCAL' : 'WEB';
console.log('🔍 APP ENVIRONMENT SELECTION:', {
  environment,
  app: isLocalDevelopment() ? 'LOCAL APP' : 'WEB APP',
  timestamp: new Date().toISOString(),
  hostname: window.location.hostname,
  port: window.location.port,
  href: window.location.href,
  protocol: window.location.protocol
});

// Export the appropriate App component based on environment
const App = isLocalDevelopment() ? LocalApp : WebApp;

export default App;