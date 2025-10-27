import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { sanitizePortfolioInput } from '../middleware/sanitizeMiddleware.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';

const router = express.Router();

// Get all gigs with filters
router.get('/', catchAsync(async (req, res) => {
  const {
    category,
    subcategory,
    location,
    experienceLevel,
    budgetMin,
    budgetMax,
    duration,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = req.query;

  const query = { status: 'open' };

  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (duration) query.duration = duration;

  if (location) {
    query['location.city'] = new RegExp(location, 'i');
  }

  if (budgetMin || budgetMax) {
    query['budget.min'] = {};
    if (budgetMin) query['budget.min'].$gte = parseInt(budgetMin);
    if (budgetMax) query['budget.max'].$lte = parseInt(budgetMax);
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const gigs = await Gig.find(query)
    .populate('postedBy', 'name username profilePhoto')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Gig.countDocuments(query);

  res.json({
    gigs,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
}));

// Get gig by ID
router.get('/:id', catchAsync(async (req, res) => {
  const gig = await Gig.findById(req.params.id)
    .populate('postedBy', 'name username profilePhoto')
    .populate('applicants.user', 'name username profilePhoto');

  if (!gig) {
    return res.status(404).json({ error: 'Gig not found' });
  }

  // Increment view count
  gig.views += 1;
  await gig.save();

  res.json(gig);
}));

// Create a new gig
router.post('/', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const gigData = {
    ...req.body,
    postedBy: req.user._id
  };

  const gig = new Gig(gigData);
  await gig.save();
  await gig.populate('postedBy', 'name username profilePhoto');

  res.status(201).json({
    message: 'Gig posted successfully',
    gig
  });
}));

// Apply to a gig
router.post('/:id/apply', protect, catchAsync(async (req, res) => {
  const { coverLetter, proposedRate, portfolio } = req.body;

  const gig = await Gig.findById(req.params.id);
  if (!gig) {
    return res.status(404).json({ error: 'Gig not found' });
  }

  if (gig.status !== 'open') {
    return res.status(400).json({ error: 'This gig is no longer accepting applications' });
  }

  // Check if user already applied
  const existingApplication = gig.applicants.find(
    app => app.user.toString() === req.user._id.toString()
  );

  if (existingApplication) {
    return res.status(400).json({ error: 'You have already applied to this gig' });
  }

  // Check if user is the gig poster
  if (gig.postedBy.toString() === req.user._id.toString()) {
    return res.status(400).json({ error: 'You cannot apply to your own gig' });
  }

  gig.applicants.push({
    user: req.user._id,
    coverLetter,
    proposedRate,
    portfolio: portfolio || []
  });

  gig.applications += 1;
  await gig.save();

  res.json({ message: 'Application submitted successfully' });
}));

// Update gig status (for gig poster)
router.patch('/:id/status', protect, catchAsync(async (req, res) => {
  const { status } = req.body;
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    return res.status(404).json({ error: 'Gig not found' });
  }

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to update this gig' });
  }

  gig.status = status;
  await gig.save();

  res.json({ message: 'Gig status updated successfully', gig });
}));

// Hire an applicant
router.patch('/:id/hire/:applicantId', protect, catchAsync(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    return res.status(404).json({ error: 'Gig not found' });
  }

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to hire for this gig' });
  }

  const applicant = gig.applicants.find(
    app => app.user.toString() === req.params.applicantId
  );

  if (!applicant) {
    return res.status(404).json({ error: 'Applicant not found' });
  }

  gig.hiredCreator = req.params.applicantId;
  gig.status = 'in-progress';
  
  // Update applicant status
  applicant.status = 'hired';
  
  // Reject other applicants
  gig.applicants.forEach(app => {
    if (app.user.toString() !== req.params.applicantId) {
      app.status = 'rejected';
    }
  });

  await gig.save();

  res.json({ message: 'Applicant hired successfully', gig });
}));

// Update gig
router.put('/:id', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    return res.status(404).json({ error: 'Gig not found' });
  }

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to update this gig' });
  }

  const allowedUpdates = [
    'title', 'description', 'category', 'subcategory', 'budget',
    'location', 'duration', 'startDate', 'deadline', 'requirements',
    'skills', 'experienceLevel', 'tags', 'isUrgent'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      gig[field] = req.body[field];
    }
  });

  await gig.save();
  await gig.populate('postedBy', 'name username profilePhoto');

  res.json({
    message: 'Gig updated successfully',
    gig
  });
}));

// Delete gig
router.delete('/:id', protect, catchAsync(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    return res.status(404).json({ error: 'Gig not found' });
  }

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to delete this gig' });
  }

  await Gig.findByIdAndDelete(req.params.id);

  res.json({ message: 'Gig deleted successfully' });
}));

// Get user's posted gigs
router.get('/user/:userId', protect, catchAsync(async (req, res) => {
  const gigs = await Gig.find({ postedBy: req.params.userId })
    .populate('postedBy', 'name username profilePhoto')
    .sort({ createdAt: -1 });

  res.json(gigs);
}));

// Get user's applications
router.get('/applications/user/:userId', protect, catchAsync(async (req, res) => {
  const gigs = await Gig.find({
    'applicants.user': req.params.userId
  })
    .populate('postedBy', 'name username profilePhoto')
    .sort({ createdAt: -1 });

  res.json(gigs);
}));

export default router;
