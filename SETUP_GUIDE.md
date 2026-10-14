# JTGen Setup Guide

## Configuration Setup

### For Local Development

1. **Edit `src/config/config.local.js`**:
   ```javascript
   JIRA: {
     BASE_URL: 'https://probuild.atlassian.net',
     PROJECT_KEY: 'PB',
     PROJECT_NAME: 'ProBuild',
     AUTH_TOKEN: 'YOUR_ACTUAL_AUTH_TOKEN_HERE', // Replace with your actual Jira API token
     EMAIL: 'YOUR_ACTUAL_EMAIL@domain.com' // Replace with your actual email
   }
   ```

2. **Start the local proxy server**:
   ```bash
   node server.js
   ```

3. **Start the React app**:
   ```bash
   npm start
   ```

### For Web Deployment (GitHub Pages)

1. **Edit `src/config/config.web.js`**:
   ```javascript
   JIRA: {
     BASE_URL: 'https://probuild.atlassian.net',
     PROJECT_KEY: 'PB',
     PROJECT_NAME: 'ProBuild',
     AUTH_TOKEN: 'YOUR_ACTUAL_AUTH_TOKEN_HERE', // Replace with your actual Jira API token
     EMAIL: 'YOUR_ACTUAL_EMAIL@domain.com' // Replace with your actual email
   }
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   git add .
   git commit -m "Update web config"
   git push origin gh-pages
   ```

## How It Works

- **Local Development**: Uses a local proxy server (`server.js`) to handle API calls
- **Web Deployment**: Uses CORS proxy (`api.allorigins.win`) to bypass CORS restrictions
- **Smart Detection**: The app automatically detects the environment and uses the appropriate configuration

## Security Notes

- Never commit `src/config/config.local.js` to git (it's in .gitignore)
- The web config is public, so be careful with credentials
- Consider using environment variables for production deployments

## Getting Jira API Token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name (e.g., "JTGen App")
4. Copy the token and use it in the config files
