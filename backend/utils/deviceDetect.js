// Lightweight device classification from a User-Agent string - no external
// dependency, just enough to bucket traffic into Mobile / Tablet / Desktop
// for the admin analytics dashboard's device usage chart.
const detectDevice = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|kindle|playbook|nexus 7|nexus 9|nexus 10/.test(ua)) return 'Tablet';
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua)) return 'Mobile';
  return 'Desktop';
};

module.exports = { detectDevice };