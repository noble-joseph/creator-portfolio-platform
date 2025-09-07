import express from "express";
import { registerUser, loginUser, refreshAccessToken, updateProfile, getCurrentUser } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/updateProfile", protect, updateProfile);
router.get("/me", protect, getCurrentUser); // ✅ new protected route
export default router;
