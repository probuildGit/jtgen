const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Jira configuration - Replace with actual values for local development
const JIRA_CONFIG = {
  BASE_URL: 'https://your-domain.atlassian.net',
  PROJECT_KEY: 'YOUR_PROJECT_KEY',
  PROJECT_NAME: 'Your Project Name',
  AUTH_TOKEN: 'YOUR_AUTH_TOKEN_HERE',
  EMAIL: 'your-email@domain.com'
};

// Create axios instance for Jira API
const jiraApi = axios.create({
  baseURL: 'https://probuild.atlassian.net/rest/api/3',
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
    const response = await jiraApi.get('/project/PB');
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
      ticketUrl: `https://probuild.atlassian.net/browse/${response.data.key}`
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
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    
    // Upload to Jira
    const response = await axios.post(
      `https://probuild.atlassian.net/rest/api/3/issue/${req.params.issueKey}/attachments`,
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

// JAM Content Fetching Endpoints

/**
 * Fetch JAM content using static HTML parsing
 */
app.get('/jam/fetch-content', async (req, res) => {
  try {
    const jamUrl = req.query.url;
    
    if (!jamUrl) {
      return res.status(400).json({
        success: false,
        error: 'JAM URL is required'
      });
    }

    console.log('🔍 PROXY: Fetching JAM content from:', jamUrl);

    // Fetch the JAM page
    const response = await axios.get(jamUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; JTGenApp/1.0)'
      },
      timeout: 10000
    });

    const htmlContent = response.data;
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    console.log('🔍 PROXY: Extracted title:', title);

    res.json({
      success: true,
      data: {
        title: title,
        htmlContent: htmlContent
      }
    });

  } catch (error) {
    console.error('🔍 PROXY: Error fetching JAM content:', error.message);
    res.status(500).json({
      success: false,
      error: `Failed to fetch JAM content: ${error.message}`
    });
  }
});

/**
 * Fetch JAM content using Playwright for dynamic content
 */
app.get('/jam/fetch-content-rendered', async (req, res) => {
  let browser = null;
  
  try {
    const jamUrl = req.query.url;
    
    if (!jamUrl) {
      return res.status(400).json({
        success: false,
        error: 'JAM URL is required'
      });
    }

    console.log('🔍 PROXY: Fetching rendered JAM content from:', jamUrl);

    // Launch browser
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; JTGenApp/1.0)'
    });
    
    const page = await context.newPage();
    
    // Set timeout
    page.setDefaultTimeout(15000);
    
    // Navigate to the JAM page
    await page.goto(jamUrl, { waitUntil: 'networkidle' });
    
    // Wait a bit for dynamic content to load
    await page.waitForTimeout(2000);
    
    // Extract the title
    const title = await page.title();
    
    // Try to get additional content that might be dynamically loaded
    const additionalContent = await page.evaluate(() => {
      // Look for common content selectors
      const selectors = [
        'h1',
        '[data-testid="title"]',
        '.title',
        '.jam-title',
        'main h1',
        'article h1'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          return element.textContent.trim();
        }
      }
      
      return '';
    });

    console.log('🔍 PROXY: Extracted title:', title);
    console.log('🔍 PROXY: Additional content:', additionalContent);

    res.json({
      success: true,
      data: {
        title: title,
        additionalContent: additionalContent
      }
    });

  } catch (error) {
    console.error('🔍 PROXY: Error fetching rendered JAM content:', error.message);
    res.status(500).json({
      success: false,
      error: `Failed to fetch rendered JAM content: ${error.message}`
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to: ${JIRA_CONFIG.BASE_URL}/rest/api/3`);
  console.log(`JAM endpoints available at: /jam/fetch-content and /jam/fetch-content-rendered`);
});
