// Matches generateToken.js's JWT expiry (30 days) - if that ever changes,
// update this too so the cookie doesn't outlive (or expire before) the token.
const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// Cross-site cookies (frontend and backend on different domains - e.g. Vercel
// + Render) require SameSite=None, and browsers only honor SameSite=None when
// Secure is also set - which in turn requires HTTPS. That's fine in production
// (both are HTTPS) but breaks on plain http://localhost in dev, so this only
// switches on in production; in dev, Lax + non-secure works fine since the
// frontend and backend both live under "localhost" regardless of port.
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
});

// Sets the JWT as an httpOnly cookie instead of returning it in the JSON body -
// keeps it out of reach of JS (and therefore XSS) entirely, unlike localStorage.
const setAuthCookie = (res, token) => {
  res.cookie('token', token, { ...cookieOptions(), maxAge: TOKEN_MAX_AGE_MS });
};

// Must be called with the exact same options used to set the cookie, or
// browsers won't recognize it as the same cookie to clear.
const clearAuthCookie = (res) => {
  res.clearCookie('token', cookieOptions());
};

module.exports = { setAuthCookie, clearAuthCookie };