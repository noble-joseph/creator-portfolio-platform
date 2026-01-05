import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import session from "express-session";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import creatorRoutes from "./routes/creatorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import gigRoutes from "./routes/gigRoutes.js";
import collaborationRoutes from "./routes/collaborationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import rateLimitMiddleware from "./middleware/rateLimitMiddleware.js";
import { sanitizeHTML } from "./middleware/sanitizeMiddleware.js";
import { logRequest } from "./utils/logger.js";
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS configuration
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

const normalizeOrigin = (origin = "") => origin.replace(/\/$/, "");

const parseOriginList = (value) =>
  (value ? value.split(",") : [])
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean);

const envAllowedOrigins = [
  ...parseOriginList(process.env.FRONTEND_URL),
  ...parseOriginList(process.env.ALLOWED_ORIGINS)
];

const allowedOrigins = Array.from(
  new Set([
    ...defaultAllowedOrigins.map(normalizeOrigin),
    ...envAllowedOrigins
  ])
);

const isDevelopment = (process.env.NODE_ENV || "development") !== "production";
const localLoopbackRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);

    if (
      allowedOrigins.includes(normalizedOrigin) ||
      (isDevelopment && localLoopbackRegex.test(normalizedOrigin))
    ) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Input sanitization
app.use(sanitizeHTML);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Use env var or default
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use(logRequest);





// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0"
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Creator Portfolio Platform API",
    version: "1.0.0",
    status: "running",
    documentation: "/api/docs",
    health: "/health"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/ai", aiRoutes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Export app for testing
export default app;

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle port already in use error
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Trying alternative port...`);
      const alternativePort = PORT + 1;
      const newServer = app.listen(alternativePort, () => {
        console.log(`Server running on alternative port ${alternativePort}`);
      });
      newServer.on('error', (newErr) => {
        console.error('Failed to start server on alternative port:', newErr);
        process.exit(1);
      });
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}
