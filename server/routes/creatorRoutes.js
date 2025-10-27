import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { sanitizePortfolioInput } from '../middleware/sanitizeMiddleware.js';
import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get user's portfolio
// @route   GET /api/creator/portfolio
// @access  Private
router.get('/portfolio', protect, catchAsync(async (req, res) => {
  const portfolios = await Portfolio.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.json(portfolios);
}));

// @desc    Get public portfolio by user ID
// @route   GET /api/creator/portfolio/public/:userId
// @access  Public
router.get('/portfolio/public/:userId', catchAsync(async (req, res) => {
  const portfolios = await Portfolio.find({ 
    user: req.params.userId,
    isPublic: true 
  }).sort({ createdAt: -1 });

  res.json(portfolios);
}));

// @desc    Get portfolio visible to requester (public for all; private if connected/owner)
// @route   GET /api/creator/portfolio/visible/:userId
// @access  Public (auth optional for richer visibility)
router.get('/portfolio/visible/:userId', optionalAuth, catchAsync(async (req, res) => {
  const targetUserId = req.params.userId;

  let canSeePrivate = false;
  if (req.user) {
    // Owner can see all
    if (req.user._id.toString() === targetUserId) {
      canSeePrivate = true;
    } else {
      // Connected users can see private too
      const isConnected = (req.user.connections || []).some(
        (id) => id.toString() === targetUserId
      );
      if (isConnected) canSeePrivate = true;
    }
  }

  const query = { user: targetUserId };
  if (!canSeePrivate) {
    query.isPublic = true;
  }

  const portfolios = await Portfolio.find(query).sort({ createdAt: -1 });
  res.json(portfolios);
}));

// @desc    Create portfolio item
// @route   POST /api/creator/portfolio
// @access  Private
router.post('/portfolio', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const portfolioData = {
    ...req.body,
    user: req.user._id
  };

  const portfolio = new Portfolio(portfolioData);
  await portfolio.save();

  res.status(201).json({
    message: 'Portfolio item created successfully',
    portfolio
  });
}));

// @desc    Update portfolio item
// @route   PUT /api/creator/portfolio/:id
// @access  Private
router.put('/portfolio/:id', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }

  if (portfolio.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to update this portfolio item' });
  }

  const allowedUpdates = [
    'title', 'description', 'category', 'mediaFiles', 'thumbnail',
    'link', 'tags', 'isPublic', 'featured'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      portfolio[field] = req.body[field];
    }
  });

  await portfolio.save();

  res.json({
    message: 'Portfolio item updated successfully',
    portfolio
  });
}));

// @desc    Delete portfolio item
// @route   DELETE /api/creator/portfolio/:id
// @access  Private
router.delete('/portfolio/:id', protect, catchAsync(async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }

  if (portfolio.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to delete this portfolio item' });
  }

  await Portfolio.findByIdAndDelete(req.params.id);

  res.json({ message: 'Portfolio item deleted successfully' });
}));

// @desc    Get user's achievements
// @route   GET /api/creator/achievements
// @access  Private
router.get('/achievements', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('achievements');
  res.json(user.achievements || []);
}));

// @desc    Add achievement
// @route   POST /api/creator/achievements
// @access  Private
router.post('/achievements', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const { title, description, date, type, issuer } = req.body;

  const achievement = {
    title,
    description,
    date: date ? new Date(date) : new Date(),
    type,
    issuer
  };

  await User.findByIdAndUpdate(
    req.user._id,
    { $push: { achievements: achievement } }
  );

  res.status(201).json({
    message: 'Achievement added successfully',
    achievement
  });
}));

// @desc    Update achievement
// @route   PUT /api/creator/achievements/:achievementId
// @access  Private
router.put('/achievements/:achievementId', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const { title, description, date, type, issuer } = req.body;

  const user = await User.findById(req.user._id);
  const achievement = user.achievements.id(req.params.achievementId);

  if (!achievement) {
    return res.status(404).json({ error: 'Achievement not found' });
  }

  achievement.title = title;
  achievement.description = description;
  achievement.date = date ? new Date(date) : achievement.date;
  achievement.type = type;
  achievement.issuer = issuer;

  await user.save();

  res.json({
    message: 'Achievement updated successfully',
    achievement
  });
}));

// @desc    Delete achievement
// @route   DELETE /api/creator/achievements/:achievementId
// @access  Private
router.delete('/achievements/:achievementId', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const achievement = user.achievements.id(req.params.achievementId);

  if (!achievement) {
    return res.status(404).json({ error: 'Achievement not found' });
  }

  achievement.remove();
  await user.save();

  res.json({ message: 'Achievement deleted successfully' });
}));

// @desc    Get user's testimonials
// @route   GET /api/creator/testimonials
// @access  Private
router.get('/testimonials', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('testimonials');
  res.json(user.testimonials || []);
}));

// @desc    Add testimonial
// @route   POST /api/creator/testimonials
// @access  Private
router.post('/testimonials', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const { content, author, authorRole, rating, project } = req.body;

  const testimonial = {
    content,
    author,
    authorRole,
    rating: rating || 5,
    project,
    date: new Date()
  };

  await User.findByIdAndUpdate(
    req.user._id,
    { $push: { testimonials: testimonial } }
  );

  res.status(201).json({
    message: 'Testimonial added successfully',
    testimonial
  });
}));

export default router;