const express = require('express');
const { getCategories, createCategory, deleteCategory } = require('../controllers/articleCategoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, authorize('admin'), createCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;