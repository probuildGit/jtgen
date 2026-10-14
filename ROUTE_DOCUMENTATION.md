# Route Documentation

This document outlines the route configurations for both local and web services in the JTGen application.

## Route Configuration Files

### Local Routes (`src/config/routes.local.js`)
- **Base URL**: `http://localhost:3001`
- **Purpose**: Routes for local development using proxy server
- **Proxy Server**: `server.js` running on port 3001

### Web Routes (`src/config/routes.web.js`)
- **Base URL**: `https://corsproxy.io/?` + encoded Jira API URL
- **Purpose**: Routes for web deployment using CORS proxy
- **Target**: Direct Jira API calls through CORS proxy

## Route Endpoints

### Local Service Routes (Proxy Server)

| Endpoint | Method | Purpose | Parameters |
|----------|--------|---------|------------|
| `/health` | GET | Health check | None |
| `/test-connectivity` | GET | Test Jira API connection | None |
| `/create-ticket` | POST | Create new Jira ticket | Ticket payload |
| `/issue/:issueKey` | GET | Get issue details | issueKey |
| `/issue/:issueKey` | PUT | Update issue | issueKey, update payload |
| `/search` | GET | Search issues | jql, fields (query params) |
| `/upload-attachment/:issueKey` | POST | Upload file attachment | issueKey, file |

### Web Service Routes (CORS Proxy)

| Endpoint | Method | Purpose | Parameters |
|----------|--------|---------|------------|
| `/project/:projectKey` | GET | Get project details | projectKey |
| `/issue` | POST | Create new Jira ticket | Ticket payload |
| `/issue/:issueKey` | GET | Get issue details | issueKey |
| `/issue/:issueKey` | PUT | Update issue | issueKey, update payload |
| `/search` | GET | Search issues | jql, fields (query params) |
| `/issue/:issueKey/attachments` | POST | Upload file attachment | issueKey, file |

## Service Usage

### Local Development
```javascript
import { LOCAL_ROUTES } from '../config/routes.local.js';

// Get issue URL
const issueUrl = LOCAL_ROUTES.getIssueUrl('PB-123');

// Upload attachment URL
const uploadUrl = LOCAL_ROUTES.getUploadAttachmentUrl('PB-123');
```

### Web Deployment
```javascript
import { WEB_ROUTES } from '../config/routes.web.js';

// Get issue URL (with CORS proxy)
const issueUrl = WEB_ROUTES.getIssueUrl('PB-123');

// Upload attachment URL (with CORS proxy)
const uploadUrl = WEB_ROUTES.getUploadAttachmentUrl('PB-123');
```

## Route Helper Functions

### Local Routes
- `buildUrl(endpoint, params)` - Build URL with parameter replacement
- `getHealthUrl()` - Get health check URL
- `getTestConnectivityUrl()` - Get connectivity test URL
- `getCreateTicketUrl()` - Get ticket creation URL
- `getIssueUrl(issueKey)` - Get issue details URL
- `getUpdateIssueUrl(issueKey)` - Get issue update URL
- `getSearchUrl(jql, fields)` - Get search URL with query parameters
- `getUploadAttachmentUrl(issueKey)` - Get attachment upload URL

### Web Routes
- `buildUrl(endpoint, params)` - Build Jira API URL
- `buildCorsUrl(endpoint, params)` - Build CORS proxy URL
- `encodeUrl(url)` - Encode URL for CORS proxy
- `getProjectUrl(projectKey)` - Get project details URL
- `getCreateTicketUrl()` - Get ticket creation URL
- `getIssueUrl(issueKey)` - Get issue details URL
- `getUpdateIssueUrl(issueKey)` - Get issue update URL
- `getSearchUrl(jql, fields)` - Get search URL with query parameters
- `getUploadAttachmentUrl(issueKey)` - Get attachment upload URL

## Environment Detection

The services automatically detect the environment and use the appropriate routes:

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

## Route Consistency

All services now use the centralized route configurations:

1. **Local Service** (`jiraApiService.local.js`) - Uses `LOCAL_ROUTES`
2. **Web Service** (`jiraApiService.web.js`) - Uses `WEB_ROUTES`
3. **Status Service** (`jiraStatusService.js`) - Uses both route configs based on environment

This ensures consistency and makes it easy to maintain and update routes across all services.
