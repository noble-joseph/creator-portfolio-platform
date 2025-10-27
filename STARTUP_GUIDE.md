# 🚀 Creator Portfolio Platform - Startup Guide

## ⚠️ **IMPORTANT: Network Error Fix**

If you're getting "Network error" while logging in, follow these steps:

### **Step 1: Start the Server First**

```bash
# Navigate to server directory
cd server

# Start the server
node index.js
```

**Expected Output:**
```
MongoDB Connected: localhost
Server running on port 5000
```

### **Step 2: Start the Client (in a new terminal)**

```bash
# Navigate to client directory
cd client

# Start the client
npm run dev
```

**Expected Output:**
```
VITE v7.1.5  ready in 384 ms
➜  Local:   http://localhost:5173/
```

### **Step 3: Test the Connection**

1. Open your browser and go to: http://localhost:5173
2. Click on "Login" or "Register"
3. The network error should be resolved

## 🔧 **Troubleshooting**

### **Issue 1: "Cannot find module" errors**

**Solution:**
```bash
# Install all dependencies
npm install
cd server && npm install
cd ../client && npm install --legacy-peer-deps
```

### **Issue 2: MongoDB connection error**

**Solution:**
1. Make sure MongoDB is installed and running
2. Create a `.env` file in the server directory:

```env
MONGODB_URI=mongodb://localhost:27017/creator-portfolio
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
SESSION_SECRET=your-session-secret
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### **Issue 3: Server won't start**

**Solution:**
```bash
# Check if port 5000 is available
netstat -an | findstr :5000

# If port is in use, change PORT in server/.env
PORT=5001
```

### **Issue 4: Client build errors**

**Solution:**
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 🎯 **Quick Start Commands**

### **Option 1: Manual Start**
```bash
# Terminal 1 - Server
cd server
node index.js

# Terminal 2 - Client
cd client
npm run dev
```

### **Option 2: Using npm scripts**
```bash
# From root directory
npm run dev
```

### **Option 3: Using the setup script**
```bash
node setup.js
```

## 🌐 **Access Points**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Admin Panel**: http://localhost:5173/admin

## 📱 **Test the Application**

1. **Register a new account:**
   - Go to http://localhost:5173/register
   - Fill in the form
   - Choose "Musician" or "Photographer"
   - Click "Create Account"

2. **Login:**
   - Go to http://localhost:5173/login
   - Use your credentials
   - Should redirect to dashboard

3. **Test API directly:**
   ```bash
   curl http://localhost:5000/health
   ```

## 🆘 **Still Having Issues?**

1. **Check server logs** for error messages
2. **Verify MongoDB** is running: `mongod --version`
3. **Check Node.js version**: `node --version` (should be 18+)
4. **Clear browser cache** and try again
5. **Check firewall** settings

## 📞 **Support**

If you're still experiencing issues:
1. Check the console logs in your browser (F12)
2. Check the server terminal for error messages
3. Make sure all dependencies are installed
4. Verify environment variables are set correctly

---

**The network error is typically caused by the server not running. Make sure to start the server first before accessing the client!**
