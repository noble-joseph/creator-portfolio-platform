import express from "express";
import passport from "../config/passport.js";
import { registerUser, loginUser, refreshAccessToken, updateProfile, updateProfilePicture, getCurrentUser, getUserProfile, googleCallback, getConnections, sendConnectionRequest, acceptConnectionRequest, declineConnectionRequest, removeConnection, getUsersForDiscovery, requestPasswordReset, resetPassword } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import { uploadProfilePhoto } from "../middleware/uploadMiddleware.js";
import { authRateLimiter } from "../middleware/rateLimitMiddleware.js";
import { sanitizeAuthInput } from "../middleware/sanitizeMiddleware.js";

const router = express.Router();

router.post("/register", authRateLimiter, sanitizeAuthInput, registerUser);
router.post("/login", authRateLimiter, sanitizeAuthInput, loginUser);
router.post("/forgot-password", authRateLimiter, sanitizeAuthInput, requestPasswordReset);
router.post("/reset-password", authRateLimiter, sanitizeAuthInput, resetPassword);
router.post("/refresh", refreshAccessToken);
router.post("/updateProfile", protect, updateProfile);
router.post("/updateProfilePicture", protect, uploadProfilePhoto, updateProfilePicture);
router.get("/me", protect, getCurrentUser); // ✅ new protected route
router.get("/profile/:userId", getUserProfile); // Public profile access
router.get("/discover", getUsersForDiscovery); // Public user discovery

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), googleCallback);

// Connection routes
router.get("/connections", protect, getConnections);

// New connection routes
router.post("/connect/:userId", protect, sendConnectionRequest);
router.post("/accept-connection/:userId", protect, acceptConnectionRequest);
router.delete("/decline-connection/:userId", protect, declineConnectionRequest);
router.delete("/disconnect/:userId", protect, removeConnection);

export default router;
