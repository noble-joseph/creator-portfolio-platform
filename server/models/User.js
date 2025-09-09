import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const allowedRoles = ["musician", "photographer"];

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
      required: [true, "Password is required"],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
        },
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      },
    },

    role: {
      type: String,
      enum: {
        values: allowedRoles,
        message: "Role must be either musician or photographer",
      },
      required: [true, "Role is required"],
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
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
