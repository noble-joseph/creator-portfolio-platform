import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import cloudinary from '../config/cloudnary.js';

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const params = {
      folder: 'creator-portfolio',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov', 'mp3', 'wav', 'pdf', 'doc', 'docx'],
    };

    if (file.mimetype.startsWith('image')) {
      params.resource_type = 'image';
      params.transformation = [{ width: 1000, height: 1000, crop: 'limit' }];
    } else if (file.mimetype.startsWith('audio')) {
      params.resource_type = 'video'; // Cloudinary treats audio as a video resource
    } else if (file.mimetype.startsWith('video')) {
      params.resource_type = 'video';
    } else {
      // For other file types like PDF, DOCX
      params.resource_type = 'raw';
    }

    return params;
  }
});

// File filter for different types
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    profilePhoto: /jpeg|jpg|png|gif/,
    coverPhoto: /jpeg|jpg|png|gif/,
    thumbnail: /jpeg|jpg|png|gif/,
    mediaFiles: /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|pdf|doc|docx/,
    portfolio: /jpeg|jpg|png|gif|mp3|wav/
  };

  const fieldName = file.fieldname;
  const regex = allowedTypes[fieldName];

  if (!regex) {
    return cb(new Error(`Invalid field name for upload: ${fieldName}`));
  }

  if (regex.test(path.extname(file.originalname).toLowerCase()) || regex.test(file.mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${fieldName}`));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Export specific upload middlewares
export const uploadProfilePhoto = upload.single('profilePhoto');
export const uploadCoverPhoto = upload.single('coverPhoto');
export const uploadThumbnail = upload.single('thumbnail');
export const uploadMediaFiles = upload.array('mediaFiles', 10); // Up to 10 files
export const uploadPortfolioMedia = upload.array('portfolio', 10);

// Combined upload for portfolio (thumbnail + media files)
export const uploadPortfolio = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'mediaFiles', maxCount: 10 }
]);
