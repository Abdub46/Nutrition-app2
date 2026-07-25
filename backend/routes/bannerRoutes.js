const express = require('express');
const { getBanner, updateBanner } = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getBanner);
router.put('/', protect, authorize('admin'), updateBanner);

module.exports = router;