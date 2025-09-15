import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";

// @desc    Get all users (public info only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -googleId -__v');
    res.json(users);
  } catch (error) {
    console.error("❌ Get users error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all portfolios
// @route   GET /api/admin/portfolios
// @access  Private/Admin
export const getPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({}).populate('creator', 'name username email');
    res.json(portfolios);
  } catch (error) {
    console.error("❌ Get portfolios error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Approve or reject portfolio
// @route   PUT /api/admin/portfolios/:id
// @access  Private/Admin
export const updatePortfolioStatus = async (req, res) => {
  res.status(403).json({ message: "Updating portfolio status is not allowed" });
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const portfolioCount = await Portfolio.countDocuments();
    const approvedPortfolios = await Portfolio.countDocuments({ status: 'approved' });

    res.json({
      userCount,
      portfolioCount,
      approvedPortfolios
    });
  } catch (error) {
    console.error("❌ Get analytics error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};
