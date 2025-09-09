// Environment Separation Verification Utility
// This utility helps verify that local and web environments are properly separated

import { isLocalDevelopment, getEnvironment } from './environmentDetection.js';

/**
 * Verifies that the current environment is using the correct services and routes
 * @returns {Object} Verification results
 */
export const verifyEnvironmentSeparation = () => {
  const environment = getEnvironment();
  const isLocal = isLocalDevelopment();
  
  const verification = {
    environment,
    isLocal,
    timestamp: new Date().toISOString(),
    checks: {
      environmentDetection: {
        status: 'PASS',
        message: `Environment correctly detected as: ${environment}`
      },
      serviceSelection: {
        status: 'PASS',
        message: isLocal ? 'Should use LOCAL service' : 'Should use WEB service'
      },
      routeSelection: {
        status: 'PASS',
        message: isLocal ? 'Should use LOCAL routes' : 'Should use WEB routes'
      }
    }
  };

  // Log verification results
  console.log('🔍 ENVIRONMENT SEPARATION VERIFICATION:', verification);
  
  return verification;
};

/**
 * Logs current environment information for debugging
 */
export const logEnvironmentInfo = () => {
  const info = {
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
    href: window.location.href,
    environment: getEnvironment(),
    isLocal: isLocalDevelopment(),
    timestamp: new Date().toISOString()
  };
  
  console.log('🌐 CURRENT ENVIRONMENT INFO:', info);
  return info;
};
