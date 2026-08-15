// Single source of truth for which image types uploads accept - reused by
// both the first-pass (spoofable) header check in
// middleware/uploadMiddleware.js and the real magic-byte check in
// controllers/uploadController.js.
//
// Deliberately excludes image/svg+xml: SVG is XML and can carry an embedded
// <script> tag, so accepting it as a plain "image" opens a stored-XSS path
// if that file's URL is ever opened directly, embedded via <object>, or
// otherwise rendered outside a plain <img> tag.
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

module.exports = { ALLOWED_IMAGE_MIME_TYPES };