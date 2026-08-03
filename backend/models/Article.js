const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    summary: { type: String, required: true, maxlength: 500 },
    content: { type: String, required: true }, // sanitized server-side with an HTML allowlist before saving
    featuredImage: { type: String, default: '' }, // URL (Cloudinary secure_url)
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ArticleCategory', default: null },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', default: null },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' }, // default keeps existing articles publicly visible
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // createdAt (preserved) / updatedAt (bumped on every edit) - "Last Modified Date"
);

module.exports = mongoose.model('Article', articleSchema);
