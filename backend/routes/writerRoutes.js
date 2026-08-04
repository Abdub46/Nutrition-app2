const express = require('express');
const {
  getWriters, checkWriterEmail, createWriter, updateWriter, toggleWriterStatus, deleteWriter,
} = require('../controllers/writerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getWriters);
router.get('/check-email', checkWriterEmail);
router.post('/', createWriter);
router.put('/:id', updateWriter);
router.put('/:id/status', toggleWriterStatus);
router.delete('/:id', deleteWriter);

module.exports = router;