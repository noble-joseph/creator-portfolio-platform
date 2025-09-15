import express from "express";
import { getUsers, getPortfolios, updatePortfolioStatus, getAnalytics } from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

router.get("/users", getUsers);
router.get("/portfolios", getPortfolios);
router.put("/portfolios/:id", updatePortfolioStatus);
router.get("/analytics", getAnalytics);

export default router;
