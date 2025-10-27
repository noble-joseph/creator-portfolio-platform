@echo off
echo 🚀 Starting Creator Portfolio Platform...
echo.

echo 📦 Checking dependencies...
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    npm install
    cd ..
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    npm install --legacy-peer-deps
    cd ..
)

echo.
echo 🔧 Starting server...
start "Server" cmd /k "cd server && node index.js"

echo ⏳ Waiting for server to start...
timeout /t 5 /nobreak > nul

echo.
echo 🎨 Starting client...
start "Client" cmd /k "cd client && npm run dev"

echo.
echo ✅ Platform started successfully!
echo 🌐 Server: http://localhost:5000
echo 🌐 Client: http://localhost:5173
echo.
echo 📋 Next steps:
echo 1. Wait for both windows to fully load
echo 2. Open http://localhost:5173 in your browser
echo 3. Register a new account or login
echo.
pause
