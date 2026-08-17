const express = require('express');
const { submitWriterRequest } = require('../controllers/writerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Separate from routes/writerRoutes.js on purpose - that entire router is
// admin-only (router.use(protect, authorize('admin'))), but submitting a
// request needs to be open to any logged-in client, not just admins.
router.post('/', protect, submitWriterRequest);

module.exports = router;