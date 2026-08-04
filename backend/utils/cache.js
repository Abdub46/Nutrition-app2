/**
 * Lightweight in-memory TTL cache for read-heavy, rarely-changing public GET
 * endpoints (site settings, banner, article/category listings). Deliberately
 * simple - a single Map with expiry timestamps - since the app runs as one
 * Render instance. If this ever scales to multiple instances sharing one
 * database, swap this for Redis so all instances see the same cache/invalidation.
 */
const store = new Map();

const get = (key) => {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
};

const set = (key, value, ttlMs) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

// Deletes one exact key, or (with { prefix: true }) every key starting with it -
// e.g. del('article:', { prefix: true }) clears every cached single-article lookup.
const del = (keyOrPrefix, { prefix = false } = {}) => {
  if (!prefix) {
    store.delete(keyOrPrefix);
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(keyOrPrefix)) store.delete(key);
  }
};

const clear = () => store.clear();

module.exports = { get, set, del, clear };