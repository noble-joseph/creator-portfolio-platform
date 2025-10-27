import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { sanitizeAuthInput } from '../middleware/sanitizeMiddleware.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Get messages for current user
router.get('/', protect, catchAsync(async (req, res) => {
  const { type, isRead, limit = 50, page = 1 } = req.query;
  
  const query = {
    $or: [
      { sender: req.user._id },
      { recipient: req.user._id }
    ]
  };

  if (type) {
    query.type = type;
  }

  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  const messages = await Message.find(query)
    .populate('sender', 'name username profilePhoto')
    .populate('recipient', 'name username profilePhoto')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.json(messages);
}));

// Get conversation between two users
router.get('/conversation/:userId', protect, catchAsync(async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: req.params.userId },
      { sender: req.params.userId, recipient: req.user._id }
    ]
  })
    .populate('sender', 'name username profilePhoto')
    .populate('recipient', 'name username profilePhoto')
    .sort({ createdAt: 1 });

  res.json(messages);
}));

// Send a new message
router.post('/', protect, sanitizeAuthInput, catchAsync(async (req, res) => {
  const {
    recipientId,
    subject,
    content,
    type = 'general',
    priority = 'normal'
  } = req.body;

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return res.status(404).json({ error: 'Recipient not found' });
  }

  // Check if recipient allows public messages
  if (!recipient.socialSettings?.allowPublicMessages && 
      !req.user.connections.includes(recipientId)) {
    return res.status(403).json({ 
      error: 'This user does not accept messages from non-connections' 
    });
  }

  const message = new Message({
    sender: req.user._id,
    recipient: recipientId,
    subject,
    content,
    type,
    priority
  });

  await message.save();
  await message.populate('sender', 'name username profilePhoto');
  await message.populate('recipient', 'name username profilePhoto');

  res.status(201).json({
    message: 'Message sent successfully',
    data: message
  });
}));

// Mark message as read
router.patch('/:messageId/read', protect, catchAsync(async (req, res) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  // Check if user is the recipient
  if (message.recipient.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to mark this message as read' });
  }

  message.isRead = true;
  message.readAt = new Date();
  await message.save();

  res.json({ message: 'Message marked as read' });
}));

// Archive message
router.patch('/:messageId/archive', protect, catchAsync(async (req, res) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  // Check if user is sender or recipient
  if (message.sender.toString() !== req.user._id.toString() && 
      message.recipient.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to archive this message' });
  }

  message.isArchived = true;
  await message.save();

  res.json({ message: 'Message archived' });
}));

// Delete message
router.delete('/:messageId', protect, catchAsync(async (req, res) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  // Check if user is sender or recipient
  if (message.sender.toString() !== req.user._id.toString() && 
      message.recipient.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to delete this message' });
  }

  await Message.findByIdAndDelete(req.params.messageId);

  res.json({ message: 'Message deleted successfully' });
}));

// Get unread message count
router.get('/unread/count', protect, catchAsync(async (req, res) => {
  const count = await Message.countDocuments({
    recipient: req.user._id,
    isRead: false,
    isArchived: false
  });

  res.json({ unreadCount: count });
}));

// Mark all messages as read
router.patch('/mark-all-read', protect, catchAsync(async (req, res) => {
  await Message.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({ message: 'All messages marked as read' });
}));

export default router;