const sanitizeHtml = require('sanitize-html');

/**
 * Comment moderation pipeline.
 *
 * Comments are always rendered as plain text on the frontend (never
 * dangerouslySetInnerHTML), but we still scrub and validate server-side so
 * nothing malicious, spammy, or abusive ever reaches the database at all.
 */

// Strip every tag/attribute - sanitize-html also discards the *contents* of
// dangerous tags (script, style, iframe, etc. are in its default nonTextTags
// list), so `<script>evil()</script>` becomes '' rather than leaking the
// script body out as plain text.
const stripAllHtml = (text) => sanitizeHtml(text || '', { allowedTags: [], allowedAttributes: {} }).trim();

// Raw-input check for injection markers, run BEFORE stripping, in case someone
// tries broken/partial markup to sneak an event handler or protocol through.
const INJECTION_PATTERN = /<\s*script|javascript:|data:text\/html|on\w+\s*=|<\s*iframe|<\s*object|<\s*embed/i;

// Executable/script file extensions commonly used to distribute malware via links
const SUSPICIOUS_EXTENSIONS = /\.(exe|bat|cmd|scr|vbs|js|jar|apk|msi|ps1|sh|dll)(\?|#|$)/i;

const containsSuspiciousLinks = (text) => {
  const urls = text.match(/https?:\/\/\S+/gi) || [];
  if (urls.length > 2) return true; // link-flooding is a common spam/malware-distribution signal
  return urls.some((url) => SUSPICIOUS_EXTENSIONS.test(url));
};

// --- Profanity / insult filter -------------------------------------------------
// Deliberately conservative wordlist (common English profanity + direct insults).
// Obfuscation-resistant: normalizes leetspeak substitutions, strips punctuation
// used as letter-spacers, and collapses repeated letters before matching.
const LEET_MAP = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' };

const normalize = (text) =>
  text
    .toLowerCase()
    .split('')
    .map((ch) => LEET_MAP[ch] || ch)
    .join('')
    .replace(/[^a-z\s]/g, '') // drop digits/punctuation used to break up words (f.u.c.k, a-s-s)
    .replace(/(.)\1{2,}/g, '$1$1'); // collapse stretched letters: "idiooooot" -> "idioot"

const PROFANITY_WORDS = [
  'fuck', 'shit', 'bitch', 'bastard', 'asshole', 'dumbass', 'jackass', 'dick', 'piss',
  'crap', 'douche', 'slut', 'whore', 'cunt', 'prick', 'twat', 'wanker', 'bollocks',
  'idiot', 'moron', 'imbecile', 'retard', 'retarded', 'stupid', 'dumb', 'loser', 'pathetic',
  'scum', 'trash', 'garbage', 'worthless', 'ugly', 'fatass', 'clown', 'freak',
  'nigger', 'nigga', 'fag', 'faggot', 'chink', 'spic', 'tranny', 'kike',
];

const containsProfanity = (text) => {
  const normalized = normalize(text);

  // Whole-word check first (low false-positive rate: "class" won't trip "ass"-style roots)
  if (PROFANITY_WORDS.some((word) => new RegExp(`\\b${word}\\b`).test(normalized))) return true;

  // Also check with spaces collapsed, to catch spaced-out evasion like "f u c k"
  // or "s.h.i.t" (punctuation is already stripped by `normalize` above, so only
  // whitespace-separated letters need collapsing here). Restricted to words of
  // 4+ letters to keep the false-positive rate low on this looser check.
  const collapsed = normalized.replace(/\s+/g, '');
  return PROFANITY_WORDS.some((word) => word.length >= 4 && collapsed.includes(word));
};

/**
 * Runs a raw comment string through the full moderation pipeline.
 * Returns { ok: true, clean } or { ok: false, reason }.
 */
const moderateComment = (rawText) => {
  if (typeof rawText !== 'string') {
    return { ok: false, reason: 'Comment content is required.' };
  }

  if (INJECTION_PATTERN.test(rawText)) {
    return { ok: false, reason: 'Comment contains disallowed content.' };
  }

  const clean = stripAllHtml(rawText);

  if (!clean) {
    return { ok: false, reason: 'Comment cannot be empty.' };
  }
  if (clean.length > 1000) {
    return { ok: false, reason: 'Comment is too long (max 1000 characters).' };
  }
  if (containsSuspiciousLinks(clean)) {
    return { ok: false, reason: 'Comment contains disallowed or suspicious links.' };
  }
  if (containsProfanity(clean)) {
    return { ok: false, reason: 'Your comment contains inappropriate or insulting language. Please revise it and try again.' };
  }

  return { ok: true, clean };
};

module.exports = { moderateComment };