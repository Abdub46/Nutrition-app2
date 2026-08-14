// Strips HTML tags for places that need a short plain-text preview (card
// summaries, excerpts) rather than full rich-text rendering - summary is
// now edited with the same rich-text editor as content, but the compact
// card/list spots that display it are too small to render headings, lists,
// etc. well, so they fall back to plain text here.
export const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();