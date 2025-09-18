import validator from 'validator';

// Middleware to sanitize input data for authentication routes
export const sanitizeAuthInput = (req, res, next) => {
  try {
    // Sanitize email
    if (req.body.email) {
      req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        outlookdotcom_remove_subaddress: false,
        yahoo_remove_subaddress: false,
        icloud_remove_subaddress: false,
      });
    }

    // Sanitize username
    if (req.body.username) {
      req.body.username = validator.escape(req.body.username).trim().toLowerCase();
    }

    // Sanitize name
    if (req.body.name) {
      req.body.name = validator.escape(req.body.name).trim();
    }

    // Sanitize password (no trimming, as spaces might be intentional, but escape if needed)
    if (req.body.password) {
      req.body.password = validator.escape(req.body.password);
    }

    // Sanitize other fields if present
    if (req.body.specialization) {
      req.body.specialization = validator.escape(req.body.specialization).trim();
    }

    if (req.body.specializationDetails) {
      req.body.specializationDetails = validator.escape(req.body.specializationDetails).trim();
    }

    if (req.body.bio) {
      req.body.bio = validator.escape(req.body.bio).trim();
    }

    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    res.status(400).json({ message: 'Invalid input data' });
  }
};
