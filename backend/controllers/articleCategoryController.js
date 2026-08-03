const asyncHandler = require('express-async-handler');
const ArticleCategory = require('../models/ArticleCategory');
const SubCategory = require('../models/SubCategory');
const Article = require('../models/Article');

const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// @desc    Get all article categories
// @route   GET /api/article-categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await ArticleCategory.find({ isDeleted: false }).sort({ name: 1 });
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
  const existing = await ArticleCategory.findOne({ slug, isDeleted: false });
  if (existing) {
    res.status(400);
    throw new Error('A category with this name already exists');
  }

  const category = await ArticleCategory.create({ name: name.trim(), slug });
  res.status(201).json({ success: true, category });
});

// @desc    Update a category name
// @route   PUT /api/article-categories/:id
// @access  Private (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const category = await ArticleCategory.findById(req.params.id);
  if (!category || category.isDeleted) {
    res.status(404);
    throw new Error('Category not found');
  }

  const { name } = req.body;
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Category name cannot be empty');
  }

  const slug = slugify(name);
  const duplicate = await ArticleCategory.findOne({ _id: { $ne: category._id }, slug, isDeleted: false });
  if (duplicate) {
    res.status(400);
    throw new Error('A category with this name already exists');
  }

  category.name = name.trim();
  category.slug = slug;
  await category.save();

  res.json({ success: true, category });
});

// @desc    Delete an article category (soft-delete if in use by articles or subcategories)
// @route   DELETE /api/article-categories/:id
// @access  Private (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await ArticleCategory.findById(req.params.id);
  if (!category || category.isDeleted) {
    res.status(404);
    throw new Error('Category not found');
  }

  const [articleCount, subcategoryCount] = await Promise.all([
    Article.countDocuments({ category: category._id }),
    SubCategory.countDocuments({ category: category._id, isDeleted: false }),
  ]);

  if (articleCount > 0 || subcategoryCount > 0) {
    category.isDeleted = true;
    await category.save();
    return res.json({
      success: true,
      message: 'Category is in use by existing articles or subcategories and has been archived (soft-deleted)',
    });
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };