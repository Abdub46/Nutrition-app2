const sanitizeHtml = require('sanitize-html');

// Block-level tags the rich-text editor's alignment buttons apply
// style="text-align: ..." to (execCommand targets whichever block tag wraps
// the current selection - p/div/heading/list item/blockquote).
const ALIGNABLE_TAGS = ['p', 'div', 'h2', 'h3', 'h4', 'blockquote', 'li'];

/**
 * Sanitizes article content (and summary) with an allowlist of tags/attributes -
 * preserves everything the rich-text editor toolbar produces (bold/italic/underline/
 * strikethrough, headings, alignment, lists, blockquotes, undo/redo is client-side
 * only and doesn't affect markup) plus the Button/Link Block/External Link snippets
 * inserted by the admin/writer editor toolbar, while stripping scripts, event
 * handlers, iframes, and anything else not explicitly permitted.
 */
const sanitizeArticleContent = (html) =>
  sanitizeHtml(html || '', {
    allowedTags: [
      'p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'ul', 'ol', 'li', 'a', 'h2', 'h3', 'h4', 'blockquote', 'img', 'span',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt'],
      span: ['class'],
      ...Object.fromEntries(ALIGNABLE_TAGS.map((tag) => [tag, ['style']])),
    },
    allowedStyles: {
      '*': {
        'text-align': [/^left$/, /^center$/, /^right$/, /^justify$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noreferrer' }, true),
    },
  });

module.exports = { sanitizeArticleContent };