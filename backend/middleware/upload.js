// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure 'uploads' folder exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      // Use username from the token, fallback to 'guest' if not available.
      const userid = req.user && req.user._id ? req.user._id.toString() : 'guest';
      // Build filename: username_date.extension
      const filename = `${userid}_${Date.now()}${path.extname(file.originalname)}`;
      cb(null, filename);
    }
  });
  
const upload = multer({ storage });

module.exports = upload;
