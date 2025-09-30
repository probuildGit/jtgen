// Environment-specific App loader
import { isLocalDevelopment } from './utils/environmentDetection.js';
import LocalApp from './App.local.js';
import WebApp from './App.web.js';

// Export the appropriate app based on environment
const App = isLocalDevelopment() ? LocalApp : WebApp;

export default App;