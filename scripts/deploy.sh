#!/bin/bash

# JTGen Deployment Script
# This script safely deploys the app to GitHub while preserving local configuration

echo "🚀 Starting JTGen deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Create backup of current configuration
echo "📦 Creating backup of current configuration..."
cp -r src/constants/jiraConfig.js src/constants/jiraConfig.backup.js 2>/dev/null || echo "No jiraConfig.js to backup"
cp server.js server.backup.js 2>/dev/null || echo "No server.js to backup"

# Create temporary configuration files for deployment
echo "🔧 Creating deployment configuration..."

# Create temporary jiraConfig.js for deployment
cat > src/constants/jiraConfig.deploy.js << 'EOF'
// Deployment Configuration - Replace with actual values
export const JIRA_CONFIG = {
  BASE_URL: 'https://your-domain.atlassian.net',
  PROJECT_KEY: 'YOUR_PROJECT_KEY',
  PROJECT_NAME: 'Your Project Name',
  AUTH_TOKEN: 'YOUR_AUTH_TOKEN_HERE',
  EMAIL: 'your-email@domain.com'
};

// Import data lists from formData.js
export {
  PLATFORM_OPTIONS,
  PRIORITY_OPTIONS,
  COMPONENTS,
  EPICS
} from '../data/formData.js';
EOF

# Create temporary server.js for deployment
cat > server.deploy.js << 'EOF'
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Jira configuration - Replace with your actual values
const JIRA_CONFIG = {
  BASE_URL: 'https://your-domain.atlassian.net',
  AUTH_TOKEN: 'YOUR_AUTH_TOKEN_HERE',
  EMAIL: 'your-email@domain.com'
};

// Create axios instance for Jira API
const jiraApi = axios.create({
  baseURL: 'https://your-domain.atlassian.net/rest/api/3',
  auth: {
    username: JIRA_CONFIG.EMAIL,
    password: JIRA_CONFIG.AUTH_TOKEN
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

// Test connectivity endpoint
app.get('/test-connectivity', async (req, res) => {
  try {
    const response = await jiraApi.get('/project/YOUR_PROJECT_KEY');
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create ticket endpoint
app.post('/create-ticket', async (req, res) => {
  try {
    const response = await jiraApi.post('/issue', req.body);
    
    res.json({
      success: true,
      data: response.data,
      ticketKey: response.data.key,
      ticketUrl: `https://your-domain.atlassian.net/browse/${response.data.key}`
    });
    
  } catch (error) {
    console.error('Ticket creation error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Get issue endpoint
app.get('/issue/:issueKey', async (req, res) => {
  try {
    const response = await jiraApi.get(`/issue/${req.params.issueKey}`);
    
    res.json({
      success: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('Get issue error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Update issue endpoint
app.put('/issue/:issueKey', async (req, res) => {
  try {
    const response = await jiraApi.put(`/issue/${req.params.issueKey}`, req.body);
    
    res.json({
      success: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('Update issue error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Search issues endpoint
app.get('/search', async (req, res) => {
  try {
    const response = await jiraApi.get(`/search?jql=${req.query.jql}&fields=${req.query.fields || 'status,summary'}`);
    
    res.json({
      success: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('Search error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Upload attachment endpoint
app.post('/upload-attachment/:issueKey', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }
    
    // Create form data for Jira API
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    
    // Upload to Jira
    const response = await axios.post(
      `https://your-domain.atlassian.net/rest/api/3/issue/${req.params.issueKey}/attachments`,
      formData,
      {
        auth: {
          username: JIRA_CONFIG.EMAIL,
          password: JIRA_CONFIG.AUTH_TOKEN
        },
        headers: {
          ...formData.getHeaders(),
          'X-Atlassian-Token': 'no-check'
        }
      }
    );
    
    res.json({
      success: true,
      data: response.data[0] // Jira returns an array, we want the first attachment
    });
    
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to: ${JIRA_CONFIG.BASE_URL}/rest/api/3`);
});
EOF

# Move deployment files to actual locations
mv src/constants/jiraConfig.deploy.js src/constants/jiraConfig.js
mv server.deploy.js server.js

echo "✅ Deployment configuration created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update the configuration files with your actual values"
echo "2. Commit and push to GitHub"
echo "3. Run './scripts/restore.sh' to restore your local configuration"
echo ""
echo "⚠️  IMPORTANT: Never commit the actual configuration files with real credentials!"
