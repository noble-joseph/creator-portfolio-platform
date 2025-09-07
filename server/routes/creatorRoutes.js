// routes/creatorRoutes.js
import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, (req, res) => {
  console.log("📌 Dashboard request received");
  console.log("📌 Authorization header:", req.headers.authorization);
  res.json({ message: "Welcome to your dashboard", user: req.user });
});


export default router;
