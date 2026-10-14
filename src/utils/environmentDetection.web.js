// Web Environment Detection Utility
// Always returns web environment for web app

/**
 * Always returns false for web environment
 * @returns {boolean} always false
 */
export const isLocalDevelopment = () => {
  console.log('🌐 WEB ENVIRONMENT: Always web');
  return false;
};

/**
 * Always returns true for web environment
 * @returns {boolean} always true
 */
export const isWebDeployment = () => {
  return true;
};

/**
 * Always returns 'web' for web environment
 * @returns {string} always 'web'
 */
export const getEnvironment = () => {
  return 'web';
};

/**
 * Logs web environment information
 */
export const logEnvironmentInfo = () => {
  console.log('🌐 WEB ENVIRONMENT DETECTION:', {
    hostname: window.location.hostname,
    port: window.location.port,
    href: window.location.href,
    protocol: window.location.protocol,
    isLocal: false,
    isWeb: true,
    environment: 'web'
  });
  return 'web';
};
