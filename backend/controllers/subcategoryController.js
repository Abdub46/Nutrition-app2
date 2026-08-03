const asyncHandler = require('express-async-handler');
const SubCategory = require('../models/SubCategory');
const Article = require('../models/Article');

const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// @desc    Get subcategories, optionally filtered by parent category
// @route   GET /api/subcategories?category=<id>
// @access  Public
const getSubcategories = asyncHandler(async (req, res) => {
  const filter = { isDeleted: false };
  if (req.query.category) filter.category = req.query.category;

  const subcategories = await SubCategory.find(filter).sort({ name: 1 });
  res.json({ success: true, subcategories });
});

// @desc    Create a subcategory under a parent category
// @route   POST /api/subcategories
// @access  Private (admin)
const createSubcategory = asyncHandler(async (req, res) => {
  const { name, category } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Subcategory name is required');
  }
  if (!category) {
    res.status(400);
    throw new Error('A parent category is required');
  }

  const slug = slugify(name);
  const existing = await SubCategory.findOne({ category, slug, isDeleted: false });
  if (existing) {
    res.status(400);
    throw new Error('This subcategory already exists under the selected category');
  }

  const subcategory = await SubCategory.create({ name: name.trim(), slug, category });
  res.status(201).json({ success: true, subcategory });
});

// @desc    Update a subcategory
// @route   PUT /api/subcategories/:id
// @access  Private (admin)
const updateSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await SubCategory.findById(req.params.id);
  if (!subcategory || subcategory.isDeleted) {
    res.status(404);
    throw new Error('Subcategory not found');
  }

  const { name } = req.body;
  if (name !== undefined) {
    if (!name.trim()) {
      res.status(400);
      throw new Error('Subcategory name cannot be empty');
    }
    const slug = slugify(name);
    const duplicate = await SubCategory.findOne({
      _id: { $ne: subcategory._id },
      category: subcategory.category,
      slug,
      isDeleted: false,
    });
    if (duplicate) {
      res.status(400);
      throw new Error('This subcategory already exists under the selected category');
    }
    subcategory.name = name.trim();
    subcategory.slug = slug;
  }

  await subcategory.save();
  res.json({ success: true, subcategory });
});

// @desc    Delete a subcategory (soft-delete if any articles use it)
// @route   DELETE /api/subcategories/:id
// @access  Private (admin)
const deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await SubCategory.findById(req.params.id);
  if (!subcategory || subcategory.isDeleted) {
    res.status(404);
    throw new Error('Subcategory not found');
  }

  const inUse = await Article.exists({ subcategory: subcategory._id });
  if (inUse) {
    subcategory.isDeleted = true;
    await subcategory.save();
    return res.json({ success: true, message: 'Subcategory is in use by existing articles and has been archived (soft-deleted)' });
  }

  await subcategory.deleteOne();
  res.json({ success: true, message: 'Subcategory deleted' });
});

module.exports = { getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory };