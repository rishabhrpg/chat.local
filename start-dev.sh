#!/bin/bash

echo "🏠 Starting Local Chat Application (Development Mode)"
echo "===================================================="

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port is already in use. Killing existing processes..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "react-scripts\|nodemon\|concurrently" 2>/dev/null || true

# Check and clean ports
check_port 3001
check_port 3002

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install-all
fi

# Start development servers
echo "🚀 Starting development servers..."
npm run dev &
DEV_PID=$!

# Wait for servers to start
echo "⏳ Waiting for servers to start..."
sleep 8

# Check if servers are running
echo "🔍 Checking server status..."
if curl -s http://localhost:3001/api/messages >/dev/null; then
    echo "✅ Backend server is running on http://localhost:3001"
    echo "🌐 mDNS available at: http://local-chat.local:3001"
else
    echo "❌ Backend server failed to start"
fi

if curl -s http://localhost:3002 >/dev/null; then
    echo "✅ Frontend server is running on http://localhost:3002"
    echo "🌐 mDNS available at: http://local-chat.local:3002"
else
    echo "❌ Frontend server failed to start"
fi

echo ""
echo "🎉 Local Chat Application is ready!"
echo "===================================="
echo "📱 Development: http://localhost:3002"
echo "🌐 mDNS: http://local-chat.local:3002"
echo "🔧 API: http://localhost:3001/api/messages"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $DEV_PID 2>/dev/null
    pkill -f "react-scripts\|nodemon\|concurrently" 2>/dev/null || true
    echo "👋 Local Chat Application stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
