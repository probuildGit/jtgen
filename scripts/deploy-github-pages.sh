#!/bin/bash

# GitHub Pages Deployment Script for JTGen
# This script creates a static version that works on GitHub Pages

echo "🚀 Starting GitHub Pages deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Create backup of current configuration
echo "📦 Creating backup of current configuration..."
cp -r src/constants/jiraConfig.js src/constants/jiraConfig.backup.js 2>/dev/null || echo "No jiraConfig.js to backup"
cp src/services/jiraApiService.js src/services/jiraApiService.backup.js 2>/dev/null || echo "No jiraApiService.js to backup"

# Create static version of jiraApiService
echo "🔧 Creating static version of Jira API service..."
cp src/services/jiraApiService.static.js src/services/jiraApiService.js

# Create GitHub Pages specific configuration
echo "🔧 Creating GitHub Pages configuration..."

# Create temporary jiraConfig.js for GitHub Pages
cat > src/constants/jiraConfig.deploy.js << 'EOF'
// GitHub Pages Configuration - Replace with actual values
export const JIRA_CONFIG = {
  BASE_URL: 'https://probuild.atlassian.net',
  PROJECT_KEY: 'PB',
  PROJECT_NAME: 'Probuild-V2',
  AUTH_TOKEN: 'YOUR_ACTUAL_TOKEN_HERE',
  EMAIL: 'dana@codelovers.com'
};

// Import data lists from formData.js
export {
  PLATFORM_OPTIONS,
  PRIORITY_OPTIONS,
  COMPONENTS,
  EPICS
} from '../data/formData.js';
EOF

# Move deployment config to actual location
mv src/constants/jiraConfig.deploy.js src/constants/jiraConfig.js

echo "✅ GitHub Pages configuration created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update the configuration files with your actual values"
echo "2. Install gh-pages: npm install --save-dev gh-pages"
echo "3. Update homepage URL in package.json"
echo "4. Commit and push to GitHub"
echo "5. Enable GitHub Pages in repository settings"
echo "6. Run './scripts/restore-github-pages.sh' to restore your local configuration"
echo ""
echo "⚠️  IMPORTANT: Never commit the actual configuration files with real credentials!"
