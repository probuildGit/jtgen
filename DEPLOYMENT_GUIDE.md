# 🚀 JTGen Deployment Guide

This guide will help you deploy JTGen to your existing GitHub repository at [https://github.com/probuildGit/jtgen](https://github.com/probuildGit/jtgen) with proper branching strategy.

## 📋 **Branching Strategy**

### **Main Branch (`main`)**
- ✅ **Safe for GitHub** - No sensitive credentials
- ✅ **Production ready** - All features implemented
- ✅ **GitHub Pages compatible** - Static version included

### **Development Branch (`development`)**
- 🔧 **Local development** - With real credentials
- 🔧 **Backend server** - Full functionality
- 🔧 **Testing environment** - For new features

## 🛡️ **Security First Approach**

Your repository is now **secure by default**:
- ✅ **No real credentials** in Git
- ✅ **Placeholder values** for safe deployment
- ✅ **Local configuration** separate from deployment
- ✅ **GitHub protection** enabled (detected tokens)

## 🚀 **Deployment Process**

### **Step 1: Push Safe Code to Main Branch**

```bash
# Add all files (now with placeholder credentials)
git add .

# Commit with safe credentials
git commit -m "Initial commit: JTGen with image embedding and modular components"

# Push to main branch
git push -u origin main
```

### **Step 2: Create Development Branch**

```bash
# Create and switch to development branch
git checkout -b development

# Update configuration with real values
# Edit these files with your actual credentials:
# - src/constants/jiraConfig.js
# - server.js
# - src/services/jiraApiService.static.js

# Commit development configuration
git add .
git commit -m "Development: Add real Jira credentials"

# Push development branch
git push -u origin development
```

### **Step 3: Set Up GitHub Pages**

```bash
# Switch back to main branch
git checkout main

# Install GitHub Pages dependencies
npm install --save-dev gh-pages

# Update package.json homepage URL
# Add: "homepage": "https://probuildGit.github.io/jtgen"
# Add: "predeploy": "npm run build"
# Add: "deploy": "gh-pages -d build"

# Deploy to GitHub Pages
npm run deploy
```

### **Step 4: Enable GitHub Pages**

1. Go to [https://github.com/probuildGit/jtgen/settings/pages](https://github.com/probuildGit/jtgen/settings/pages)
2. Under "Source", select "Deploy from a branch"
3. Select "gh-pages" branch
4. Click "Save"

## 🔄 **Workflow for Updates**

### **For New Features:**
```bash
# Work on development branch
git checkout development

# Make your changes
# Test locally with real credentials

# When ready for production
git checkout main
git merge development

# Deploy to GitHub Pages
npm run deploy
```

### **For Configuration Changes:**
```bash
# Update development branch
git checkout development
# Update real credentials
git commit -m "Config: Update Jira settings"

# Update main branch with placeholder values
git checkout main
# Update placeholder values
git commit -m "Config: Update placeholder values"

# Deploy
npm run deploy
```

## 🌐 **Your App URLs**

- **GitHub Pages (Online)**: `https://probuildGit.github.io/jtgen`
- **Local Development**: `http://localhost:3000`
- **Backend Server**: `http://localhost:3001`

## 📁 **File Structure**

```
JTGenApp/
├── src/
│   ├── constants/
│   │   └── jiraConfig.js          # Placeholder credentials (main)
│   ├── services/
│   │   ├── jiraApiService.js      # Proxy version (development)
│   │   └── jiraApiService.static.js # Direct API version (main)
│   └── ...
├── server.js                      # Backend server (development)
├── scripts/
│   ├── deploy-github-pages.sh     # GitHub Pages deployment
│   └── restore-github-pages.sh    # Restore local config
└── DEPLOYMENT_GUIDE.md            # This guide
```

## 🔧 **Configuration Files**

### **For Local Development (development branch):**
```javascript
// src/constants/jiraConfig.js
export const JIRA_CONFIG = {
  BASE_URL: 'https://probuild.atlassian.net',
  PROJECT_KEY: 'PB',
  PROJECT_NAME: 'Probuild-V2',
  AUTH_TOKEN: 'YOUR_REAL_TOKEN',
  EMAIL: 'dana@codelovers.com'
};
```

### **For GitHub Pages (main branch):**
```javascript
// src/constants/jiraConfig.js
export const JIRA_CONFIG = {
  BASE_URL: 'https://your-domain.atlassian.net',
  PROJECT_KEY: 'YOUR_PROJECT_KEY',
  PROJECT_NAME: 'Your Project Name',
  AUTH_TOKEN: 'YOUR_AUTH_TOKEN_HERE',
  EMAIL: 'your-email@domain.com'
};
```

## 🛡️ **Security Best Practices**

1. **Never commit real credentials** to main branch
2. **Use development branch** for local testing
3. **Update placeholders** before GitHub Pages deployment
4. **Regularly rotate** your Jira API token
5. **Monitor API usage** in Jira

## 🐛 **Troubleshooting**

### **GitHub Push Protection:**
If you see "Push cannot contain secrets":
1. Remove real credentials from files
2. Use placeholder values
3. Commit and push again

### **GitHub Pages Not Working:**
1. Check homepage URL in package.json
2. Verify gh-pages package is installed
3. Check repository settings
4. Look for build errors

### **Local App Broken:**
1. Switch to development branch
2. Update with real credentials
3. Start backend server: `node server.js`

## 📋 **Quick Commands**

```bash
# Switch to development (with real credentials)
git checkout development

# Switch to main (safe for GitHub)
git checkout main

# Deploy to GitHub Pages
npm run deploy

# Start local development
npm start

# Start backend server
node server.js
```

## 🎉 **Success!**

Your app is now:
- ✅ **Securely deployed** to GitHub
- ✅ **Available online** via GitHub Pages
- ✅ **Protected from credential leaks**
- ✅ **Ready for development** with proper branching

**Live URL**: `https://probuildGit.github.io/jtgen`
