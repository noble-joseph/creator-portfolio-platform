import Portfolio from "../models/Portfolio.js";
import User from "../models/User.js";

export const getAllCreators = (req, res) => {
  res.send("All creators endpoint");
};

export const getCreatorProfile = (req, res) => {
  res.send(`Profile for creator ${req.params.id}`);
};

// Portfolio controller functions
export const createPortfolio = async (req, res) => {
  try {
    const { title, description, link, category, tags, privacy, mediaFiles } = req.body;
    const thumbnail = req.files?.thumbnail ? req.files.thumbnail[0].path : req.body.thumbnail || "";

    // Process mediaFiles - can be from form data or JSON
    let processedMediaFiles = [];
    if (req.files?.mediaFiles) {
      processedMediaFiles = req.files.mediaFiles.map(file => ({
        type: file.mimetype.split('/')[0],
        url: file.path,
        filename: file.originalname,
        metadata: { size: file.size, format: file.mimetype }
      }));
    } else if (mediaFiles && Array.isArray(mediaFiles)) {
      // Handle case where mediaFiles are sent as JSON (e.g., for updates without new files)
      processedMediaFiles = mediaFiles;
    }

    const portfolio = new Portfolio({
      user: req.user._id,
      title,
      description,
      link,
      category,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      privacy: privacy || "private",
      thumbnail,
      mediaFiles: processedMediaFiles,
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
      .sort({ createdAt: -1 })
      .populate("user", "name username");

    res.json(portfolios);
  } catch (error) {
    console.error("Error fetching public portfolios:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
    const { title, description, link, category, tags, privacy, mediaFiles } = req.body;

    const portfolio = await Portfolio.findOne({ _id: id, user: req.user._id });

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio item not found" });
    }

    // Handle file uploads
    const thumbnail = req.files?.thumbnail ? req.files.thumbnail[0].path : req.body.thumbnail || portfolio.thumbnail;

    // Process mediaFiles - can be from form data or JSON
    let processedMediaFiles = portfolio.mediaFiles; // Keep existing by default
    if (mediaFiles && Array.isArray(mediaFiles)) {
      processedMediaFiles = mediaFiles.map(file => ({
        type: file.type || 'image',
        url: file.url || (req.files?.mediaFiles ? req.files.mediaFiles.find(f => f.originalname === file.filename)?.path : file.filename) || '',
        filename: file.filename || '',
        metadata: file.metadata || {}
      }));
    } else if (req.files?.mediaFiles) {
      processedMediaFiles = req.files.mediaFiles.map(file => ({
        type: 'image', // Default to image, can be updated later
        url: file.path,
        filename: file.filename,
        metadata: {
          size: file.size,
          format: file.mimetype
        }
      }));
    }

    portfolio.title = title || portfolio.title;
    portfolio.description = description || portfolio.description;
    portfolio.link = link || portfolio.link;
    portfolio.category = category || portfolio.category;
    portfolio.tags = tags ? tags.split(",").map(tag => tag.trim()) : portfolio.tags;
    portfolio.privacy = privacy || portfolio.privacy;
    portfolio.thumbnail = thumbnail;
    portfolio.mediaFiles = processedMediaFiles;

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
