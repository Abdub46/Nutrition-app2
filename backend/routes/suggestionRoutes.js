const express = require('express');
const { createSuggestion, getAllSuggestions } = require('../controllers/suggestionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Any logged-in user (client, writer, or admin) can send a suggestion
router.post('/', protect, createSuggestion);

// Admin-only: review submitted suggestions
router.get('/', protect, authorize('admin'), getAllSuggestions);

module.exports = router;