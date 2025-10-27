import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './errorMiddleware.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    return next(error);
  }
};

// Restrict to certain roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      if (currentUser) {
        req.user = currentUser;
      }
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Check if user owns resource or is admin
export const checkOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[paramName]);
      
      if (!resource) {
        return next(new AppError('Resource not found', 404));
      }

      // Check if user owns the resource or is admin
      if (resource.user && resource.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to perform this action', 403));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check if user is verified
export const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(new AppError('Please verify your account to access this feature', 403));
  }
  next();
};

// Check if user has completed profile
export const requireCompleteProfile = (req, res, next) => {
  const requiredFields = ['name', 'bio', 'profilePhoto'];
  const missingFields = requiredFields.filter(field => !req.user[field]);
  
  if (missingFields.length > 0) {
    return next(new AppError(`Please complete your profile. Missing: ${missingFields.join(', ')}`, 400));
  }
  next();
};