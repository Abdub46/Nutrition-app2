const asyncHandler = require('express-async-handler');

// Only the pages a crawler can actually reach without logging in - everything
// else (articles, dashboard, admin, etc.) sits behind ProtectedRoute/AdminRoute
// on the frontend and is disallowed in robots.txt, so listing those URLs here
// too would just produce "blocked by robots.txt" warnings in Search Console
// for no benefit. If article pages become publicly readable later, add their
// URLs here (and drop the /articles disallow in frontend/public/robots.txt).
const STATIC_PUBLIC_PATHS = ['/', '/login', '/signup', '/tools', '/how-to-use'];

// @desc    XML sitemap listing the app's public, indexable pages
// @route   GET /sitemap.xml
// @access  Public
const getSitemap = asyncHandler(async (req, res) => {
  const baseUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);

  const urlEntries = STATIC_PUBLIC_PATHS.map(
    (path) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

module.exports = { getSitemap };