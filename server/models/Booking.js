import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: String,
      required: [true, 'Service type is required'],
      trim: true,
      maxLength: [100, 'Service type cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxLength: [1000, 'Description cannot exceed 1000 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Booking start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Booking end date is required'],
    },
    duration: {
      type: Number,
      min: 0.5,
      required: [true, 'Duration is required'],
    },
    hourlyRate: {
      type: Number,
      min: 0,
      required: [true, 'Hourly rate is required'],
    },
    totalAmount: {
      type: Number,
      min: 0,
      required: [true, 'Total amount is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['on-site', 'remote', 'hybrid'],
        default: 'remote',
      },
      address: String,
      city: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    requirements: [{
      type: String,
      trim: true,
      maxLength: [200, 'Requirement cannot exceed 200 characters'],
    }],
    deliverables: [{
      type: String,
      trim: true,
      maxLength: [200, 'Deliverable cannot exceed 200 characters'],
    }],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer', 'cash', 'other'],
    },
    paymentId: String,
    notes: {
      type: String,
      trim: true,
      maxLength: [500, 'Notes cannot exceed 500 characters'],
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxLength: [200, 'Cancellation reason cannot exceed 200 characters'],
    },
    cancellationDate: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
        maxLength: [500, 'Feedback comment cannot exceed 500 characters'],
      },
      givenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      givenAt: {
        type: Date,
      },
    },
    files: [{
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      size: Number,
      type: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    communication: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      message: {
        type: String,
        required: true,
        trim: true,
        maxLength: [1000, 'Message cannot exceed 1000 characters'],
      },
      attachments: [{
        name: String,
        url: String,
        size: Number,
        type: String,
      }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    reminders: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push'],
        default: 'email',
      },
      scheduledFor: {
        type: Date,
        required: true,
      },
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: {
        type: Date,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
bookingSchema.index({ creator: 1, startDate: 1 });
bookingSchema.index({ client: 1, startDate: 1 });
bookingSchema.index({ status: 1, startDate: 1 });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for duration in hours
bookingSchema.virtual('durationHours').get(function() {
  return this.duration;
});

// Virtual for duration in days
bookingSchema.virtual('durationDays').get(function() {
  return Math.ceil(this.duration / 24);
});

// Virtual for is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date() && this.status === 'confirmed';
});

// Virtual for is active
bookingSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && this.status === 'in-progress';
});

// Virtual for is completed
bookingSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' || this.endDate < new Date();
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

// Pre-save middleware to calculate total amount
bookingSchema.pre('save', function(next) {
  if (this.isModified('duration') || this.isModified('hourlyRate')) {
    this.totalAmount = this.duration * this.hourlyRate;
  }
  next();
});

// Method to confirm booking
bookingSchema.methods.confirm = function() {
  this.status = 'confirmed';
  return this.save();
};

// Method to start booking
bookingSchema.methods.start = function() {
  this.status = 'in-progress';
  return this.save();
};

// Method to complete booking
bookingSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  this.cancelledBy = cancelledBy;
  return this.save();
};

// Method to add communication
bookingSchema.methods.addCommunication = function(senderId, message, attachments = []) {
  this.communication.push({
    sender: senderId,
    message: message,
    attachments: attachments,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to add file
bookingSchema.methods.addFile = function(fileData, uploadedBy) {
  this.files.push({
    ...fileData,
    uploadedBy: uploadedBy,
    uploadedAt: new Date()
  });
  
  return this.save();
};

// Method to add feedback
bookingSchema.methods.addFeedback = function(rating, comment, givenBy) {
  this.feedback = {
    rating: rating,
    comment: comment,
    givenBy: givenBy,
    givenAt: new Date()
  };
  
  return this.save();
};

// Method to schedule reminder
bookingSchema.methods.scheduleReminder = function(scheduledFor, type = 'email') {
  this.reminders.push({
    type: type,
    scheduledFor: scheduledFor,
    sent: false
  });
  
  return this.save();
};

// Static method to get bookings by date range
bookingSchema.statics.getBookingsByDateRange = function(startDate, endDate, userId = null) {
  const query = {
    startDate: { $gte: startDate },
    endDate: { $lte: endDate },
    status: { $in: ['confirmed', 'in-progress'] }
  };

  if (userId) {
    query.$or = [
      { creator: userId },
      { client: userId }
    ];
  }

  return this.find(query)
    .populate('creator', 'name username profilePhoto')
    .populate('client', 'name username profilePhoto')
    .sort({ startDate: 1 });
};

// Static method to get upcoming bookings
bookingSchema.statics.getUpcomingBookings = function(userId, limit = 10) {
  return this.find({
    $or: [
      { creator: userId },
      { client: userId }
    ],
    startDate: { $gte: new Date() },
    status: { $in: ['confirmed', 'in-progress'] }
  })
    .populate('creator', 'name username profilePhoto')
    .populate('client', 'name username profilePhoto')
    .sort({ startDate: 1 })
    .limit(limit);
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;