import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

const allowedRoles = ["musician", "photographer", "admin"];

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
    const { specialization, specializationDetails, experiences, skills, bio, profilePhoto, coverPhoto, socialMedia } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { specialization, specializationDetails, experiences, skills, bio, profilePhoto, coverPhoto, socialMedia },
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
          profilePhoto: user.profilePhoto,
          coverPhoto: user.coverPhoto,
          socialMedia: user.socialMedia,
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

// @desc    Update profile picture
// @route   POST /api/auth/updateProfilePicture
// @access  Private
export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    // Handle file upload
    const profilePhoto = req.file ? req.file.filename : "";

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto },
      { new: true, runValidators: true }
    );

    if (user) {
      res.json({
        message: "Profile picture updated successfully",
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
        },
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("❌ Profile picture update error:", error.stack);
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
        profilePhoto: user.profilePhoto,
        coverPhoto: user.coverPhoto,
        socialMedia: user.socialMedia,
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
    const currentUserId = req.user ? req.user.id : null; // Get current user if authenticated

    const user = await User.findById(userId);

    if (user) {
      // Check if current user is following this user
      const isFollowing = currentUserId ? user.followers.includes(currentUserId) : false;

      // Check connection status
      let connectionStatus = 'none';
      if (currentUserId) {
        if (user.connections.includes(currentUserId)) {
          connectionStatus = 'connected';
        } else if (user.connectionRequests.includes(currentUserId)) {
          connectionStatus = 'request_sent';
        } else {
          // Check if current user has a pending request from this user
          const currentUserDoc = await User.findById(currentUserId);
          if (currentUserDoc && currentUserDoc.connectionRequests.includes(userId)) {
            connectionStatus = 'request_received';
          }
        }
      }

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
        profilePhoto: user.profilePhoto,
        coverPhoto: user.coverPhoto,
        socialMedia: user.socialMedia,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        connectionsCount: user.connections.length,
        isFollowing: isFollowing,
        connectionStatus: connectionStatus,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("❌ Get user profile error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req, res) => {
  try {
    const accessToken = generateAccessToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);

    // Redirect to client with tokens
    res.redirect(`http://localhost:5173/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  } catch (error) {
    console.error("❌ Google callback error:", error.stack);
    res.redirect("http://localhost:5173/login");
  }
};

// @desc    Follow a user
// @route   POST /api/auth/follow/:userId
// @access  Private
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add to following list of current user
    currentUser.following.push(userId);
    await currentUser.save();

    // Add to followers list of target user
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    res.json({
      message: "Successfully followed user",
      following: currentUser.following.length,
      followers: userToFollow.followers.length
    });
  } catch (error) {
    console.error("❌ Follow user error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/auth/unfollow/:userId
// @access  Private
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from following list of current user
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    await currentUser.save();

    // Remove from followers list of target user
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);
    await userToUnfollow.save();

    res.json({
      message: "Successfully unfollowed user",
      following: currentUser.following.length,
      followers: userToUnfollow.followers.length
    });
  } catch (error) {
    console.error("❌ Unfollow user error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's connections (followers and following)
// @route   GET /api/auth/connections
// @access  Private
export const getConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('followers', 'name username profilePhoto')
      .populate('following', 'name username profilePhoto')
      .populate('connections', 'name username profilePhoto')
      .populate('connectionRequests', 'name username profilePhoto');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      followers: user.followers,
      following: user.following,
      connections: user.connections,
      connectionRequests: user.connectionRequests,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      connectionsCount: user.connections.length,
      connectionRequestsCount: user.connectionRequests.length
    });
  } catch (error) {
    console.error("❌ Get connections error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Send connection request
// @route   POST /api/auth/connect/:userId
// @access  Private
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot connect with yourself" });
    }

    const userToConnect = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToConnect) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already connected
    if (currentUser.connections.includes(userId)) {
      return res.status(400).json({ message: "Already connected with this user" });
    }

    // Check if request already sent
    if (userToConnect.connectionRequests.includes(currentUserId)) {
      return res.status(400).json({ message: "Connection request already sent" });
    }

    // Add to connection requests of target user
    userToConnect.connectionRequests.push(currentUserId);
    await userToConnect.save();

    res.json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("❌ Send connection request error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Accept connection request
// @route   POST /api/auth/accept-connection/:userId
// @access  Private
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const requestingUser = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!requestingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    if (!currentUser.connectionRequests.includes(userId)) {
      return res.status(400).json({ message: "No connection request from this user" });
    }

    // Remove from connection requests
    currentUser.connectionRequests = currentUser.connectionRequests.filter(id => id.toString() !== userId);
    // Add to connections for both users
    currentUser.connections.push(userId);
    requestingUser.connections.push(currentUserId);

    await currentUser.save();
    await requestingUser.save();

    res.json({ message: "Connection request accepted" });
  } catch (error) {
    console.error("❌ Accept connection request error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Decline connection request
// @route   DELETE /api/auth/decline-connection/:userId
// @access  Private
export const declineConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);

    // Remove from connection requests
    currentUser.connectionRequests = currentUser.connectionRequests.filter(id => id.toString() !== userId);
    await currentUser.save();

    res.json({ message: "Connection request declined" });
  } catch (error) {
    console.error("❌ Decline connection request error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove connection
// @route   DELETE /api/auth/disconnect/:userId
// @access  Private
export const removeConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const userToDisconnect = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToDisconnect) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from connections for both users
    currentUser.connections = currentUser.connections.filter(id => id.toString() !== userId);
    userToDisconnect.connections = userToDisconnect.connections.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await userToDisconnect.save();

    res.json({ message: "Connection removed successfully" });
  } catch (error) {
    console.error("❌ Remove connection error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get users for discovery
// @route   GET /api/auth/discover
// @access  Public
export const getUsersForDiscovery = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { search, role, limit = 20 } = req.query;

    let query = {};

    // Exclude current user if authenticated
    if (currentUserId) {
      query._id = { $ne: currentUserId };
    }

    // Filter by role if specified
    if (role && role !== 'all') {
      query.role = role;
    }

    // Search by name or username if search term provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name username role specialization profilePhoto bio')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Add connection status for authenticated users
    let usersWithStatus = users;
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId);
      usersWithStatus = users.map(user => {
        let connectionStatus = 'none';
        if (currentUser.connections.includes(user._id)) {
          connectionStatus = 'connected';
        } else if (user.connectionRequests.includes(currentUserId)) {
          connectionStatus = 'request_sent';
        } else if (currentUser.connectionRequests.includes(user._id)) {
          connectionStatus = 'request_received';
        }

        return {
          ...user.toObject(),
          connectionStatus,
          isFollowing: currentUser.following.includes(user._id)
        };
      });
    }

    res.json({
      users: usersWithStatus,
      total: usersWithStatus.length
    });
  } catch (error) {
    console.error("❌ Get users for discovery error:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};
