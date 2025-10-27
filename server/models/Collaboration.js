import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema(
  {
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        enum: ['collaborator', 'client', 'mentor', 'mentee'],
        default: 'collaborator',
      },
      status: {
        type: String,
        enum: ['invited', 'accepted', 'declined', 'left'],
        default: 'invited',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      permissions: {
        canEdit: {
          type: Boolean,
          default: false,
        },
        canInvite: {
          type: Boolean,
          default: false,
        },
        canDelete: {
          type: Boolean,
          default: false,
        },
      },
    }],
    title: {
      type: String,
      required: [true, 'Collaboration title is required'],
      trim: true,
      maxLength: [150, 'Collaboration title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Collaboration description is required'],
      trim: true,
      maxLength: [2000, 'Collaboration description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['music', 'photography', 'videography', 'design', 'writing', 'cross-genre', 'other'],
    },
    projectType: {
      type: String,
      required: [true, 'Project type is required'],
      enum: ['music_video', 'photoshoot', 'album_art', 'event_coverage', 'brand_campaign', 'artistic_project', 'commercial_project', 'other'],
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
      default: 'planning',
    },
    visibility: {
      type: String,
      enum: ['private', 'public', 'connections'],
      default: 'private',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    timeline: {
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      milestones: [{
        title: {
          type: String,
          required: true,
          trim: true,
          maxLength: [100, 'Milestone title cannot exceed 100 characters'],
        },
        description: {
          type: String,
          trim: true,
          maxLength: [500, 'Milestone description cannot exceed 500 characters'],
        },
        dueDate: {
          type: Date,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      }],
    },
    budget: {
      total: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      breakdown: [{
        item: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      }],
    },
    deliverables: [{
      title: {
        type: String,
        required: true,
        trim: true,
        maxLength: [100, 'Deliverable title cannot exceed 100 characters'],
      },
      description: {
        type: String,
        trim: true,
        maxLength: [500, 'Deliverable description cannot exceed 500 characters'],
      },
      type: {
        type: String,
        enum: ['file', 'link', 'text', 'other'],
        default: 'file',
      },
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'reviewed'],
        default: 'pending',
      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      dueDate: {
        type: Date,
      },
      files: [{
        name: String,
        url: String,
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
    }],
    communication: [{
      type: {
        type: String,
        enum: ['message', 'file', 'milestone', 'deliverable', 'system'],
        default: 'message',
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxLength: [2000, 'Message content cannot exceed 2000 characters'],
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
      editedAt: {
        type: Date,
      },
      isEdited: {
        type: Boolean,
        default: false,
      },
    }],
    tags: [{
      type: String,
      trim: true,
      maxLength: [30, 'Tag cannot exceed 30 characters'],
    }],
    skills: [{
      type: String,
      trim: true,
      maxLength: [50, 'Skill cannot exceed 50 characters'],
    }],
    requirements: [{
      type: String,
      trim: true,
      maxLength: [200, 'Requirement cannot exceed 200 characters'],
    }],
    inspiration: {
      type: String,
      trim: true,
      maxLength: [1000, 'Inspiration cannot exceed 1000 characters'],
    },
    goals: [{
      type: String,
      trim: true,
      maxLength: [200, 'Goal cannot exceed 200 characters'],
    }],
    challenges: [{
      type: String,
      trim: true,
      maxLength: [200, 'Challenge cannot exceed 200 characters'],
    }],
    resources: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      type: {
        type: String,
        enum: ['equipment', 'software', 'location', 'personnel', 'other'],
        default: 'other',
      },
      description: {
        type: String,
        trim: true,
        maxLength: [200, 'Resource description cannot exceed 200 characters'],
      },
      providedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['needed', 'provided', 'confirmed'],
        default: 'needed',
      },
    }],
    portfolio: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
    }],
    views: {
      type: Number,
      default: 0,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxLength: [500, 'Comment cannot exceed 500 characters'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
collaborationSchema.index({ initiator: 1, status: 1, createdAt: -1 });
collaborationSchema.index({ 'participants.user': 1, status: 1, createdAt: -1 });
collaborationSchema.index({ category: 1, status: 1, isPublic: 1, createdAt: -1 });
collaborationSchema.index({ projectType: 1, status: 1, isPublic: 1 });
collaborationSchema.index({ tags: 1, status: 1, isPublic: 1 });
collaborationSchema.index({ visibility: 1, status: 1, createdAt: -1 });

// Virtual for participant count
collaborationSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for active participant count
collaborationSchema.virtual('activeParticipantCount').get(function() {
  return this.participants.filter(p => p.status === 'accepted').length;
});

// Virtual for like count
collaborationSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
collaborationSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for progress percentage
collaborationSchema.virtual('progressPercentage').get(function() {
  if (!this.timeline.milestones || this.timeline.milestones.length === 0) {
    return 0;
  }
  
  const completedMilestones = this.timeline.milestones.filter(m => m.completed).length;
  return Math.round((completedMilestones / this.timeline.milestones.length) * 100);
});

// Ensure virtual fields are serialized
collaborationSchema.set('toJSON', { virtuals: true });
collaborationSchema.set('toObject', { virtuals: true });

// Method to add participant
collaborationSchema.methods.addParticipant = function(userId, role = 'collaborator') {
  // Check if user is already a participant
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    throw new Error('User is already a participant');
  }

  this.participants.push({
    user: userId,
    role: role,
    status: 'invited',
    joinedAt: new Date()
  });
  
  return this.save();
};

// Method to update participant status
collaborationSchema.methods.updateParticipantStatus = function(userId, status) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!participant) {
    throw new Error('Participant not found');
  }
  
  participant.status = status;
  if (status === 'accepted') {
    participant.joinedAt = new Date();
  }
  
  return this.save();
};

