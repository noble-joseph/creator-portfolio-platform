import Portfolio from "../models/Portfolio.js";
<<<<<<< HEAD
import User from "../models/User.js";
=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d

export const getAllCreators = (req, res) => {
  res.send("All creators endpoint");
};

export const getCreatorProfile = (req, res) => {
  res.send(`Profile for creator ${req.params.id}`);
};

// Portfolio controller functions
export const createPortfolio = async (req, res) => {
  try {
<<<<<<< HEAD
    const { title, description, link, category, tags, privacy } = req.body;

    // Handle file uploads
    const thumbnail = req.files?.thumbnail ? req.files.thumbnail[0].filename : req.body.thumbnail || "";
    const mediaFiles = req.files?.mediaFiles ? req.files.mediaFiles.map(file => file.filename) : [];
=======
    const { title, description, link, category, tags, privacy, thumbnail } = req.body;
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d

    const portfolio = new Portfolio({
      user: req.user._id,
      title,
      description,
      link,
      category,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      privacy: privacy || "private",
      thumbnail,
<<<<<<< HEAD
      mediaFiles,
=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
    });

    const savedPortfolio = await portfolio.save();
    await savedPortfolio.populate("user", "name username");

    res.status(201).json({
      message: "Portfolio item created successfully",
      portfolio: savedPortfolio,
    });
  } catch (error) {
    console.error("Error creating portfolio:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name username");

    res.json(portfolios);
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPublicPortfolios = async (req, res) => {
  try {
    const { userId } = req.params;
<<<<<<< HEAD
    const currentUserId = req.user ? req.user.id : null;

    // Build query based on privacy and connection status
    let query = { user: userId };

    if (currentUserId) {
      // Check if current user is connected to the portfolio owner
      const portfolioOwner = await User.findById(userId);
      const isConnected = portfolioOwner && portfolioOwner.connections.includes(currentUserId);

      if (isConnected) {
        // Connected users can see both public and private portfolios
        query = { user: userId };
      } else {
        // Non-connected users can only see public portfolios
        query.privacy = "public";
      }
    } else {
      // Unauthenticated users can only see public portfolios
      query.privacy = "public";
    }

    const portfolios = await Portfolio.find(query)
=======
    const portfolios = await Portfolio.find({
      user: userId,
      privacy: "public",
    })
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
      .sort({ createdAt: -1 })
      .populate("user", "name username");

    res.json(portfolios);
  } catch (error) {
    console.error("Error fetching public portfolios:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

<<<<<<< HEAD
export const getLatestPortfolios = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const portfolios = await Portfolio.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "name username");

    res.json(portfolios);
  } catch (error) {
    console.error("Error fetching latest portfolios:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link, category, tags, privacy } = req.body;
=======
export const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link, category, tags, privacy, thumbnail } = req.body;
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d

    const portfolio = await Portfolio.findOne({ _id: id, user: req.user._id });

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio item not found" });
    }

<<<<<<< HEAD
    // Handle file uploads
    const thumbnail = req.files?.thumbnail ? req.files.thumbnail[0].filename : req.body.thumbnail || portfolio.thumbnail;
    const mediaFiles = req.files?.mediaFiles ? req.files.mediaFiles.map(file => file.filename) : portfolio.mediaFiles;

=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
    portfolio.title = title || portfolio.title;
    portfolio.description = description || portfolio.description;
    portfolio.link = link || portfolio.link;
    portfolio.category = category || portfolio.category;
    portfolio.tags = tags ? tags.split(",").map(tag => tag.trim()) : portfolio.tags;
    portfolio.privacy = privacy || portfolio.privacy;
<<<<<<< HEAD
    portfolio.thumbnail = thumbnail;
    portfolio.mediaFiles = mediaFiles;
=======
    portfolio.thumbnail = thumbnail || portfolio.thumbnail;
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d

    const updatedPortfolio = await portfolio.save();
    await updatedPortfolio.populate("user", "name username");

    res.json({
      message: "Portfolio item updated successfully",
      portfolio: updatedPortfolio,
    });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await Portfolio.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio item not found" });
    }

    res.json({ message: "Portfolio item deleted successfully" });
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
