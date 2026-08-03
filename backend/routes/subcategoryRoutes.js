const express = require('express');
const {
  getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory,
} = require('../controllers/subcategoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getSubcategories);
router.post('/', protect, authorize('admin'), createSubcategory);
router.put('/:id', protect, authorize('admin'), updateSubcategory);
router.delete('/:id', protect, authorize('admin'), deleteSubcategory);

module.exports = router;