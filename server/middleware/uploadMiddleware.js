import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
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
