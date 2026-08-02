const express = require('express');
const { uploadImage } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('admin'), upload.single('file'), uploadImage);

module.exports = router;