/**
 * Enforces a stronger password policy than the base client signup (min 6 chars),
 * used specifically for writer/staff accounts and the change-password flow.
 * Requires: at least 8 characters, one uppercase letter, one lowercase letter, one number.
 */
const isStrongPassword = (password) => {
  if (typeof password !== 'string' || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.';

module.exports = { isStrongPassword, STRONG_PASSWORD_MESSAGE };