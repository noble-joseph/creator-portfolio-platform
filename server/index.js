import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import creatorRoutes from "./routes/creatorRoutes.js"; // ✅ new
import adminRoutes from "./routes/adminRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

//app.use(cors());
//import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173", // Your local Vite dev server
  process.env.FRONTEND_URL // Your deployed frontend from env var
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

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

// Log every request (add this before app.use("/api/auth", authRoutes))
app.use((req, res, next) => {
  console.log("👉 Request:", req.method, req.url, req.body);
  next();
});





app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/creator", creatorRoutes); // ✅ new
app.use("/api/admin", adminRoutes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
