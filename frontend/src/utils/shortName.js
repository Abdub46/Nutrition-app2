// Shortens a full name down to "First Last" - drops any middle name(s) so a
// byline doesn't show three (or more) names. Leaves a one- or two-word name
// untouched.
export const shortName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return fullName.trim();
  return `${parts[0]} ${parts[parts.length - 1]}`;
};