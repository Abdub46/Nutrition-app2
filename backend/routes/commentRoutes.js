const express = require('express');
const { deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET/POST for an article's comments live under /api/articles/:id/comments
// instead (see routes/articleRoutes.js) - deleting one isn't scoped to an
// article, so it gets its own top-level route here.
router.delete('/:id', protect, deleteComment);

module.exports = router;