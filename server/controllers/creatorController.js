import Portfolio from "../models/Portfolio.js";

export const getAllCreators = (req, res) => {
  res.send("All creators endpoint");
};

export const getCreatorProfile = (req, res) => {
  res.send(`Profile for creator ${req.params.id}`);
};

// Portfolio controller functions
export const createPortfolio = async (req, res) => {
  try {
    const { title, description, link, category, tags, privacy, thumbnail } = req.body;

    const portfolio = new Portfolio({
      user: req.user._id,
      title,
      description,
      link,
      category,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      privacy: privacy || "private",
      thumbnail,
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
    const portfolios = await Portfolio.find({
      user: userId,
      privacy: "public",
    })
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
    const { title, description, link, category, tags, privacy, thumbnail } = req.body;

    const portfolio = await Portfolio.findOne({ _id: id, user: req.user._id });

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio item not found" });
    }

    portfolio.title = title || portfolio.title;
    portfolio.description = description || portfolio.description;
    portfolio.link = link || portfolio.link;
    portfolio.category = category || portfolio.category;
    portfolio.tags = tags ? tags.split(",").map(tag => tag.trim()) : portfolio.tags;
    portfolio.privacy = privacy || portfolio.privacy;
    portfolio.thumbnail = thumbnail || portfolio.thumbnail;

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
