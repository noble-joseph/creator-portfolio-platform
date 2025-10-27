#!/bin/bash

echo "🚀 Starting Creator Portfolio Platform..."
echo

echo "📦 Checking dependencies..."
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "Installing client dependencies..."
    cd client && npm install --legacy-peer-deps && cd ..
fi

echo
echo "🔧 Starting server..."
cd server && node index.js &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 5

echo
echo "🎨 Starting client..."
cd ../client && npm run dev &
CLIENT_PID=$!

echo
echo "✅ Platform started successfully!"
echo "🌐 Server: http://localhost:5000"
echo "🌐 Client: http://localhost:5173"
echo
echo "📋 Next steps:"
echo "1. Wait for both services to fully load"
echo "2. Open http://localhost:5173 in your browser"
echo "3. Register a new account or login"
echo
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
