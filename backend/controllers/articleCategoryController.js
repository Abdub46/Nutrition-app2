const asyncHandler = require('express-async-handler');
const ArticleCategory = require('../models/ArticleCategory');
const Article = require('../models/Article');

const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// @desc    Get all article categories
// @route   GET /api/article-categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await ArticleCategory.find().sort({ name: 1 });
  res.json({ success: true, categories });
});

// @desc    Create a new article category
// @route   POST /api/article-categories
// @access  Private (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Category name is required');
  }

  const slug = slugify(name);
  const existing = await ArticleCategory.findOne({ slug });
  if (existing) {
    res.status(400);
    throw new Error('A category with this name already exists');
  }

  const category = await ArticleCategory.create({ name: name.trim(), slug });
  res.status(201).json({ success: true, category });
});

// @desc    Delete an article category
// @route   DELETE /api/article-categories/:id
// @access  Private (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await ArticleCategory.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Un-set this category on any articles using it, rather than blocking deletion
  await Article.updateMany({ category: category._id }, { $set: { category: null } });
  await category.deleteOne();

  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, createCategory, deleteCategory };