// Environment Detection Utility
// Centralized logic for detecting local vs web environment

/**
 * Detects if the application is running in a local development environment
 * @returns {boolean} true if running locally, false if running on web
 */
export const isLocalDevelopment = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const href = window.location.href;
  const protocol = window.location.protocol;

  return (
    // Local hostnames
    hostname === 'localhost' || 
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    // Local ports (React dev server)
    port === '3000' ||
    port === '3001' ||
    // Local URLs
    href.includes('localhost:3000') ||
    href.includes('127.0.0.1:3000') ||
    href.includes('localhost:3001') ||
    href.includes('127.0.0.1:3001') ||
    // HTTP protocol (usually local development)
    protocol === 'http:'
  );
};

/**
 * Detects if the application is running in a web deployment environment
 * @returns {boolean} true if running on web, false if running locally
 */
export const isWebDeployment = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  return (
    // GitHub Pages
    hostname === 'probuildgit.github.io' ||
    hostname.includes('github.io') ||
    // Other hosting platforms
    hostname.includes('netlify.app') ||
    hostname.includes('vercel.app') ||
    hostname.includes('herokuapp.com') ||
    hostname.includes('firebase.app') ||
    // HTTPS protocol (usually web deployment)
    protocol === 'https:'
  );
};

/**
 * Gets the current environment type
 * @returns {string} 'local' or 'web'
 */
export const getEnvironment = () => {
  return isLocalDevelopment() ? 'local' : 'web';
};

/**
 * Logs environment detection information for debugging
 */
export const logEnvironmentInfo = () => {
  const env = getEnvironment();
  console.log('🔍 ENVIRONMENT DETECTION:', {
    hostname: window.location.hostname,
    port: window.location.port,
    href: window.location.href,
    protocol: window.location.protocol,
    isLocal: isLocalDevelopment(),
    isWeb: isWebDeployment(),
    environment: env,
    'window.location': window.location
  });
  return env;
};
