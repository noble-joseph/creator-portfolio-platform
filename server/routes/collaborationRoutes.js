import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { sanitizePortfolioInput } from '../middleware/sanitizeMiddleware.js';
import Collaboration from '../models/Collaboration.js';
import User from '../models/User.js';

const router = express.Router();

// Get collaborations for current user
router.get('/', protect, catchAsync(async (req, res) => {
  const { status, visibility } = req.query;
  
  const query = {
    $or: [
      { initiator: req.user._id },
      { 'participants.user': req.user._id }
    ]
  };

  if (status) {
    query.status = status;
  }

  if (visibility) {
    query.visibility = visibility;
  }

  const collaborations = await Collaboration.find(query)
    .populate('initiator', 'name username profilePhoto')
    .populate('participants.user', 'name username profilePhoto')
    .sort({ createdAt: -1 });

  res.json(collaborations);
}));

// Get public collaborations
router.get('/public', catchAsync(async (req, res) => {
  const { category, tags, limit = 20, page = 1 } = req.query;
  
  const query = { 
    isPublic: true,
    visibility: 'public'
  };

  if (category) {
    query.category = category;
  }

  if (tags) {
    query.tags = { $in: tags.split(',') };
  }

  const collaborations = await Collaboration.find(query)
    .populate('initiator', 'name username profilePhoto')
    .populate('participants.user', 'name username profilePhoto')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Collaboration.countDocuments(query);

  res.json({
    collaborations,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
}));

// Get collaboration by ID
router.get('/:id', protect, catchAsync(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id)
    .populate('initiator', 'name username profilePhoto')
    .populate('participants.user', 'name username profilePhoto');

  if (!collaboration) {
    return res.status(404).json({ error: 'Collaboration not found' });
  }

  // Check if user is part of this collaboration
  const isParticipant = collaboration.initiator._id.toString() === req.user._id.toString() ||
                       collaboration.participants.some(p => p.user._id.toString() === req.user._id.toString());

  if (!isParticipant && !collaboration.isPublic) {
    return res.status(403).json({ error: 'Not authorized to view this collaboration' });
  }

  res.json(collaboration);
}));

// Create a new collaboration
router.post('/', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const collaborationData = {
    ...req.body,
    initiator: req.user._id
  };

  const collaboration = new Collaboration(collaborationData);
  await collaboration.save();
  await collaboration.populate('initiator', 'name username profilePhoto');

  res.status(201).json({
    message: 'Collaboration created successfully',
    collaboration
  });
}));

// Send collaboration request
router.post('/request', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const { recipientId, idea, type = 'general' } = req.body;

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return res.status(404).json({ error: 'Recipient not found' });
  }

  // Check if users are connected (for role-based restrictions)
  if (req.user.role !== recipient.role) {
    return res.status(400).json({ 
      error: 'You can only collaborate with users of the same role' 
    });
  }

  // Create collaboration request
  const collaboration = new Collaboration({
    initiator: req.user._id,
    participants: [{
      user: recipientId,
      role: 'collaborator',
      status: 'invited'
    }],
    title: `Collaboration Request from ${req.user.name}`,
    description: idea,
    category: 'cross-genre',
    projectType: 'artistic',
    status: 'planning',
    visibility: 'private'
  });

  await collaboration.save();
  await collaboration.populate('initiator', 'name username profilePhoto');
  await collaboration.populate('participants.user', 'name username profilePhoto');

  res.status(201).json({
    message: 'Collaboration request sent successfully',
    collaboration
  });
}));

// Accept collaboration invitation
router.patch('/:id/accept', protect, catchAsync(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    return res.status(404).json({ error: 'Collaboration not found' });
  }

  const participant = collaboration.participants.find(
    p => p.user.toString() === req.user._id.toString()
  );

  if (!participant) {
    return res.status(404).json({ error: 'You are not invited to this collaboration' });
  }

  if (participant.status !== 'invited') {
    return res.status(400).json({ error: 'Invalid collaboration status' });
  }

  participant.status = 'accepted';
  participant.joinedAt = new Date();

  if (collaboration.status === 'planning') {
    collaboration.status = 'active';
  }

  await collaboration.save();

  res.json({ message: 'Collaboration invitation accepted' });
}));

