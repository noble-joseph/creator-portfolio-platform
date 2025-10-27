import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
const sanitizeHTML = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Skip sanitization for specific fields that need to be preserved
        const fieldsToSkip = ['role', 'specialization', 'genre', 'experienceLevel'];
        if (!fieldsToSkip.includes(key)) {
          req.body[key] = DOMPurify.sanitize(req.body[key]);
        }
      }
    });
  }
  next();
};

// Sanitize auth input
const sanitizeAuthInput = (req, res, next) => {
  const fieldsToSanitize = ['name', 'email', 'username', 'bio', 'password'];
  const fieldsToSkip = ['role', 'specialization', 'genre', 'experienceLevel'];

  if (req.body) {
    fieldsToSanitize.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = validator.escape(req.body[field].trim());
      }
    });

    // Skip sanitization for specific fields that need to be preserved
    fieldsToSkip.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].trim();
      }
    });
  }
  next();
};

// Sanitize portfolio input
const sanitizePortfolioInput = (req, res, next) => {
  const fieldsToSanitize = ['title', 'description', 'category', 'tags'];
  
  if (req.body) {
    fieldsToSanitize.forEach(field => {
      if (req.body[field]) {
        if (typeof req.body[field] === 'string') {
          req.body[field] = DOMPurify.sanitize(req.body[field].trim());
        } else if (Array.isArray(req.body[field])) {
          req.body[field] = req.body[field].map(item => 
            typeof item === 'string' ? DOMPurify.sanitize(item.trim()) : item
          );
        }
      }
    });
  }
  next();
};

// Validate and sanitize email
const validateEmail = (req, res, next) => {
  if (req.body.email) {
    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    req.body.email = validator.normalizeEmail(req.body.email);
  }
  next();
};

// Validate and sanitize URL
const validateURL = (req, res, next) => {
  const urlFields = ['website', 'portfolio', 'socialMedia'];
  
  if (req.body) {
    urlFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        if (!validator.isURL(req.body[field], { require_protocol: true })) {
          return res.status(400).json({ error: `Invalid URL format for ${field}` });
        }
      }
    });
  }
  next();
};

// Sanitize file upload metadata
const sanitizeFileMetadata = (req, res, next) => {
  if (req.body) {
    const metadataFields = ['title', 'description', 'altText'];
    
    metadataFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = DOMPurify.sanitize(req.body[field].trim());
      }
    });
  }
  next();
};

// Default export
export default sanitizeHTML;

// Named exports
export {
  sanitizeHTML,
  sanitizeAuthInput,
  sanitizePortfolioInput,
  validateEmail,
  validateURL,
  sanitizeFileMetadata
};