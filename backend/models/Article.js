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

// Public listing: Article.find({ status: 'Published' }).sort({ publishedAt: -1 })
articleSchema.index({ status: 1, publishedAt: -1 });
// Related-articles lookup: same category, published, excluding the current article
articleSchema.index({ category: 1, status: 1, publishedAt: -1 });
// Admin/writer management listing, and a writer's own articles specifically
articleSchema.index({ author: 1, updatedAt: -1 });

module.exports = mongoose.model('Article', articleSchema);
