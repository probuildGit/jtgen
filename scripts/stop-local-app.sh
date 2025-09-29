#!/bin/bash

# Stop Local App Script
# Stops both React dev server and proxy server

echo "🛑 Stopping Local JTGen App..."

# Function to kill process by PID file
kill_by_pid_file() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "🛑 Stopping $service_name (PID: $pid)..."
            kill $pid
            rm -f "$pid_file"
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name was not running (PID file exists but process not found)"
            rm -f "$pid_file"
        fi
    else
        echo "ℹ️  No PID file found for $service_name"
    fi
}

# Function to kill process by port
kill_by_port() {
    local port=$1
    local service_name=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "🛑 Stopping $service_name on port $port (PID: $pid)..."
        kill $pid
        echo "✅ $service_name stopped"
    else
        echo "ℹ️  No $service_name running on port $port"
    fi
}

# Stop proxy server
kill_by_pid_file "proxy.pid" "Proxy Server"
kill_by_port 3001 "Proxy Server"

# Stop React dev server
kill_by_port 3000 "React Dev Server"

# Clean up log files
if [ -f "proxy.log" ]; then
    echo "🧹 Cleaning up proxy log file..."
    rm -f proxy.log
fi

echo ""
echo "✅ Local JTGen App stopped successfully!"
echo "💡 To start again, run: ./scripts/start-local-app.sh"
