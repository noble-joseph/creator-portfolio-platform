import express from 'express';
import session from 'express-session';
import passport from './config/passport.js';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import createSessionConfig from './config/session.js';
import redisClient from './config/redis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Connect DB
connectDB();

// Redis will connect lazily when needed (optional for session store)

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176'
    ];

    // In production, allow the deployed frontend URL
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(process.env.FRONTEND_URL);
      // Allow any subdomain of render.com for flexibility
      if (origin && origin.includes('render.com')) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.includes(origin) || process.env.FRONTEND_URL === origin) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(session(createSessionConfig(redisClient)));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files from client build
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const routes = await import('./routes/index.js');
app.use('/api', routes.default);

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading the page');
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
