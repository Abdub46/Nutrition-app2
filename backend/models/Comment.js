const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 }, // pre-moderated plain text only
    isHidden: { type: Boolean, default: false }, // soft-hide for admin moderation, preserves thread integrity
  },
  { timestamps: true }
);

// Public listing: Comment.find({ article, isHidden: false }).sort({ createdAt: -1 })
commentSchema.index({ article: 1, isHidden: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);