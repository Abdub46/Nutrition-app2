const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    featuredImage: { type: String, default: '' }, // URL (Cloudinary secure_url)
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ArticleCategory', default: null },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // createdAt/updatedAt - updatedAt doubles as "Last Modified Date"
);

module.exports = mongoose.model('Article', articleSchema);
