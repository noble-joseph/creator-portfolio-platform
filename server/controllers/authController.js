import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

const allowedRoles = ["musician", "photographer"];

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, role, specialization, specializationDetails, experiences, skills, bio } = req.body;

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be musician or photographer." });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.create({ name, username, email, password, role, specialization, specializationDetails, experiences, skills, bio });

    if (user) {
      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
          specializationDetails: user.specializationDetails,
        },
        accessToken: generateAccessToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(" | ") });
    }

    console.error("🔥 Unexpected error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
          specializationDetails: user.specializationDetails,
        },
        accessToken: generateAccessToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("❌ Registration error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.id);

    res.json({ accessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

// @desc    Update user profile
// @route   POST /api/auth/updateProfile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { specialization, specializationDetails, experiences, skills, bio } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { specialization, specializationDetails, experiences, skills, bio },
      { new: true, runValidators: true }
    );

    if (user) {
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
          specializationDetails: user.specializationDetails,
          experiences: user.experiences,
          skills: user.skills,
          bio: user.bio,
        },
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("❌ Profile update error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        specializationDetails: user.specializationDetails,
        experiences: user.experiences,
        skills: user.skills,
        bio: user.bio,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("❌ Get current user error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/auth/profile/:userId
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        specialization: user.specialization,
        specializationDetails: user.specializationDetails,
        experiences: user.experiences,
        skills: user.skills,
        bio: user.bio,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("❌ Get user profile error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};
