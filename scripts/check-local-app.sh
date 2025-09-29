#!/bin/bash

# Check Local App Status Script
# Shows the status of both React dev server and proxy server

echo "🔍 Checking Local JTGen App Status..."
echo ""

# Function to check port status
check_port_status() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -ti:$port 2>/dev/null)
        echo "✅ $service_name: Running on port $port (PID: $pid)"
        return 0
    else
        echo "❌ $service_name: Not running on port $port"
        return 1
    fi
}

# Function to test service connectivity
test_connectivity() {
    local url=$1
    local service_name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo "✅ $service_name: Responding to requests"
        return 0
    else
        echo "❌ $service_name: Not responding to requests"
        return 1
    fi
}

# Check React dev server
echo "📱 React Development Server:"
check_port_status 3000 "React Dev Server"
if [ $? -eq 0 ]; then
    test_connectivity "http://localhost:3000" "React App"
fi

echo ""

# Check proxy server
echo "🔧 Proxy Server:"
check_port_status 3001 "Proxy Server"
if [ $? -eq 0 ]; then
    test_connectivity "http://localhost:3001/health" "Proxy Server"
fi

echo ""

# Check PID files
echo "📋 Process Management:"
if [ -f "proxy.pid" ]; then
    local pid=$(cat proxy.pid)
    if ps -p $pid > /dev/null 2>&1; then
        echo "✅ Proxy PID file exists and process is running (PID: $pid)"
    else
        echo "⚠️  Proxy PID file exists but process is not running (PID: $pid)"
    fi
else
    echo "ℹ️  No proxy PID file found"
fi

echo ""

# Summary
echo "📊 Summary:"
react_running=$(check_port_status 3000 "React" > /dev/null 2>&1; echo $?)
proxy_running=$(check_port_status 3001 "Proxy" > /dev/null 2>&1; echo $?)

if [ $react_running -eq 0 ] && [ $proxy_running -eq 0 ]; then
    echo "🎉 Local JTGen App is fully operational!"
    echo "🌐 Access your app at: http://localhost:3000"
elif [ $react_running -eq 0 ]; then
    echo "⚠️  React app is running but proxy server is not"
    echo "💡 Run: ./scripts/start-local-app.sh to start the proxy"
elif [ $proxy_running -eq 0 ]; then
    echo "⚠️  Proxy server is running but React app is not"
    echo "💡 Run: npm start to start the React app"
else
    echo "❌ Neither React app nor proxy server is running"
    echo "💡 Run: ./scripts/start-local-app.sh to start everything"
fi

echo ""
echo "💡 Commands:"
echo "   Start:  ./scripts/start-local-app.sh"
echo "   Stop:   ./scripts/stop-local-app.sh"
echo "   Check:  ./scripts/check-local-app.sh"
