#!/bin/bash

echo "🚀 Starting Web App on port 3000..."
echo "📁 This will ALWAYS use the web-development branch"

# Ensure we are on the web branch
echo "📁 Switching to web-development branch..."
git checkout web-development

# Start the React app on port 3000
echo "⚛️  Starting React app on port 3000..."
PORT=3000 npm start &
REACT_PID=$!

echo "✅ Web app is now running!"
echo "🌐 Web App: http://localhost:3000"
echo "Press Ctrl+C to stop the server"

# Function to kill background processes on exit
cleanup() {
    echo "Stopping web app server..."
    kill $REACT_PID
    echo "Web app server stopped."
}

# Trap Ctrl+C and call cleanup function
trap cleanup SIGINT

wait $REACT_PID