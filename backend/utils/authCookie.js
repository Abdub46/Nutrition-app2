// Matches generateToken.js's JWT expiry (30 days) - if that ever changes,
// update this too so the cookie doesn't outlive (or expire before) the token.
const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// The frontend (Vercel) proxies /api/* to this backend (Render) at the edge -
// see frontend/vercel.json - so from the browser's point of view every
// request, including this cookie being set, is same-origin. That means the
// cookie can stay SameSite=Lax always, which browsers' anti-tracking features
// (Safari ITP, Chrome's third-party-cookie restrictions, ad blockers, etc.)
// don't touch - Lax only affects genuinely cross-site requests.
//
// This used to be conditionally "none" in production, back when the browser
// talked to the Render domain directly (cross-site). That was fragile: it
// depended on SameSite=None being honored, which several browsers restrict
// or block outright, especially on desktop - the practical symptom was
// login working on some devices/browsers and silently failing on others. If
// you ever remove the Vercel proxy and go back to calling the backend
// directly cross-origin from the browser, you'll need "none" (+ secure)
// again for this specific cookie to be sent at all.
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
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