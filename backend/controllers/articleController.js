const asyncHandler = require('express-async-handler');
const Article = require('../models/Article');

const POPULATE_AUTHOR = 'fullName avatar';
const POPULATE_CATEGORY = 'name slug';

// @desc    Get all articles (card format)
// @route   GET /api/articles
// @access  Public
const getArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find()
    .populate('author', POPULATE_AUTHOR)
    .populate('category', POPULATE_CATEGORY)
    .sort({ publishedAt: -1 });
  res.json({ success: true, articles });
});

// @desc    Get single article (read more page) + related articles by same category
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id)
    .populate('author', POPULATE_AUTHOR)
    .populate('category', POPULATE_CATEGORY);

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  let relatedArticles = [];
  if (article.category) {
    relatedArticles = await Article.find({
      _id: { $ne: article._id },
      category: article.category._id,
    })
      .populate('category', POPULATE_CATEGORY)
      .sort({ publishedAt: -1 })
      .limit(3);
  }

  res.json({ success: true, article, relatedArticles });
});

// @desc    Create article
// @route   POST /api/articles
// @access  Private (admin)
const createArticle = asyncHandler(async (req, res) => {
  const { title, summary, content, featuredImage, publishedAt, category } = req.body;

  if (!title || !summary || !content) {
    res.status(400);
    throw new Error('Title, summary and content are required');
  }

  const article = await Article.create({
    title,
    summary,
    content,
    featuredImage,
    author: req.user._id,
    category: category || null,
    publishedAt: publishedAt || Date.now(),
  });

  const populated = await article.populate([
    { path: 'author', select: POPULATE_AUTHOR },
    { path: 'category', select: POPULATE_CATEGORY },
  ]);

  res.status(201).json({ success: true, article: populated });
});

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (admin)
const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  const { title, summary, content, featuredImage, publishedAt, category } = req.body;
  if (title !== undefined) article.title = title;
  if (summary !== undefined) article.summary = summary;
  if (content !== undefined) article.content = content;
  if (featuredImage !== undefined) article.featuredImage = featuredImage;
  if (publishedAt !== undefined) article.publishedAt = publishedAt;
  if (category !== undefined) article.category = category || null;

  // updatedAt (timestamps: true) is bumped automatically by .save() below -
  // this is what the article page displays as "Last Modified Date"
  await article.save();

  const populated = await article.populate([
    { path: 'author', select: POPULATE_AUTHOR },
    { path: 'category', select: POPULATE_CATEGORY },
  ]);

  res.json({ success: true, article: populated });
});

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (admin)
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }
  await article.deleteOne();
  res.json({ success: true, message: 'Article deleted' });
});

module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteArticle };
