import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const allowedRoles = ["musician", "photographer", "admin"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9_]{3,20}$/,
        "Username must be 3–20 characters, lowercase, and can include underscores.",
      ],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password required only if not OAuth user
      },
      validate: {
        validator: function (value) {
          if (!this.googleId && value) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
          }
          return true;
        },
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: {
        values: allowedRoles,
        message: "Role must be either musician or photographer",
      },
      required: function() {
        return !this.googleId; // Role required only if not OAuth user
      },
      default: function() {
        return this.googleId ? "musician" : undefined; // Default role for OAuth users
      },
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "professional"],
        message: "Experience level must be beginner, intermediate, or professional",
      },
      default: "beginner",
    },
    specialization: {
      type: String,
      required: function() {
        return !this.googleId; // Specialization required only if not OAuth user
      },
      default: function() {
        return this.googleId ? "General" : undefined; // Default specialization for OAuth users
      },
    },
    specializationDetails: {
      type: String,
      required: false,
    },
    experiences: [{
      title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: "",
      },
    }],
    skills: [{
      type: String,
    }],
    bio: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    socialMedia: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    connections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    connectionRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
