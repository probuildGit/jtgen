# JTGen - Jira Ticket Generator
## Complete Application Manual

---

## Table of Contents

### Part I: User Manual
1. [Application Overview](#application-overview)
2. [Getting Started](#getting-started)
3. [Form Fields Guide](#form-fields-guide)
4. [Buttons and Actions](#buttons-and-actions)
5. [Features and Functionalities](#features-and-functionalities)
6. [Troubleshooting](#troubleshooting)

### Part II: Developer Documentation
1. [Architecture Overview](#architecture-overview)
2. [Environment Separation](#environment-separation)
3. [File Structure](#file-structure)
4. [Core Components](#core-components)
5. [Services and APIs](#services-and-apis)
6. [Data Flow](#data-flow)
7. [Deployment Guide](#deployment-guide)

---

## Part I: User Manual

### Application Overview

**JTGen** is a web application designed to streamline the creation of Jira bug tickets for the ProBuild project. It provides a user-friendly interface for developers and testers to quickly generate properly formatted tickets with all necessary information.

#### Key Features:
- **Smart Form Interface**: Intuitive form with validation and auto-suggestions
- **Environment Detection**: Automatically adapts to local development or web deployment
- **Image Embedding**: Automatically embeds uploaded images into ticket descriptions
- **Custom Modules**: Support for both predefined and custom module/page names
- **Ticket History**: Track and manage previously created tickets
- **Preview System**: Review tickets before creation

### Getting Started

#### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for web deployment)
- Local development server (for local environment)

#### Accessing the Application

**Local Development:**
1. Navigate to `http://localhost:3000`
2. Ensure the proxy server is running on `http://localhost:3001`

**Web Deployment:**
1. Navigate to the deployed URL (e.g., GitHub Pages)
2. No additional setup required

### Form Fields Guide

#### Summary Section

**Platform** *(Required)*
- **Purpose**: Specifies the target platform for the bug
- **Options**: 
  - `WEB` - Website/Web application
  - `APP` - Mobile application
- **Usage**: Select the platform where the bug occurs

**Module/Page** *(Required)*
- **Purpose**: Identifies the specific module or page where the bug occurs
- **Features**:
  - **Dropdown Suggestions**: Predefined modules from the system
  - **Free Text Input**: Type any custom module name
  - **Auto-complete**: Shows suggestions as you type
- **Usage**: 
  - Click dropdown to see predefined options
  - Type directly for custom modules
  - No need to select "custom" option

**Summary** *(Required)*
- **Purpose**: Brief description of the bug
- **Format**: Short, descriptive text
- **Example**: "Login button not responding on mobile"

#### Basic Fields

**Priority** *(Required)*
- **Purpose**: Sets the urgency level of the bug
- **Options**:
  - `Highest` - Critical issues affecting core functionality
  - `High` - Important issues affecting user experience
  - `Medium` - Standard bugs that need fixing
  - `Low` - Minor issues or enhancements

**Component** *(Required)*
- **Purpose**: Categorizes the bug by system component
- **Options**: Predefined components like:
  - Mobile - Home Screen
  - Website - Authentication
  - Mobile - Quality Control
  - Server components
- **Usage**: Select the most relevant component

**Epic Link** *(Required)*
- **Purpose**: Links the bug to a specific epic or feature
- **Options**: Predefined epics from the project
- **Usage**: Select the epic this bug relates to, or "None" if not applicable

#### Description Fields

**Steps to Reproduce** *(Optional)*
- **Purpose**: Detailed steps to reproduce the bug
- **Format**: Numbered list or paragraph
- **Example**: 
  ```
  1. Navigate to login page
  2. Enter invalid credentials
  3. Click login button
  4. Observe error message
  ```
- **Special**: Automatically detects JAM links and changes label to "JAM:"

**Expected Behavior** *(Optional)*
- **Purpose**: Describes what should happen
- **Format**: Clear, concise description
- **Example**: "User should see error message and remain on login page"

**Actual Behavior** *(Optional)*
- **Purpose**: Describes what actually happens
- **Format**: Clear, concise description
- **Example**: "User is redirected to dashboard with no error message"
- **Special**: Automatically detects JAM links and changes label to "JAM:"

**Note** *(Optional)*
- **Purpose**: Additional context or information
- **Format**: Free text
- **Special**: 
  - Automatically detects URLs and changes label to "URL:"
  - URLs become clickable links in the ticket

#### Attachments

**File Upload**
- **Purpose**: Attach screenshots, logs, or other relevant files
- **Supported Formats**:
  - Images: JPEG, PNG, GIF
  - Documents: PDF
  - Text files: TXT
- **Size Limit**: 10MB per file
- **Features**:
  - Drag and drop support
  - Click to select files
  - Multiple file selection
  - Automatic image embedding in ticket description

### Buttons and Actions

#### Primary Actions

**Preview Ticket**
- **Purpose**: Review the ticket before creation
- **Function**: Opens a preview dialog showing:
  - Ticket summary and details
  - Formatted description
  - Attached files
- **Usage**: Click to review, then "Create Ticket" or "Back to Form"

**Create Ticket**
- **Purpose**: Submit the ticket to Jira
- **Function**: 
  - Validates all required fields
  - Creates ticket in Jira
  - Uploads attachments
  - Embeds images in description
  - Shows success message with ticket link
- **States**: 
  - Normal: "Create Ticket"
  - Loading: "Creating Ticket..."

**Clear Form**
- **Purpose**: Reset the form to initial state
- **Function**: Clears all fields and attachments
- **Usage**: Click to start over

#### Secondary Actions

**History**
- **Purpose**: View previously created tickets
- **Function**: Opens history dialog showing:
  - List of created tickets
  - Ticket status and details
  - Links to view tickets in Jira
  - Refresh status functionality

**Close/Cancel**
- **Purpose**: Close dialogs or cancel actions
- **Function**: Returns to main form without saving

### Features and Functionalities

#### Smart Form Validation
- **Real-time Validation**: Fields are validated as you type
- **Visual Indicators**: 
  - Red border for invalid required fields
  - Green border for valid fields
  - Blue border for optional fields
- **Error Messages**: Clear error messages for validation failures

#### Auto-save and History
- **Local Storage**: Form data is automatically saved locally
- **Ticket History**: All created tickets are stored and tracked
- **Status Updates**: Ticket statuses can be refreshed from Jira

#### Image Embedding
- **Automatic Processing**: Images are automatically embedded in ticket descriptions
- **Proper Formatting**: Images are centered and properly formatted
- **Multiple Images**: Support for multiple image attachments

#### URL Detection
- **Automatic Recognition**: URLs in notes are automatically detected
- **Clickable Links**: URLs become clickable in the ticket
- **Label Changes**: Note field label changes to "URL:" when URL is detected

#### Environment Adaptation
- **Local Development**: Uses local proxy server for API calls
- **Web Deployment**: Uses CORS proxy for API calls
- **Automatic Detection**: No user configuration required

### Troubleshooting

#### Common Issues

**"Failed to create ticket: Invalid response format"**
- **Cause**: Environment detection issue or service configuration
- **Solution**: 
  - For local: Ensure proxy server is running on port 3001
  - For web: Check network connection and CORS settings
  - Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

**"Connection failed"**
- **Cause**: Network issues or server unavailable
- **Solution**: 
  - Check internet connection
  - Verify server status
  - Try again after a few minutes

**Form not saving**
- **Cause**: Browser storage issues
- **Solution**: 
  - Clear browser cache
  - Check if local storage is enabled
  - Try in incognito/private mode

**Images not embedding**
- **Cause**: File format or size issues
- **Solution**: 
  - Ensure images are in supported formats (JPEG, PNG, GIF)
  - Check file size (max 10MB)
  - Try uploading one image at a time

#### Browser Compatibility
- **Recommended**: Chrome, Firefox, Safari, Edge (latest versions)
- **Minimum**: ES6 support required
- **Mobile**: Responsive design works on mobile devices

---

## Part II: Developer Documentation

### Architecture Overview

JTGen follows a modern React-based architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Services      │    │   Backend       │
│   (React)       │◄──►│   (API Layer)   │◄──►│   (Jira API)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Key Architectural Principles:
- **Component-Based**: Modular React components
- **Environment Separation**: Local vs Web service layers
- **Service Abstraction**: Clean API service interfaces
- **Data Flow**: Unidirectional data flow with hooks
- **Separation of Concerns**: Clear boundaries between UI, logic, and data

### Environment Separation

The application supports two distinct environments with automatic detection:

#### Local Development Environment
- **Frontend**: React development server (port 3000)
- **Backend**: Node.js proxy server (port 3001)
- **API**: Direct Jira API calls through proxy
- **Detection**: `localhost`, `127.0.0.1`, port 3000/3001

#### Web Deployment Environment
- **Frontend**: Static build served by hosting platform
- **Backend**: CORS proxy service
- **API**: Jira API calls through CORS proxy
- **Detection**: GitHub Pages, HTTPS protocol

#### Environment Detection Logic
```javascript
// src/utils/environmentDetection.js
export const isLocalDevelopment = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;

  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    port === '3000' ||
    port === '3001' ||
    protocol === 'http:'
  );
};
```

### File Structure

```
src/
├── components/           # React components
│   ├── form/            # Form-specific components
│   │   ├── FormField.js
│   │   ├── ModuleField.js
│   │   ├── FormSection.js
│   │   └── index.js
│   ├── JiraTicketForm.js
│   ├── TicketPreview.js
│   ├── TicketHistory.js
│   └── SuccessPopup.js
├── services/            # API services
│   ├── jiraApiService.js        # Smart service loader
│   ├── jiraApiService.local.js  # Local environment service
│   ├── jiraApiService.web.js    # Web environment service
│   └── jiraStatusService.js     # Status checking service
├── hooks/               # Custom React hooks
│   ├── useJiraTicket.js
│   └── useFileUpload.js
├── utils/               # Utility functions
│   ├── adfBuilder.js           # ADF document builder
│   ├── environmentDetection.js # Environment detection
│   ├── formHelpers.js          # Form validation helpers
│   └── errorHandler.js         # Error handling utilities
├── data/                # Static data and configurations
│   └── formData.js
├── config/              # Environment-specific configurations
│   ├── routes.local.js
│   ├── routes.web.js
│   ├── config.local.js
│   └── config.web.js
└── styles/              # CSS stylesheets
    ├── formStyles.css
    ├── previewStyles.css
    └── historyStyles.css
```

### Core Components

#### JiraTicketForm.js
**Main form component that orchestrates the entire ticket creation process.**

```javascript
// Key responsibilities:
- Form state management
- Field validation
- File upload handling
- Dialog management (preview, history, success)
- Integration with custom hooks
```

**Key Features:**
- Uses `useJiraTicket` hook for ticket data management
- Uses `useFileUpload` hook for file handling
- Manages dialog states (preview, history, success)
- Integrates with ModuleField for custom module support

#### ModuleField.js
**Advanced combobox component for module/page selection.**

```javascript
// Key features:
- Material-UI Autocomplete with freeSolo
- Dropdown suggestions from predefined modules
- Free text input for custom modules
- Real-time validation
- Consistent styling with form theme
```

**Technical Implementation:**
- Uses `freeSolo` prop for free text input
- Manages internal state for input value
- Handles blur events for value persistence
- Provides auto-complete functionality

#### TicketPreview.js
**Preview component for reviewing tickets before creation.**

```javascript
// Key responsibilities:
- Display formatted ticket data
- Show description preview
- List attached files
- Provide confirmation actions
```

#### TicketHistory.js
**History management component for tracking created tickets.**

```javascript
// Key features:
- Local storage integration
- Status refresh functionality
- Environment-aware API calls
- Responsive design
```

### Services and APIs

#### Smart Service Loader (jiraApiService.js)
**Central service that automatically selects the appropriate service based on environment.**

```javascript
// Service selection logic:
const jiraApiService = isLocalDevelopment() ? localService : webService;

// Exported functions:
- testJiraConnectivity()
- createJiraTicket(ticketData)
- uploadAttachment(issueKey, file)
```

#### Local Service (jiraApiService.local.js)
**Service for local development environment using proxy server.**

```javascript
// Key features:
- Uses local proxy server (localhost:3001)
- Direct Jira API integration
- Enhanced attachment handling
- Image embedding in descriptions
- Local storage integration
```

**API Endpoints:**
- `POST /create-ticket` - Create new ticket
- `GET /issue/:issueKey` - Get ticket details
- `POST /upload-attachment/:issueKey` - Upload attachments

#### Web Service (jiraApiService.web.js)
**Service for web deployment using CORS proxy.**

```javascript
// Key features:
- Uses CORS proxy for API calls
- Same functionality as local service
- Web-optimized error handling
- GitHub Pages compatibility
```

#### Status Service (jiraStatusService.js)
**Service for checking ticket statuses.**

```javascript
// Key features:
- Environment-aware API calls
- Status refresh functionality
- Error handling and fallbacks
- Local storage integration
```

### Data Flow

#### Ticket Creation Flow
```
1. User fills form → JiraTicketForm
2. Form validation → useJiraTicket hook
3. Preview (optional) → TicketPreview component
4. Submit → jiraApiService (smart loader)
5. Environment detection → Local/Web service
6. API call → Jira API (via proxy)
7. Response handling → Success/Error states
8. History update → Local storage
9. Success display → SuccessPopup
```

#### File Upload Flow
```
1. User selects files → useFileUpload hook
2. File validation → Size and type checking
3. File storage → Component state
4. Ticket creation → Upload to Jira
5. Image embedding → ADF document builder
6. Description update → Jira API
```

#### Environment Detection Flow
```
1. App initialization → environmentDetection.js
2. Environment check → isLocalDevelopment()
3. Service selection → jiraApiService.js
4. Route configuration → routes.local.js / routes.web.js
5. API calls → Appropriate service
```

### Key Utilities

#### ADF Builder (adfBuilder.js)
**Utility for building Atlassian Document Format (ADF) documents.**

```javascript
// Key functions:
- buildDescriptionContent(ticketData)
- createEmbeddedImageNode(attachmentData)
- createTextWithLinks(text)
- addAttachmentsSection(descriptionContent, attachments)
```

**Features:**
- Automatic URL detection and link creation
- Image embedding with proper formatting
- Dynamic section headers (JAM, URL detection)
- Proper ADF structure for Jira

#### Form Helpers (formHelpers.js)
**Utility functions for form validation and formatting.**

```javascript
// Key functions:
- getFieldValidationClass(field, value, required)
- formatFileSize(bytes)
- Validation state management
```

#### Environment Detection (environmentDetection.js)
**Centralized environment detection logic.**

```javascript
// Key functions:
- isLocalDevelopment()
- isWebDeployment()
- logEnvironmentInfo()
- verifyEnvironmentSeparation()
```

### Configuration Management

#### Route Configuration
**Environment-specific API route definitions.**

```javascript
// routes.local.js
export const LOCAL_ROUTES = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    CREATE_TICKET: '/create-ticket',
    GET_ISSUE: '/issue/:issueKey',
    UPLOAD_ATTACHMENT: '/upload-attachment/:issueKey'
  }
};

// routes.web.js
export const WEB_ROUTES = {
  CORS_PROXY: 'https://corsproxy.io/?',
  JIRA_BASE_URL: 'https://probuild.atlassian.net/rest/api/3',
  ENDPOINTS: {
    CREATE_TICKET: '/issue',
    GET_ISSUE: '/issue/:issueKey',
    UPLOAD_ATTACHMENT: '/issue/:issueKey/attachments'
  }
};
```

#### Form Data Configuration
**Centralized form options and labels.**

```javascript
// formData.js
export const MODULE_OPTIONS = [
  'Action Popup',
  'Budget Module',
  'Dashboard',
  // ... 250+ predefined modules
];

export const PLATFORM_OPTIONS = [
  { value: 'WEB', label: 'WEB' },
  { value: 'APP', label: 'APP' }
];

export const PRIORITY_OPTIONS = [
  { value: '1', label: 'Highest' },
  { value: '2', label: 'High' },
  { value: '3', label: 'Medium' },
  { value: '4', label: 'Low' }
];
```

### Deployment Guide

#### Local Development Setup
```bash
# 1. Install dependencies
npm install

# 2. Start proxy server (Terminal 1)
node server.js

# 3. Start React development server (Terminal 2)
npm start

# 4. Access application
# http://localhost:3000
```

#### Web Deployment (GitHub Pages)
```bash
# 1. Build the application
npm run build

# 2. Deploy to GitHub Pages
npm run deploy

# 3. Access deployed application
# https://username.github.io/JTGenApp
```

#### Environment Variables
**Local Development:**
- No environment variables required
- Uses local proxy server configuration

**Web Deployment:**
- Jira API credentials configured in config files
- CORS proxy settings for API calls

### Error Handling

#### Error Types and Handling
```javascript
// Network errors
- Connection failures
- Timeout errors
- CORS issues

// Validation errors
- Required field validation
- File size/type validation
- Format validation

// API errors
- Jira API errors
- Authentication failures
- Rate limiting

// User errors
- Invalid input
- File upload failures
- Form submission errors
```

#### Error Recovery Strategies
- **Automatic retry** for network errors
- **User feedback** with clear error messages
- **Fallback options** for failed operations
- **Data persistence** to prevent data loss

### Performance Considerations

#### Optimization Strategies
- **Code splitting** for better loading performance
- **Lazy loading** for non-critical components
- **Image optimization** for uploaded files
- **Caching** for API responses
- **Bundle optimization** for production builds

#### Monitoring and Debugging
- **Console logging** for development debugging
- **Error tracking** for production monitoring
- **Performance metrics** for optimization
- **User analytics** for usage patterns

---

## Conclusion

JTGen is a comprehensive Jira ticket generation application that provides both user-friendly functionality and robust developer architecture. The application successfully balances ease of use with technical sophistication, offering a seamless experience for both end users and developers.

The modular architecture, environment separation, and comprehensive error handling make JTGen a reliable and maintainable solution for Jira ticket management in the ProBuild project.

---

*Last Updated: January 2024*
*Version: 1.0.0*
