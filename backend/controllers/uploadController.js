const asyncHandler = require('express-async-handler');
const streamifier = require('streamifier');
const { fromBuffer: fileTypeFromBuffer } = require('file-type');
const cloudinary = require('../config/cloudinary');
const { ALLOWED_IMAGE_MIME_TYPES } = require('../utils/allowedImageTypes');

const streamUpload = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

// @desc    Upload a single image to Cloudinary
// @route   POST /api/uploads?folder=articles|avatars|branding
// @access  Private (admin)
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file provided');
  }

  // middleware/uploadMiddleware.js already checked the client-declared
  // Content-Type, but that's just a header the client sent - it proves
  // nothing about what the file actually is. This sniffs the real file
  // signature from the file's own bytes and re-checks it against the same
  // allowlist, so a file that merely claims to be a PNG (wrong extension,
  // spoofed header, an SVG or script disguised as an image, etc.) can't get
  // through, and nothing unverified ever reaches Cloudinary.
  const detected = await fileTypeFromBuffer(req.file.buffer);

  if (!detected || !ALLOWED_IMAGE_MIME_TYPES.includes(detected.mime)) {
    res.status(400);
    throw new Error('This file does not appear to be a valid JPEG, PNG, WEBP, or GIF image');
  }

  const allowedFolders = ['articles', 'avatars', 'branding'];
  const folder = allowedFolders.includes(req.query.folder) ? req.query.folder : 'misc';

  const result = await streamUpload(req.file.buffer, `nutrition-app/${folder}`);

  res.json({ success: true, url: result.secure_url });
});

module.exports = { uploadImage };