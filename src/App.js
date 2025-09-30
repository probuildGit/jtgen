// Environment-specific App loader - VERSION 1.3
import React from 'react';
import { isLocalDevelopment } from './utils/environmentDetection.js';
import LocalApp from './App.local.js';
import WebApp from './App.web.js';

// Create a dynamic app component that detects environment at runtime
const App = () => {
  // Debug environment detection
  const isLocal = isLocalDevelopment();
  console.log('🔍 APP.JS: Environment detection result:', isLocal);
  console.log('🔍 APP.JS: Window location:', window.location);
  console.log('🔍 APP.JS: Loading app:', isLocal ? 'LOCAL' : 'WEB');

  // Return the appropriate app component
  if (isLocal) {
    console.log('🏠 LOCAL: Loading LocalApp component');
    return <LocalApp />;
  } else {
    console.log('🌐 WEB: Loading WebApp component');
    return <WebApp />;
  }
};

export default App;