// Method to add communication
collaborationSchema.methods.addCommunication = function(authorId, content, type = 'message', attachments = []) {
  this.communication.push({
    type: type,
    author: authorId,
    content: content,
    attachments: attachments,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to add milestone
collaborationSchema.methods.addMilestone = function(milestoneData) {
  this.timeline.milestones.push({
    ...milestoneData,
    completed: false
  });
  
  return this.save();
};

// Method to update milestone
collaborationSchema.methods.updateMilestone = function(milestoneId, updates) {
  const milestone = this.timeline.milestones.id(milestoneId);
  
  if (!milestone) {
    throw new Error('Milestone not found');
  }
  
  Object.assign(milestone, updates);
  
  if (updates.completed && !milestone.completedAt) {
    milestone.completedAt = new Date();
  }
  
  return this.save();
};

// Method to add deliverable
collaborationSchema.methods.addDeliverable = function(deliverableData) {
  this.deliverables.push({
    ...deliverableData,
    status: 'pending'
  });
  
  return this.save();
};

// Method to update deliverable
collaborationSchema.methods.updateDeliverable = function(deliverableId, updates) {
  const deliverable = this.deliverables.id(deliverableId);
  
  if (!deliverable) {
    throw new Error('Deliverable not found');
  }
  
  Object.assign(deliverable, updates);
  
  return this.save();
};

// Method to increment views
collaborationSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
collaborationSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    return false; // unliked
  } else {
    this.likes.push(userId);
    return true; // liked
  }
};

// Static method to search collaborations
collaborationSchema.statics.searchCollaborations = function(query, filters = {}) {
  const searchQuery = {
    isPublic: true,
    ...filters
  };

  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
      { skills: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  return this.find(searchQuery)
    .populate('initiator', 'name username profilePhoto')
    .populate('participants.user', 'name username profilePhoto')
    .sort({ createdAt: -1 });
};

const Collaboration = mongoose.model('Collaboration', collaborationSchema);

export default Collaboration;