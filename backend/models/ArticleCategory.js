const mongoose = require('mongoose');

const articleCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isDeleted: { type: Boolean, default: false }, // soft-deleted if referenced by existing articles/subcategories
  },
  { timestamps: true }
);

module.exports = mongoose.model('ArticleCategory', articleCategorySchema);