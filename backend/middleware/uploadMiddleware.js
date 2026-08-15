const multer = require('multer');
const { ALLOWED_IMAGE_MIME_TYPES } = require('../utils/allowedImageTypes');

const storage = multer.memoryStorage();

// This only checks the client-declared Content-Type header for the file part -
// that header is set by the browser/client and is trivially spoofable, so
// it's just a cheap first-pass reject. The check that actually matters (real
// file signature, sniffed from the bytes themselves) happens afterwards, in
// controllers/uploadController.js, since the full buffer isn't available yet
// at this point in the multer stream.
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;