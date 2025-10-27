import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxLength: [200, "Subject cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: [2000, "Message cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      enum: ["feedback", "collaboration", "booking", "general"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    attachments: [{
      filename: String,
      url: String,
      type: String,
      size: Number,
    }],
    metadata: {
      projectId: String,
      bookingId: String,
      collaborationId: String,
    },
  },
  { timestamps: true }
);

// Index for better query performance
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ type: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;