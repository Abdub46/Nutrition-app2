const mongoose = require('mongoose');

// One document per page view, recorded by the frontend on every route change
// (see frontend/src/utils/pageViewTracker.js). Powers the admin "Performance"
// analytics tab - visitor counts, most-visited pages, device usage, etc.
const pageViewSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, trim: true, maxlength: 300 },
    // A random ID the frontend generates once per browser tab (sessionStorage) -
    // lets us count distinct visitors/sessions without any personal data.
    sessionId: { type: String, required: true, index: true },
    device: { type: String, enum: ['Mobile', 'Tablet', 'Desktop'], default: 'Desktop' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

pageViewSchema.index({ createdAt: 1 });
pageViewSchema.index({ sessionId: 1, createdAt: 1 });

module.exports = mongoose.model('PageView', pageViewSchema);