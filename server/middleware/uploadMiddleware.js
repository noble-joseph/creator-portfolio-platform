import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import cloudinary from '../config/cloudnary.js';

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'creator-portfolio', // Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov', 'mp3', 'wav', 'pdf', 'doc', 'docx'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // Optional: resize images
  },
});

// File filter for different types
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    profilePhoto: /jpeg|jpg|png|gif/,
    coverPhoto: /jpeg|jpg|png|gif/,
    thumbnail: /jpeg|jpg|png|gif/,
    mediaFiles: /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|pdf|doc|docx/
  };

  const fieldName = file.fieldname;
  const extname = allowedTypes[fieldName] ? allowedTypes[fieldName].test(path.extname(file.originalname).toLowerCase()) : false;
  const mimetype = allowedTypes[fieldName] ? allowedTypes[fieldName].test(file.mimetype) : false;

  if (mimetype && extname) {
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

// Combined upload for portfolio (thumbnail + media files)
export const uploadPortfolio = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'mediaFiles', maxCount: 10 }
]);
