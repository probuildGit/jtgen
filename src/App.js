import { isLocalDevelopment } from './utils/environmentDetection';

// Environment-specific app imports
let App;

if (isLocalDevelopment()) {
  console.log('🏠 LOCAL ENVIRONMENT: Loading App.local.js');
  App = require('./App.local.js').default;
} else {
  console.log('🌐 WEB ENVIRONMENT: Loading App.web.js');
  App = require('./App.web.js').default;
}

export default App;
