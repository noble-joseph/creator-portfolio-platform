import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    mediaFiles: [{
      type: {
        type: String,
      },
      url: {
        type: String,
      },
      filename: String,
      size: Number,
      duration: Number, // for video/audio files
      thumbnail: String, // for video files
    }],
    thumbnail: {
      type: String,
      default: function() {
        // Use first image as thumbnail if available
        const firstImage = this.mediaFiles?.find(file => file.type === 'image');
        return firstImage ? firstImage.url : null;
      }
    },
    link: {
      type: String,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    isPublic: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
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
      },
      content: {
        type: String,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    projectDetails: {
      client: String,
      duration: String,
      budget: Number,
      team: [String],
      tools: [String],
      challenges: String,
      solution: String,
      results: String,
    },
    collaboration: {
      collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      roles: [String],
      credits: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
portfolioSchema.index({ user: 1, createdAt: -1 });
portfolioSchema.index({ category: 1, isPublic: 1, createdAt: -1 });
portfolioSchema.index({ tags: 1, isPublic: 1 });
portfolioSchema.index({ featured: 1, isPublic: 1, createdAt: -1 });

// Virtual for like count
portfolioSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
portfolioSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Ensure virtual fields are serialized
portfolioSchema.set('toJSON', { virtuals: true });
portfolioSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update thumbnail
portfolioSchema.pre('save', function(next) {
  if (this.isModified('mediaFiles') && this.mediaFiles.length > 0) {
    const firstImage = this.mediaFiles.find(file => file.type === 'image');
    if (firstImage && !this.thumbnail) {
      this.thumbnail = firstImage.url;
    }
  }
  next();
});

// Method to increment views
portfolioSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
portfolioSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    return false; // unliked
  } else {
    this.likes.push(userId);
    return true; // liked
  }
};

// Method to add comment
portfolioSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content,
    createdAt: new Date()
  });
  return this.save();
};

// Method to remove comment
portfolioSchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId);
  return this.save();
};

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;