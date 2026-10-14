#!/bin/bash

# GitHub Pages Restore Script
# This script restores your local configuration after GitHub Pages deployment

echo "🔄 Restoring local configuration after GitHub Pages deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Restore jiraConfig.js from backup
if [ -f "src/constants/jiraConfig.backup.js" ]; then
    echo "📦 Restoring jiraConfig.js..."
    mv src/constants/jiraConfig.backup.js src/constants/jiraConfig.js
    echo "✅ jiraConfig.js restored successfully!"
else
    echo "⚠️  No jiraConfig.js backup found. You'll need to manually restore your configuration."
fi

# Restore jiraApiService.js from backup
if [ -f "src/services/jiraApiService.backup.js" ]; then
    echo "📦 Restoring jiraApiService.js..."
    mv src/services/jiraApiService.backup.js src/services/jiraApiService.js
    echo "✅ jiraApiService.js restored successfully!"
else
    echo "⚠️  No jiraApiService.js backup found. You'll need to manually restore your configuration."
fi

echo ""
echo "🎉 Local configuration restored!"
echo "🚀 Your app should now work with your local settings (with proxy server)."
echo ""
echo "💡 To start the app:"
echo "   npm start"
echo ""
echo "💡 To start the server:"
echo "   node server.js"
