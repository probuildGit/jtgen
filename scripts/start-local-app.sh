#!/bin/bash

echo "🚀 Starting Local App on port 3002..."
echo "📁 This will ALWAYS use the local-environment-working-backup branch"

# Ensure we are on the local branch
echo "📁 Switching to local-environment-working-backup branch..."
git checkout local-environment-working-backup

# Start the proxy server in the background
echo "🔗 Starting proxy server on port 3001..."
node server.js &
PROXY_PID=$!

# Start the React app on port 3002
echo "⚛️  Starting React app on port 3002..."
PORT=3002 npm start &
REACT_PID=$!

echo "✅ Local app is now running!"
echo "🌐 Local App: http://localhost:3002"
echo "🔗 Proxy Server: http://localhost:3001"
echo "Press Ctrl+C to stop both servers"

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $PROXY_PID
    kill $REACT_PID
    echo "Servers stopped."
}

# Trap Ctrl+C and call cleanup function
trap cleanup SIGINT

wait $REACT_PID