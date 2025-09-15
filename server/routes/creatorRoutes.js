// routes/creatorRoutes.js
import express from "express";
import protect from "../middleware/authMiddleware.js";
<<<<<<< HEAD
import { uploadPortfolio } from "../middleware/uploadMiddleware.js";
=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
import {
  getAllCreators,
  getCreatorProfile,
  createPortfolio,
  getUserPortfolios,
  getPublicPortfolios,
<<<<<<< HEAD
  getLatestPortfolios,
=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
  updatePortfolio,
  deletePortfolio,
} from "../controllers/creatorController.js";

const router = express.Router();

router.get("/dashboard", protect, (req, res) => {
  console.log("📌 Dashboard request received");
  console.log("📌 Authorization header:", req.headers.authorization);
  res.json({ message: "Welcome to your dashboard", user: req.user });
});

// Portfolio routes
<<<<<<< HEAD
router.post("/portfolio", protect, uploadPortfolio, createPortfolio);
router.get("/portfolio", protect, getUserPortfolios);
router.get("/portfolio/latest", getLatestPortfolios); // Get latest portfolio items
router.get("/portfolio/public/:userId", getPublicPortfolios); // Public access
router.put("/portfolio/:id", protect, uploadPortfolio, updatePortfolio);
=======
router.post("/portfolio", protect, createPortfolio);
router.get("/portfolio", protect, getUserPortfolios);
router.get("/portfolio/public/:userId", getPublicPortfolios); // Public access
router.put("/portfolio/:id", protect, updatePortfolio);
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
router.delete("/portfolio/:id", protect, deletePortfolio);

// Legacy routes (can be removed if not needed)
router.get("/all", getAllCreators);
router.get("/:id", getCreatorProfile);

export default router;
