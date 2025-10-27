import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Gig title is required'],
      trim: true,
      maxLength: [100, 'Gig title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Gig description is required'],
      trim: true,
      maxLength: [2000, 'Gig description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['music', 'photography', 'videography', 'design', 'writing', 'other'],
    },
    subcategory: {
      type: String,
      trim: true,
      maxLength: [50, 'Subcategory cannot exceed 50 characters'],
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'one-time'],
      default: 'freelance',
    },
    location: {
      type: {
        type: String,
        enum: ['on-site', 'remote', 'hybrid'],
        default: 'remote',
      },
      city: String,
      country: String,
      address: String,
    },
    budget: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    duration: {
      type: String,
      enum: ['1-day', '1-week', '1-month', '3-months', '6-months', 'ongoing'],
      default: '1-month',
    },
    startDate: {
      type: Date,
    },
    deadline: {
      type: Date,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'professional'],
      default: 'intermediate',
    },
    requirements: [{
      type: String,
      trim: true,
      maxLength: [200, 'Requirement cannot exceed 200 characters'],
    }],
    skills: [{
      type: String,
      trim: true,
      maxLength: [50, 'Skill cannot exceed 50 characters'],
    }],
    deliverables: [{
      type: String,
      trim: true,
      maxLength: [200, 'Deliverable cannot exceed 200 characters'],
    }],
    applicants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      coverLetter: {
        type: String,
        required: true,
        trim: true,
        maxLength: [1000, 'Cover letter cannot exceed 1000 characters'],
      },
      proposedRate: {
        type: Number,
        min: 0,
      },
      portfolio: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio',
      }],
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'hired'],
        default: 'pending',
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    hiredCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'filled', 'cancelled'],
      default: 'open',
    },
    views: {
      type: Number,
      default: 0,
    },
    applications: {
      type: Number,
      default: 0,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
      trim: true,
      maxLength: [30, 'Tag cannot exceed 30 characters'],
    }],
    contactInfo: {
      email: String,
      phone: String,
      preferredContact: {
        type: String,
        enum: ['email', 'phone', 'platform'],
        default: 'platform',
      },
    },
    additionalInfo: {
      type: String,
      trim: true,
      maxLength: [500, 'Additional info cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
gigSchema.index({ postedBy: 1, createdAt: -1 });
gigSchema.index({ category: 1, status: 1, createdAt: -1 });
gigSchema.index({ location: 1, status: 1 });
gigSchema.index({ experienceLevel: 1, status: 1 });
gigSchema.index({ budget: 1, status: 1 });
gigSchema.index({ tags: 1, status: 1 });
gigSchema.index({ isUrgent: 1, status: 1, createdAt: -1 });

// Virtual for application count
gigSchema.virtual('applicationCount').get(function() {
  return this.applicants.length;
});

// Virtual for days since posted
gigSchema.virtual('daysSincePosted').get(function() {
  const now = new Date();
  const posted = this.createdAt;
  const diffTime = Math.abs(now - posted);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
gigSchema.set('toJSON', { virtuals: true });
gigSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update application count
gigSchema.pre('save', function(next) {
  this.applications = this.applicants.length;
  next();
});

// Method to increment views
gigSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add applicant
gigSchema.methods.addApplicant = function(userId, applicationData) {
  // Check if user already applied
  const existingApplication = this.applicants.find(
    app => app.user.toString() === userId.toString()
  );
  
  if (existingApplication) {
    throw new Error('User has already applied to this gig');
  }

  this.applicants.push({
    user: userId,
    ...applicationData,
    appliedAt: new Date()
  });
  
  return this.save();
};

// Method to update applicant status
gigSchema.methods.updateApplicantStatus = function(userId, status) {
  const applicant = this.applicants.find(
    app => app.user.toString() === userId.toString()
  );
  
  if (!applicant) {
    throw new Error('Applicant not found');
  }
  
  applicant.status = status;
  return this.save();
};

// Method to hire applicant
gigSchema.methods.hireApplicant = function(userId) {
  const applicant = this.applicants.find(
    app => app.user.toString() === userId.toString()
  );
  
  if (!applicant) {
    throw new Error('Applicant not found');
  }
  
  this.hiredCreator = userId;
  this.status = 'filled';
  applicant.status = 'hired';
  
  // Reject other applicants
  this.applicants.forEach(app => {
    if (app.user.toString() !== userId.toString()) {
      app.status = 'rejected';
    }
  });
  
  return this.save();
};

// Static method to search gigs
gigSchema.statics.searchGigs = function(query, filters = {}) {
  const searchQuery = {
    status: 'open',
    ...filters
  };

  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { subcategory: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
      { skills: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  return this.find(searchQuery)
    .populate('postedBy', 'name username profilePhoto')
    .sort({ isUrgent: -1, createdAt: -1 });
};

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;