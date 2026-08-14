const express = require('express');
const { trackPageView } = require('../controllers/analyticsController');

const router = express.Router();

// Public and unauthenticated on purpose - visitors browsing the site are
// often not logged in, and this only ever records a path + anonymous
// per-tab session id (see PageView model). Covered by the global apiLimiter
// mounted on /api in server.js.
router.post('/track', trackPageView);

module.exports = router;