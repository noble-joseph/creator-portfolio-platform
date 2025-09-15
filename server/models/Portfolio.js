import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxLength: [500, "Description cannot exceed 500 characters"],
    },
    link: {
      type: String,
      required: [true, "Link is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "Link must be a valid URL starting with http:// or https://",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["music", "photography", "video", "artwork", "other"],
        message: "Category must be one of: music, photography, video, artwork, other",
      },
    },
    tags: [{
      type: String,
      trim: true,
    }],
    privacy: {
      type: String,
      enum: {
        values: ["public", "private"],
        message: "Privacy must be either public or private",
      },
      default: "private",
    },
    thumbnail: {
      type: String,
      trim: true,
    },
<<<<<<< HEAD
    mediaFiles: [{
      type: String,
      trim: true,
    }],
=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
  },
  { timestamps: true }
);

// Index for better query performance
portfolioSchema.index({ user: 1, createdAt: -1 });
portfolioSchema.index({ privacy: 1, createdAt: -1 });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;
