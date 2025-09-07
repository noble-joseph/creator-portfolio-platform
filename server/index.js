import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import creatorRoutes from "./routes/creatorRoutes.js"; // ✅ new
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

//app.use(cors());
//import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173", // Your local Vite dev server
  //"https://yourfrontenddomain.com" // Your deployed frontend
];

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
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

// Error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
