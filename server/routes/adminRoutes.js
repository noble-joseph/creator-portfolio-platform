import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { sanitizeAuthInput } from '../middleware/sanitizeMiddleware.js';
import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Message from '../models/Message.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect);
router.use(restrictTo('admin'));

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, verified, search } = req.query;
  
  const query = {};
  
  if (role) query.role = role;
  if (verified !== undefined) query.isVerified = verified === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    users,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
}));

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
}));

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
router.patch('/users/:id/role', sanitizeAuthInput, catchAsync(async (req, res) => {
  const { role } = req.body;
  
  if (!['musician', 'photographer', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    message: 'User role updated successfully',
    user
  });
}));

// @desc    Verify user
// @route   PATCH /api/admin/users/:id/verify
// @access  Private/Admin
router.patch('/users/:id/verify', catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    message: 'User verified successfully',
    user
  });
}));

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Delete user's portfolios
  await Portfolio.deleteMany({ user: user._id });
  
  // Delete user's messages
  await Message.deleteMany({
    $or: [
      { sender: user._id },
      { recipient: user._id }
    ]
  });

  // Delete user
  await User.findByIdAndDelete(req.params.id);

  res.json({ message: 'User deleted successfully' });
}));

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', catchAsync(async (req, res) => {
  const [
    totalUsers,
    musicians,
    photographers,
    admins,
    verifiedUsers,
    totalPortfolios,
    publicPortfolios,
    totalMessages,
    recentUsers
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'musician' }),
    User.countDocuments({ role: 'photographer' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ isVerified: true }),
    Portfolio.countDocuments(),
    Portfolio.countDocuments({ isPublic: true }),
    Message.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt')
  ]);

  res.json({
    users: {
      total: totalUsers,
      musicians,
      photographers,
      admins,
      verified: verifiedUsers,
      unverified: totalUsers - verifiedUsers
    },
    content: {
      totalPortfolios,
      publicPortfolios,
      privatePortfolios: totalPortfolios - publicPortfolios,
      totalMessages
    },
    recentUsers
  });
}));

// @desc    Get flagged content
// @route   GET /api/admin/flagged
// @access  Private/Admin
router.get('/flagged', catchAsync(async (req, res) => {
  // This would typically come from a flagged content system
  // For now, we'll return empty array
  res.json([]);
}));

// @desc    Get all messages (for moderation)
// @route   GET /api/admin/messages
// @access  Private/Admin
router.get('/messages', catchAsync(async (req, res) => {
  const { page = 1, limit = 50, type } = req.query;
  
  const query = {};
  if (type) query.type = type;

  const messages = await Message.find(query)
    .populate('sender', 'name email username')
    .populate('recipient', 'name email username')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Message.countDocuments(query);

  res.json({
    messages,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
}));

// @desc    Delete message
// @route   DELETE /api/admin/messages/:id
// @access  Private/Admin
router.delete('/messages/:id', catchAsync(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);

  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  res.json({ message: 'Message deleted successfully' });
}));

export default router;