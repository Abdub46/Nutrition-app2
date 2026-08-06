const express = require('express');
const {
  getArticles,
  getArticleById,
  getFeaturedArticle,
  getAdminArticles,
  setFeaturedArticle,
  unsetFeaturedArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// IMPORTANT: these must be registered before /:id, otherwise Express would
// match "admin" / "featured" as the :id parameter on the public single-article route.
router.get('/admin/all', protect, authorize('admin', 'writer'), getAdminArticles);
router.get('/featured/current', getFeaturedArticle);
router.put('/featured/clear', protect, authorize('admin'), unsetFeaturedArticle);

router.get('/', getArticles);
router.get('/:id', getArticleById);
router.post('/', protect, authorize('admin', 'writer'), createArticle);
router.put('/:id', protect, authorize('admin', 'writer'), updateArticle);
// Featuring is admin-only, deliberately separate from the regular writer-facing
// create/update endpoints above - a writer can author an article but can't feature it.
router.put('/:id/feature', protect, authorize('admin'), setFeaturedArticle);
router.delete('/:id', protect, authorize('admin', 'writer'), deleteArticle);

module.exports = router;
