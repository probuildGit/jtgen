#!/bin/bash

# Start Local App Script
# Ensures both React dev server and proxy server are running

echo "🚀 Starting Local JTGen App..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the JTGenApp root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start proxy server
start_proxy() {
    echo "🔧 Starting proxy server on port 3001..."
    if check_port 3001; then
        echo "✅ Proxy server already running on port 3001"
    else
        echo "🚀 Starting proxy server..."
        nohup node server.js > proxy.log 2>&1 &
        PROXY_PID=$!
        echo $PROXY_PID > proxy.pid
        echo "✅ Proxy server started with PID: $PROXY_PID"
        
        # Wait a moment for server to start
        sleep 2
        
        # Test if proxy server is responding
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            echo "✅ Proxy server is responding"
        else
            echo "⚠️  Proxy server started but may not be fully ready yet"
        fi
    fi
}

# Function to start React dev server
start_react() {
    echo "⚛️  Starting React development server..."
    if check_port 3000; then
        echo "✅ React dev server already running on port 3000"
    else
        echo "🚀 Starting React dev server..."
        npm start
    fi
}

# Start proxy server first
start_proxy

# Start React dev server
start_react

echo ""
echo "🎉 Local JTGen App is starting up!"
echo "📱 React App: http://localhost:3000"
echo "🔧 Proxy Server: http://localhost:3001"
echo ""
echo "💡 To stop the app, run: ./scripts/stop-local-app.sh"
echo "📋 To check status, run: ./scripts/check-local-app.sh"
