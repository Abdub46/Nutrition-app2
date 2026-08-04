const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ArticleCategory', required: true, index: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A subcategory name must be unique within its parent category (duplicates across
// different categories are fine, e.g. "Snacks" could exist under two categories)
subCategorySchema.index({ category: 1, slug: 1 }, { unique: true });

// Public listing: find({ isDeleted: false, category? }).sort({ name: 1 })
subCategorySchema.index({ isDeleted: 1, category: 1, name: 1 });

module.exports = mongoose.model('SubCategory', subCategorySchema);