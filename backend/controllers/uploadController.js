const asyncHandler = require('express-async-handler');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

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

  const allowedFolders = ['articles', 'avatars', 'branding'];
  const folder = allowedFolders.includes(req.query.folder) ? req.query.folder : 'misc';

  const result = await streamUpload(req.file.buffer, `nutrition-app/${folder}`);

  res.json({ success: true, url: result.secure_url });
});

module.exports = { uploadImage };