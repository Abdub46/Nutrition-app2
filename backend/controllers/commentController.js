const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Article = require('../models/Article');
const { moderateComment } = require('../utils/commentFilter');

const POPULATE_USER = 'fullName avatar role';

// @desc    Get comments for an article
// @route   GET /api/articles/:id/comments
// @access  Public
const getArticleComments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid article id');
  }

  const comments = await Comment.find({ article: id, isHidden: false })
    .populate('user', POPULATE_USER)
    .sort({ createdAt: -1 });

  res.json({ success: true, comments });
});

// @desc    Add a comment to an article. Content is run through the moderation
//          pipeline (HTML/script stripping, suspicious-link check, profanity
//          filter) before it's ever saved - offending comments are rejected
//          with a clear reason and never reach the database.
// @route   POST /api/articles/:id/comments
// @access  Private (any authenticated user)
const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid article id');
  }

  const article = await Article.findById(id);
  if (!article || article.status !== 'Published') {
    res.status(404);
    throw new Error('Article not found');
  }

  const result = moderateComment(req.body.content);
  if (!result.ok) {
    res.status(400);
    throw new Error(result.reason);
  }

  const comment = await Comment.create({
    article: id,
    user: req.user._id,
    content: result.clean,
  });

  const populated = await comment.populate('user', POPULATE_USER);

  res.status(201).json({ success: true, comment: populated });
});

// @desc    Delete a comment (comment owner or admin only)
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const isOwner = comment.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only delete your own comments');
  }

  await comment.deleteOne();
  res.json({ success: true, message: 'Comment deleted' });
});

module.exports = { getArticleComments, addComment, deleteComment };