// FORCE LOCAL APP - Temporary override for debugging
import ForceLocalApp from './App.force-local.js';

// Log forced local environment
console.log('🏠 FORCE LOCAL APP: Loading FORCED LOCAL environment');
console.log('🏠 FORCE LOCAL APP: Environment details:', {
  hostname: window.location.hostname,
  port: window.location.port,
  href: window.location.href,
  protocol: window.location.protocol,
  timestamp: new Date().toISOString()
});

// Export the forced local App component
const App = ForceLocalApp;

export default App;