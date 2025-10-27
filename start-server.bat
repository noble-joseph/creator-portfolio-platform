@echo off
echo Checking for existing server processes on port 5000...

REM Kill any existing node processes listening on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Wait a moment for the port to be freed
timeout /t 2 /nobreak >nul

echo Starting server...
cd server
node index.js
