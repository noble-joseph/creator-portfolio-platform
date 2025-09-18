import express from "express";
import protect from "../middleware/authMiddleware.js";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();

// Send message to a specific user (must be a connection)
router.post("/:userId", protect, sendMessage);

// Get all messages for authenticated user
router.get("/", protect, getMessages);

export default router;
