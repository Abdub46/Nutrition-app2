const mongoose = require('mongoose');

const articleCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isDeleted: { type: Boolean, default: false }, // soft-deleted if referenced by existing articles/subcategories
  },
  { timestamps: true }
);

// Public listing (isDeleted: false, sorted by name) and the slug-uniqueness checks
// (findOne({ slug, isDeleted: false })) done on create/update
articleCategorySchema.index({ isDeleted: 1, name: 1 });
articleCategorySchema.index({ slug: 1, isDeleted: 1 });

module.exports = mongoose.model('ArticleCategory', articleCategorySchema);