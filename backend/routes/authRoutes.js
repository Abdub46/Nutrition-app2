const express = require('express');
const {
  signup,
  login,
  googleAuth,
  getMe,
  logout,
  completeProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/complete-profile', protect, completeProfile);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', authLimiter, resetPassword);

module.exports = router;
