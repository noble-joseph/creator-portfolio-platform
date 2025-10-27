#!/bin/bash

echo "Checking for existing server processes on port 5000..."

# Kill any existing node processes listening on port 5000
PIDS=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$PIDS" ]; then
    echo "Killing processes: $PIDS"
    kill -9 $PIDS 2>/dev/null
fi

# Alternative method using netstat if lsof is not available
if ! command -v lsof &> /dev/null; then
    PIDS=$(netstat -tulpn 2>/dev/null | grep :5000 | grep LISTEN | awk '{print $7}' | cut -d'/' -f1)
    if [ ! -z "$PIDS" ]; then
        echo "Killing processes: $PIDS"
        kill -9 $PIDS 2>/dev/null
    fi
fi

# Wait a moment for the port to be freed
sleep 2

echo "Starting server..."
cd server
node index.js
