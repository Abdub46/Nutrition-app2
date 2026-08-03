const express = require('express');
const {
  getArticles,
  getArticleById,
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// IMPORTANT: /admin/all must be registered before /:id, otherwise Express would
// match "admin" as an :id parameter on the public single-article route.
router.get('/admin/all', protect, authorize('admin', 'writer'), getAdminArticles);

router.get('/', getArticles);
router.get('/:id', getArticleById);
router.post('/', protect, authorize('admin', 'writer'), createArticle);
router.put('/:id', protect, authorize('admin', 'writer'), updateArticle);
router.delete('/:id', protect, authorize('admin', 'writer'), deleteArticle);

module.exports = router;
