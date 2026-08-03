const asyncHandler = require('express-async-handler');
const Article = require('../models/Article');
const { sanitizeArticleContent } = require('../utils/sanitizeContent');

const POPULATE_AUTHOR = 'fullName avatar bio';
const POPULATE_CATEGORY = 'name slug';
const POPULATE_SUBCATEGORY = 'name slug';

// @desc    Get all PUBLISHED articles (public card listing)
// @route   GET /api/articles
// @access  Public
const getArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({ status: 'Published' })
    .populate('author', POPULATE_AUTHOR)
    .populate('category', POPULATE_CATEGORY)
    .populate('subcategory', POPULATE_SUBCATEGORY)
    .sort({ publishedAt: -1 });
  res.json({ success: true, articles });
});

// @desc    Get single article (read more page) + related articles by same category
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id)
    .populate('author', POPULATE_AUTHOR)
    .populate('category', POPULATE_CATEGORY)
    .populate('subcategory', POPULATE_SUBCATEGORY);

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  let relatedArticles = [];
  if (article.category) {
    relatedArticles = await Article.find({
      _id: { $ne: article._id },
      category: article.category._id,
      status: 'Published',
    })
      .populate('category', POPULATE_CATEGORY)
      .sort({ publishedAt: -1 })
      .limit(3);
  }

  res.json({ success: true, article, relatedArticles });
});

// @desc    Admin/Writer: get articles for management (all statuses; writers see only their own)
// @route   GET /api/articles/admin/all
// @access  Private (admin, writer)
const getAdminArticles = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'writer' ? { author: req.user._id } : {};

  const articles = await Article.find(filter)
    .populate('author', POPULATE_AUTHOR)
    .populate('category', POPULATE_CATEGORY)
    .populate('subcategory', POPULATE_SUBCATEGORY)
    .sort({ updatedAt: -1 });

  res.json({ success: true, articles });
});

// @desc    Create article
// @route   POST /api/articles
// @access  Private (admin, writer)
const createArticle = asyncHandler(async (req, res) => {
  const { title, summary, content, featuredImage, publishedAt, category, subcategory, status } = req.body;

  if (!title || !summary || !content) {
    res.status(400);
    throw new Error('Title, summary and content are required');
  }
  if (title.length > 200) {
    res.status(400);
    throw new Error('Title is too long (max 200 characters)');
  }
  if (summary.length > 500) {
    res.status(400);
    throw new Error('Summary is too long (max 500 characters)');
  }

  const article = await Article.create({
    title,
    summary,
    content: sanitizeArticleContent(content),
    featuredImage,
    author: req.user._id,
    category: category || null,
    subcategory: subcategory || null,
    status: status === 'Draft' ? 'Draft' : 'Published',
    publishedAt: publishedAt || Date.now(),
  });

  const populated = await article.populate([
    { path: 'author', select: POPULATE_AUTHOR },
    { path: 'category', select: POPULATE_CATEGORY },
    { path: 'subcategory', select: POPULATE_SUBCATEGORY },
  ]);

  res.status(201).json({ success: true, article: populated });
});

// @desc    Update article (writers may only update their own)
// @route   PUT /api/articles/:id
// @access  Private (admin, writer - owner only)
const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  if (req.user.role === 'writer' && article.author?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only edit your own articles');
  }

  const { title, summary, content, featuredImage, publishedAt, category, subcategory, status } = req.body;
  if (title !== undefined) article.title = title;
  if (summary !== undefined) article.summary = summary;
  if (content !== undefined) article.content = sanitizeArticleContent(content);
  if (featuredImage !== undefined) article.featuredImage = featuredImage;
  if (publishedAt !== undefined) article.publishedAt = publishedAt;
  if (category !== undefined) article.category = category || null;
  if (subcategory !== undefined) article.subcategory = subcategory || null;
  if (status !== undefined) article.status = status === 'Draft' ? 'Draft' : 'Published';

  // updatedAt (timestamps: true) is bumped automatically by .save() below -
  // this is what the article page displays as "Last Modified Date". createdAt is untouched.
  await article.save();

  const populated = await article.populate([
    { path: 'author', select: POPULATE_AUTHOR },
    { path: 'category', select: POPULATE_CATEGORY },
    { path: 'subcategory', select: POPULATE_SUBCATEGORY },
  ]);

  res.json({ success: true, article: populated });
});

// @desc    Delete article (writers may only delete their own)
// @route   DELETE /api/articles/:id
// @access  Private (admin, writer - owner only)
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  if (req.user.role === 'writer' && article.author?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own articles');
  }

  await article.deleteOne();
  res.json({ success: true, message: 'Article deleted' });
});

module.exports = { getArticles, getArticleById, getAdminArticles, createArticle, updateArticle, deleteArticle };
