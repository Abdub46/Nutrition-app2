const asyncHandler = require('express-async-handler');
const Suggestion = require('../models/Suggestion');

// @desc    Submit an app improvement suggestion (email is taken from the logged-in account)
// @route   POST /api/suggestions
// @access  Private
const createSuggestion = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400);
    throw new Error('Please write a message before sending');
  }

  if (message.trim().length > 2000) {
    res.status(400);
    throw new Error('Message is too long (max 2000 characters)');
  }

  const suggestion = await Suggestion.create({
    user: req.user._id,
    email: req.user.email,
    message: message.trim(),
  });

  res.status(201).json({ success: true, message: 'Thank you! Your suggestion has been sent.', suggestion });
});

// @desc    Get all submitted suggestions (admin)
// @route   GET /api/suggestions
// @access  Private (admin)
const getAllSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await Suggestion.find().sort({ createdAt: -1 });
  res.json({ success: true, suggestions });
});

module.exports = { createSuggestion, getAllSuggestions };