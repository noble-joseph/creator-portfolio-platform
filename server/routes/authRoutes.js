import express from 'express';
import { protect, restrictTo, optionalAuth } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { sanitizeAuthInput, validateEmail } from '../middleware/sanitizeMiddleware.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateEmail, catchAsync(async (req, res) => {
  const { name, email, username, password, role, specialization } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({
      error: 'User already exists with this email or username'
    });
  }

  // Validate required fields based on role
  if (!specialization) {
    return res.status(400).json({
      error: 'Specialization is required'
    });
  }

  // Prepare user data
  const userData = {
    name,
    email,
    username,
    password,
    role,
    specialization,
    experienceLevel: 'beginner'
  };

  // Set genre or style based on role
  if (role === 'musician') {
    userData.genre = specialization;
  } else if (role === 'photographer') {
    userData.style = specialization;
  }

  // Create user
  const user = await User.create(userData);

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      specialization: user.specialization,
      profilePhoto: user.profilePhoto,
      isVerified: user.isVerified
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', sanitizeAuthInput, catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      error: 'Invalid email or password'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.json({
    message: 'Login successful',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      specialization: user.specialization,
      profilePhoto: user.profilePhoto,
      isVerified: user.isVerified
    }
  });
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, catchAsync(async (req, res) => {
  res.json({
    user: req.user
  });
}));

// @desc    Get user profile by ID
// @route   GET /api/auth/profile/:userId
// @access  Public (auth optional to compute connection status)
router.get('/profile/:userId', optionalAuth, catchAsync(async (req, res) => {
  const target = await User.findById(req.params.userId)
    .select('-password -__v');

  if (!target) {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  // Compute connection status if requester is authenticated
  let connectionStatus = 'none';
  if (req.user) {
    const me = await User.findById(req.user._id).select('connections connectionRequests');
    const isConnected = (target.connections || []).some(id => id.toString() === req.user._id.toString());
    const iSentRequest = (target.connectionRequests || []).some(id => id.toString() === req.user._id.toString());
    const theySentRequest = (me.connectionRequests || []).some(id => id.toString() === target._id.toString());
    if (req.user._id.toString() === target._id.toString()) connectionStatus = 'owner';
    else if (isConnected) connectionStatus = 'connected';
    else if (iSentRequest) connectionStatus = 'request_sent';
    else if (theySentRequest) connectionStatus = 'request_received';
  }

  res.json({
    ...target.toObject(),
    connectionStatus
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, sanitizeAuthInput, catchAsync(async (req, res) => {
  const allowedUpdates = [
    'name', 'bio', 'profilePhoto', 'coverPhoto', 'location',
    'socialMedia', 'skills', 'experienceLevel', 'specialization',
    'specializationDetails', 'hourlyRate', 'availability'
  ];

  const updates = {};
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    message: 'Profile updated successfully',
    user
  });
}));

// @desc    Discover users
// @route   GET /api/auth/discover
// @access  Public
router.get('/discover', catchAsync(async (req, res) => {
  const { search, role, specialization, limit = 20, page = 1 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  if (role) {
    query.role = role;
  }

  if (specialization) {
    query.specialization = { $regex: specialization, $options: 'i' };
  }

  const users = await User.find(query)
    .select('-password -__v')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  res.json(users);
}));

// @desc    Send connection request
// @route   POST /api/auth/connect/:userId
// @access  Private
router.post('/connect/:userId', protect, catchAsync(async (req, res) => {
  const targetUser = await User.findById(req.params.userId);

  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (targetUser._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ error: 'Cannot connect to yourself' });
  }

  if (targetUser.role !== req.user.role) {
    return res.status(400).json({ error: 'Can only connect with users of the same role' });
  }

  if (targetUser.connectionRequests.includes(req.user._id)) {
    return res.status(400).json({ error: 'Connection request already sent' });
  }

  if (req.user.connections.includes(targetUser._id)) {
    return res.status(400).json({ error: 'Already connected' });
  }

  // Add to target user's connection requests
  targetUser.connectionRequests.push(req.user._id);
  await targetUser.save();

  res.json({ message: 'Connection request sent successfully' });
}));

// @desc    Accept connection request
// @route   POST /api/auth/accept-connection/:userId
// @access  Private
router.post('/accept-connection/:userId', protect, catchAsync(async (req, res) => {
  const requester = await User.findById(req.params.userId);

  if (!requester) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!req.user.connectionRequests.includes(requester._id)) {
    return res.status(400).json({ error: 'No connection request found' });
  }

  // Remove from connection requests
  req.user.connectionRequests = req.user.connectionRequests.filter(
    id => id.toString() !== requester._id.toString()
  );

  // Add to connections
  req.user.connections.push(requester._id);
  requester.connections.push(req.user._id);

  await req.user.save();
  await requester.save();

  res.json({ message: 'Connection accepted successfully' });
}));

// @desc    Decline connection request
// @route   DELETE /api/auth/decline-connection/:userId
// @access  Private
router.delete('/decline-connection/:userId', protect, catchAsync(async (req, res) => {
  const requester = await User.findById(req.params.userId);

  if (!requester) {
    return res.status(404).json({ error: 'User not found' });
  }

  req.user.connectionRequests = req.user.connectionRequests.filter(
    id => id.toString() !== requester._id.toString()
  );

  await req.user.save();

  res.json({ message: 'Connection request declined' });
}));

// @desc    Remove connection
// @route   DELETE /api/auth/disconnect/:userId
// @access  Private
router.delete('/disconnect/:userId', protect, catchAsync(async (req, res) => {
  const targetUser = await User.findById(req.params.userId);

  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Remove from both users' connections
  req.user.connections = req.user.connections.filter(
    id => id.toString() !== targetUser._id.toString()
  );
  targetUser.connections = targetUser.connections.filter(
    id => id.toString() !== req.user._id.toString()
  );

  await req.user.save();
  await targetUser.save();

  res.json({ message: 'Connection removed successfully' });
}));

// @desc    Get current user's connections and requests
// @route   GET /api/auth/connections
// @access  Private
router.get('/connections', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'connections',
      select: 'name username role specialization profilePhoto'
    })
    .populate({
      path: 'connectionRequests',
      select: 'name username role specialization profilePhoto'
    });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    connections: user.connections || [],
    connectionRequests: user.connectionRequests || [],
    connectionsCount: (user.connections || []).length,
    connectionRequestsCount: (user.connectionRequests || []).length
  });
}));

export default router;