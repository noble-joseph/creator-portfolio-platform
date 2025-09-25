import User from "../models/User.js";

const optionalAuth = async (req, res, next) => {
  if (req.session && req.session.user) {
    try {
      req.user = await User.findById(req.session.user._id).select("-password");

      if (!req.user) {
        req.user = null;
      }
    } catch (error) {
      // Invalid session, set req.user to null
      req.user = null;
    }
  } else {
    req.user = null;
  }

  return next();
};

export default optionalAuth;