// Decline collaboration invitation
router.patch('/:id/decline', protect, catchAsync(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    return res.status(404).json({ error: 'Collaboration not found' });
  }

  const participant = collaboration.participants.find(
    p => p.user.toString() === req.user._id.toString()
  );

  if (!participant) {
    return res.status(404).json({ error: 'You are not invited to this collaboration' });
  }

  participant.status = 'declined';

  await collaboration.save();

  res.json({ message: 'Collaboration invitation declined' });
}));

// Add participant to collaboration
router.post('/:id/participants', protect, catchAsync(async (req, res) => {
  const { userId, role } = req.body;
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    return res.status(404).json({ error: 'Collaboration not found' });
  }

  // Check if user is the initiator
  if (collaboration.initiator.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to add participants' });
  }

  // Check if user is already a participant
  const existingParticipant = collaboration.participants.find(
    p => p.user.toString() === userId
  );

  if (existingParticipant) {
    return res.status(400).json({ error: 'User is already a participant' });
  }

  collaboration.participants.push({
    user: userId,
    role: role || 'collaborator',
    status: 'invited'
  });

  await collaboration.save();
  await collaboration.populate('participants.user', 'name username profilePhoto');

  res.json({ message: 'Participant added successfully', collaboration });
}));

// Update collaboration
router.put('/:id', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    return res.status(404).json({ error: 'Collaboration not found' });
  }

  // Check if user is the initiator
  if (collaboration.initiator.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to update this collaboration' });
  }

  const allowedUpdates = [
    'title', 'description', 'category', 'projectType', 'status',
    'timeline', 'budget', 'deliverables', 'tags', 'isPublic', 'visibility'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      collaboration[field] = req.body[field];
    }
  });

  await collaboration.save();
  await collaboration.populate('initiator', 'name username profilePhoto');
  await collaboration.populate('participants.user', 'name username profilePhoto');

  res.json({
    message: 'Collaboration updated successfully',
    collaboration
  });
}));

// Add communication to collaboration
router.post('/:id/communication', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const { type, content, attachments } = req.body;
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    return res.status(404).json({ error: 'Collaboration not found' });
  }

  // Check if user is part of this collaboration
  const isParticipant = collaboration.initiator._id.toString() === req.user._id.toString() ||
                       collaboration.participants.some(p => p.user._id.toString() === req.user._id.toString());

  if (!isParticipant) {
    return res.status(403).json({ error: 'Not authorized to add communication' });
  }

  collaboration.communication.push({
    type: type || 'message',
    author: req.user._id,
    content,
    attachments: attachments || []
  });

  await collaboration.save();

  res.json({ message: 'Communication added successfully' });
}));

// Update milestone
router.patch('/:id/milestones/:milestoneId', protect, catchAsync(async (req, res) => {
  const { completed } = req.body;
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    return res.status(404).json({ error: 'Collaboration not found' });
  }

  // Check if user is part of this collaboration
  const isParticipant = collaboration.initiator._id.toString() === req.user._id.toString() ||
                       collaboration.participants.some(p => p.user._id.toString() === req.user._id.toString());

  if (!isParticipant) {
    return res.status(403).json({ error: 'Not authorized to update milestones' });
  }

  const milestone = collaboration.timeline.milestones.id(req.params.milestoneId);
  if (!milestone) {
    return res.status(404).json({ error: 'Milestone not found' });
  }

  milestone.completed = completed;
  if (completed) {
    milestone.completedAt = new Date();
  }

  await collaboration.save();

  res.json({ message: 'Milestone updated successfully' });
}));

// Delete collaboration
router.delete('/:id', protect, catchAsync(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    return res.status(404).json({ error: 'Collaboration not found' });
  }

  // Check if user is the initiator
  if (collaboration.initiator.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to delete this collaboration' });
  }

  await Collaboration.findByIdAndDelete(req.params.id);

  res.json({ message: 'Collaboration deleted successfully' });
}));

export default router;
