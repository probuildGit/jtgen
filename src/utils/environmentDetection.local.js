// Local Environment Detection Utility
// Always returns local environment for local app

/**
 * Always returns true for local environment
 * @returns {boolean} always true
 */
export const isLocalDevelopment = () => {
  console.log('🏠 LOCAL ENVIRONMENT: Always local');
  return true;
};

/**
 * Always returns false for local environment
 * @returns {boolean} always false
 */
export const isWebDeployment = () => {
  return false;
};

/**
 * Always returns 'local' for local environment
 * @returns {string} always 'local'
 */
export const getEnvironment = () => {
  return 'local';
};

/**
 * Logs local environment information
 */
export const logEnvironmentInfo = () => {
  console.log('🏠 LOCAL ENVIRONMENT DETECTION:', {
    hostname: window.location.hostname,
    port: window.location.port,
    href: window.location.href,
    protocol: window.location.protocol,
    isLocal: true,
    isWeb: false,
    environment: 'local'
  });
  return 'local';
};
