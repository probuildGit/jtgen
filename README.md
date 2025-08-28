# Jira Ticket Generator App

A React-based application for creating Jira bug tickets for the ProBuild project. This app provides a user-friendly interface to generate tickets with all required fields and attachments.

## Features

- **Summary Generation**: Combines Platform (WEB/APP), Module/Page, and Summary text
- **Rich Description**: Structured description with sections for Steps to Reproduce, Expected Behavior, Actual Behavior, and Notes
- **File Attachments**: Drag & drop file upload with support for images, PDFs, and text files
- **Form Validation**: Client-side validation for required fields
- **Real-time Integration**: Direct integration with Jira REST API
- **Modern UI**: Built with Material-UI for a professional look

## File Structure

```
src/
├── components/
│   └── JiraTicketForm.js          # Main form component
├── constants/
│   └── jiraConfig.js              # Jira configuration and data
├── hooks/
│   └── useJiraTicket.js           # Custom hook for ticket management
├── services/
│   └── jiraApiService.js          # API service for Jira integration
├── utils/
│   └── formHelpers.js             # Utility functions for validation
└── App.js                         # Main application component
```

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Configuration

The app is configured for the ProBuild Jira project with the following settings:

- **Project**: PB (ProBuild-V2)
- **Issue Type**: Bug
- **Assignee**: Tamir Scherzer (automatically set)
- **Reporter**: Dana Hen (automatically set)
- **Status**: To Do (automatically set)

## Usage

### Creating a Ticket

1. **Summary Section**:
   - Select Platform (WEB or APP)
   - Choose Module/Page from dropdown or add custom module
   - Enter summary text

2. **Basic Fields**:
   - Set Priority (Highest, High, Medium, Low)
   - Select Component from available options
   - Optionally link to an Epic

3. **Description Details**:
   - Steps to Reproduce
   - Expected Behavior
   - Actual Behavior
   - Notes (optional)

4. **Attachments**:
   - Drag & drop files or click to select
   - Supported formats: Images (JPEG, PNG, GIF), PDF, Text files
   - Maximum file size: 10MB per file

5. **Submit**:
   - Click "Create Ticket" to submit
   - View the created ticket via the success link

### Form Validation

The app validates:
- Required fields (Platform, Module, Summary, Priority, Component)
- File types and sizes for attachments
- Form data before submission

## API Integration

The app integrates with Jira REST API v3 and includes:

- **Authentication**: Uses API token for secure access
- **Ticket Creation**: Creates tickets with proper Atlassian Document Format
- **File Upload**: Handles attachment uploads
- **Error Handling**: Comprehensive error handling and user feedback

## Dependencies

- **React**: Frontend framework
- **Material-UI**: UI component library
- **Axios**: HTTP client for API calls
- **React Dropzone**: File upload functionality

## Security

- API token is stored in constants (consider environment variables for production)
- File validation prevents malicious uploads
- HTTPS communication with Jira API

## Customization

To customize the app for different projects:

1. Update `src/constants/jiraConfig.js` with your Jira project details
2. Modify the form fields in `src/components/JiraTicketForm.js`
3. Update API endpoints in `src/services/jiraApiService.js`
4. Adjust validation rules in `src/utils/formHelpers.js`

## Support

For issues or questions, please contact the development team.
