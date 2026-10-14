#!/bin/bash

# JTGen never uses port 3000 — local stack is 3001 (proxy) + 3002 (app). Web-branch preview uses 3003.
echo "🚀 Starting Web App on port 3003 (3000 is never used for JTGen)..."
echo "📁 This will ALWAYS use the web-development branch"
echo "🔄 Switching to web branch and starting web app..."

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📝 Current branch: $CURRENT_BRANCH"

# Switch to web branch
echo "📁 Switching to web-development branch..."
git checkout web-development

# Copy web package.json
echo "📦 Using web package.json configuration..."
cp package.web.json package.json

# Start the React app on port 3003 (never 3000)
echo "⚛️  Starting React app on port 3003..."
PORT=3003 npm start &
REACT_PID=$!

echo "✅ Web app is now running!"
echo "🌐 Web App: http://localhost:3003"
echo "📝 You were on branch: $CURRENT_BRANCH"
echo "Press Ctrl+C to stop the server"

# Function to kill background processes on exit
cleanup() {
    echo "Stopping web app server..."
    kill $REACT_PID 2>/dev/null
    echo "Web app server stopped."
}

# Trap Ctrl+C and call cleanup function
trap cleanup SIGINT

wait $REACT_PID
