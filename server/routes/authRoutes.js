import express from "express";
<<<<<<< HEAD
import passport from "../config/passport.js";
import { registerUser, loginUser, refreshAccessToken, updateProfile, updateProfilePicture, getCurrentUser, getUserProfile, googleCallback, followUser, unfollowUser, getConnections, sendConnectionRequest, acceptConnectionRequest, declineConnectionRequest, removeConnection, getUsersForDiscovery } from "../controllers/authController.js";
=======
import { registerUser, loginUser, refreshAccessToken, updateProfile, getCurrentUser, getUserProfile } from "../controllers/authController.js";
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
import protect from "../middleware/authMiddleware.js";
import { uploadProfilePhoto } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/updateProfile", protect, updateProfile);
router.post("/updateProfilePicture", protect, uploadProfilePhoto, updateProfilePicture);
router.get("/me", protect, getCurrentUser); // ✅ new protected route
router.get("/profile/:userId", getUserProfile); // Public profile access
<<<<<<< HEAD
router.get("/discover", getUsersForDiscovery); // Public user discovery

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), googleCallback);

// Connection routes
router.post("/follow/:userId", protect, followUser);
router.delete("/unfollow/:userId", protect, unfollowUser);
router.get("/connections", protect, getConnections);

// New connection routes
router.post("/connect/:userId", protect, sendConnectionRequest);
router.post("/accept-connection/:userId", protect, acceptConnectionRequest);
router.delete("/decline-connection/:userId", protect, declineConnectionRequest);
router.delete("/disconnect/:userId", protect, removeConnection);

=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
export default router;
