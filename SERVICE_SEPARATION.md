# Service Separation Documentation

This document outlines the complete separation between local and web services in the JTGen application.

## Service Architecture

### Local Environment (Development)
- **Base URL**: `http://localhost:3001` (Proxy Server)
- **Service File**: `src/services/jiraApiService.local.js`
- **Route Config**: `src/config/routes.local.js`
- **Config File**: `src/config/config.local.js`
- **Proxy Server**: `server.js` running on port 3001

### Web Environment (Production)
- **Base URL**: `https://corsproxy.io/?` + encoded Jira API URL
- **Service File**: `src/services/jiraApiService.web.js`
- **Route Config**: `src/config/routes.web.js`
- **Config File**: `src/config/config.web.js`
- **CORS Proxy**: External CORS proxy service

## Environment Detection

The application automatically detects the environment using:

```javascript
const isLocalDevelopment = (
  hostname === 'localhost' || 
  hostname === '127.0.0.1' ||
  hostname === '0.0.0.0' ||
  port === '3002' ||
  href.includes('localhost:3002') ||
  href.includes('127.0.0.1:3002')
);
```

## Service Files

### 1. Main Service Loader (`src/services/jiraApiService.js`)
- **Purpose**: Smart loader that selects the appropriate service
- **Logic**: Imports both services, detects environment, selects correct one
- **Exports**: `testJiraConnectivity`, `createJiraTicket`, `uploadAttachment`

### 2. Local Service (`src/services/jiraApiService.local.js`)
- **Purpose**: Handles API calls through local proxy server
- **Dependencies**: `LOCAL_ROUTES`, `config.local.js`
- **Features**: Enhanced attachment handling, embedded images

### 3. Web Service (`src/services/jiraApiService.web.js`)
- **Purpose**: Handles API calls through CORS proxy
- **Dependencies**: `WEB_ROUTES`, `config.web.js`
- **Features**: CORS proxy integration, web-optimized

### 4. Status Service (`src/services/jiraStatusService.js`)
- **Purpose**: Handles ticket status operations
- **Logic**: Environment-aware, uses appropriate routes
- **Dependencies**: Both route configs, conditional imports

## Route Configurations

### Local Routes (`src/config/routes.local.js`)
```javascript
const LOCAL_ROUTES = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    HEALTH: '/health',
    TEST_CONNECTIVITY: '/test-connectivity',
    CREATE_TICKET: '/create-ticket',
    GET_ISSUE: '/issue/:issueKey',
    UPDATE_ISSUE: '/issue/:issueKey',
    SEARCH_ISSUES: '/search',
    UPLOAD_ATTACHMENT: '/upload-attachment/:issueKey'
  }
};
```

### Web Routes (`src/config/routes.web.js`)
```javascript
const WEB_ROUTES = {
  CORS_PROXY: 'https://corsproxy.io/?',
  JIRA_BASE_URL: 'https://probuild.atlassian.net/rest/api/3',
  ENDPOINTS: {
    PROJECT: '/project/:projectKey',
    CREATE_TICKET: '/issue',
    GET_ISSUE: '/issue/:issueKey',
    UPDATE_ISSUE: '/issue/:issueKey',
    SEARCH_ISSUES: '/search',
    UPLOAD_ATTACHMENT: '/issue/:issueKey/attachments'
  }
};
```

## Configuration Files

### Local Config (`src/config/config.local.js`)
- **Server**: Proxy server configuration
- **Jira**: Direct API credentials
- **App**: Local development settings

### Web Config (`src/config/config.web.js`)
- **Server**: CORS proxy configuration
- **Jira**: API credentials for web deployment
- **App**: Web deployment settings

## Service Selection Logic

```javascript
// In jiraApiService.js
const jiraApiService = isLocalDevelopment ? localService : webService;

// In jiraStatusService.js
if (isLocalDevelopment) {
  // Use local proxy server
  response = await fetch(LOCAL_ROUTES.getIssueUrl(ticketKey));
} else {
  // Use web service with CORS proxy
  response = await fetch(WEB_ROUTES.getIssueUrl(ticketKey), {
    headers: { 'Authorization': `Basic ${credentials}` }
  });
}
```

## Import Structure

### App Components
```javascript
// All components import from the main service loader
import { createJiraTicket } from '../services/jiraApiService';
```

### Service Files
```javascript
// Local service
import { LOCAL_ROUTES } from '../config/routes.local.js';
import { CONFIG } from '../config/config.local.js';

// Web service
import { WEB_ROUTES } from '../config/routes.web.js';
import { CONFIG } from '../config/config.web.js';
```

## Debugging

### Console Messages
- **Environment Detection**: Shows hostname, port, environment flags
- **Service Selection**: Shows which service was selected
- **Function Calls**: Shows which service is being used for each operation

### Example Console Output
```
🔍 ENVIRONMENT DETECTION: {hostname: "localhost", port: "3002", isLocalDevelopment: true}
🎯 SELECTED SERVICE: LOCAL SERVICE
🎫 Creating ticket with: LOCAL
```

## Testing

### Local Environment
1. Start proxy server: `node server.js`
2. Start React app: `npm start`
3. Access: `http://localhost:3002`
4. Check console for "LOCAL SERVICE" messages

### Web Environment
1. Deploy to GitHub Pages or similar
2. Access deployed URL
3. Check console for "WEB SERVICE" messages

## Benefits of This Separation

1. **Clean Architecture**: Each environment has its own service files
2. **No Cross-Contamination**: Local and web services are completely separate
3. **Easy Maintenance**: Update services independently
4. **Environment-Specific Features**: Each service can have unique features
5. **Debugging**: Clear console messages show which service is being used
6. **Scalability**: Easy to add new environments or modify existing ones

## File Structure

```
src/
├── services/
│   ├── jiraApiService.js          # Main service loader
│   ├── jiraApiService.local.js    # Local development service
│   ├── jiraApiService.web.js      # Web deployment service
│   └── jiraStatusService.js       # Status service (environment-aware)
├── config/
│   ├── config.local.js            # Local configuration
│   ├── config.web.js              # Web configuration
│   ├── routes.local.js            # Local route configuration
│   └── routes.web.js              # Web route configuration
└── ...
```

This separation ensures that local and web environments are completely independent and use their own dedicated services and configurations.
