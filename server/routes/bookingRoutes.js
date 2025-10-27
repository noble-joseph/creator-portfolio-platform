import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { sanitizePortfolioInput } from '../middleware/sanitizeMiddleware.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

const router = express.Router();

// Get bookings for a creator
router.get('/creator/:creatorId', protect, catchAsync(async (req, res) => {
  const bookings = await Booking.find({ creator: req.params.creatorId })
    .populate('client', 'name username profilePhoto')
    .sort({ createdAt: -1 });

  res.json(bookings);
}));

// Get bookings for a client
router.get('/client/:clientId', protect, catchAsync(async (req, res) => {
  const bookings = await Booking.find({ client: req.params.clientId })
    .populate('creator', 'name username profilePhoto hourlyRate')
    .sort({ createdAt: -1 });

  res.json(bookings);
}));

// Create a new booking
router.post('/', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const {
    creatorId,
    service,
    description,
    startDate,
    endDate,
    duration,
    location,
    address,
    requirements,
    deliverables
  } = req.body;

  // Get creator details
  const creator = await User.findById(creatorId);
  if (!creator) {
    return res.status(404).json({ error: 'Creator not found' });
  }

  if (!creator.monetization?.isBookable) {
    return res.status(400).json({ error: 'Creator is not available for booking' });
  }

  // Calculate total amount
  const hourlyRate = creator.hourlyRate || 50;
  const totalAmount = duration * hourlyRate;

  const booking = new Booking({
    client: req.user._id,
    creator: creatorId,
    service,
    description,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    duration,
    hourlyRate,
    totalAmount,
    location: {
      type: location,
      address: location !== 'remote' ? address : undefined
    },
    requirements: requirements || [],
    deliverables: deliverables || []
  });

  await booking.save();
  await booking.populate('creator', 'name username profilePhoto');
  await booking.populate('client', 'name username profilePhoto');

  res.status(201).json({
    message: 'Booking request sent successfully',
    booking
  });
}));

// Update booking status
router.patch('/:bookingId/:action', protect, catchAsync(async (req, res) => {
  const { bookingId, action } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check if user is authorized to perform this action
  if (booking.creator.toString() !== req.user._id.toString() && 
      booking.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to perform this action' });
  }

  let updateData = {};
  let message = '';

  switch (action) {
    case 'confirm':
      if (booking.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only creator can confirm bookings' });
      }
      updateData = { status: 'confirmed' };
      message = 'Booking confirmed successfully';
      break;

    case 'decline':
      if (booking.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only creator can decline bookings' });
      }
      updateData = { status: 'cancelled', cancellationReason: 'Declined by creator' };
      message = 'Booking declined';
      break;

    case 'cancel':
      updateData = { 
        status: 'cancelled', 
        cancellationReason: 'Cancelled by client',
        cancellationDate: new Date()
      };
      message = 'Booking cancelled';
      break;

    case 'start':
      if (booking.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only creator can start bookings' });
      }
      updateData = { status: 'in-progress' };
      message = 'Booking started';
      break;

    case 'complete':
      if (booking.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only creator can complete bookings' });
      }
      updateData = { status: 'completed' };
      message = 'Booking completed';
      break;

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    updateData,
    { new: true }
  ).populate('creator', 'name username profilePhoto')
   .populate('client', 'name username profilePhoto');

  res.json({
    message,
    booking: updatedBooking
  });
}));

// Get booking details
router.get('/:bookingId', protect, catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId)
    .populate('creator', 'name username profilePhoto hourlyRate')
    .populate('client', 'name username profilePhoto');

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check if user is authorized to view this booking
  if (booking.creator._id.toString() !== req.user._id.toString() && 
      booking.client._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to view this booking' });
  }

  res.json(booking);
}));

// Update booking details
router.put('/:bookingId', protect, sanitizePortfolioInput, catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check if user is authorized to update this booking
  if (booking.creator.toString() !== req.user._id.toString() && 
      booking.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to update this booking' });
  }

  // Only allow updates if booking is pending or confirmed
  if (!['pending', 'confirmed'].includes(booking.status)) {
    return res.status(400).json({ error: 'Cannot update booking in current status' });
  }

  const allowedUpdates = ['description', 'requirements', 'deliverables', 'notes'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.bookingId,
    updates,
    { new: true, runValidators: true }
  ).populate('creator', 'name username profilePhoto')
   .populate('client', 'name username profilePhoto');

  res.json({
    message: 'Booking updated successfully',
    booking: updatedBooking
  });
}));

export default router;
