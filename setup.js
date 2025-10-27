#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Creator Portfolio Platform...\n');

// Create necessary directories
const directories = [
  'server/logs',
  'client/public',
  'uploads'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create .env files if they don't exist
const envFiles = [
  {
    path: 'server/.env',
    content: `# Database
MONGODB_URI=mongodb://localhost:27017/creator-portfolio

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Session
SESSION_SECRET=your-session-secret-change-this-in-production

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info`
  },
  {
    path: 'client/.env',
    content: `# API Configuration
VITE_API_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=Creator Portfolio Platform
VITE_APP_VERSION=1.0.0

# Cloudinary (Optional)
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id`
  }
];

envFiles.forEach(envFile => {
  if (!fs.existsSync(envFile.path)) {
    fs.writeFileSync(envFile.path, envFile.content);
    console.log(`✅ Created ${envFile.path}`);
  }
});

// Install dependencies
console.log('\n📦 Installing dependencies...\n');

try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('cd client && npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  console.log('\n✅ All dependencies installed successfully!');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Create a simple start script
const startScript = `#!/bin/bash

echo "🚀 Starting Creator Portfolio Platform..."

# Start MongoDB (if not running)
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --dbpath ./data/db &
fi

# Start Redis (if not running)
if ! pgrep -x "redis-server" > /dev/null; then
    echo "Starting Redis..."
    redis-server &
fi

# Start server
echo "Starting server..."
cd server && npm run dev &

# Start client
echo "Starting client..."
cd client && npm run dev &

echo "✅ Platform started successfully!"
echo "🌐 Server: http://localhost:5000"
echo "🌐 Client: http://localhost:5173"
echo "📊 Admin: http://localhost:5173/admin"

wait
`;

fs.writeFileSync('start.sh', startScript);
fs.chmodSync('start.sh', '755');

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Update the .env files with your actual configuration');
console.log('3. Run: npm run dev (to start both server and client)');
console.log('4. Or run: ./start.sh (if you have MongoDB and Redis installed)');
console.log('\n🌐 Access the application at:');
console.log('   - Frontend: http://localhost:5173');
console.log('   - Backend API: http://localhost:5000');
console.log('   - Admin Panel: http://localhost:5173/admin');
console.log('\n✨ Happy coding!');
