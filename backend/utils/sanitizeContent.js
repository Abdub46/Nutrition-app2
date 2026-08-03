const sanitizeHtml = require('sanitize-html');

/**
 * Sanitizes article content with an allowlist of tags/attributes - preserves the
 * Button/Link Block/External Link snippets inserted by the admin/writer editor
 * toolbar, while stripping scripts, event handlers, iframes, and anything else
 * not explicitly permitted.
 */
const sanitizeArticleContent = (html) =>
  sanitizeHtml(html || '', {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'h4', 'blockquote', 'img', 'span'],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt'],
      span: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noreferrer' }, true),
    },
  });

module.exports = { sanitizeArticleContent };