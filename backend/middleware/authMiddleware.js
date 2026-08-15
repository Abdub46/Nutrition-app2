const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Verifies JWT and attaches the authenticated user to req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Cookie first (how the browser-based frontend authenticates now - see
  // utils/authCookie.js), falling back to a Bearer header for any non-browser
  // client (Postman, a future mobile app, etc.) that can't rely on cookies.
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error('Not authorized, user no longer exists');
  }

  if (user.isDeleted || user.isActive === false) {
    res.status(401);
    throw new Error(
      'This account has been deactivated. Please contact an administrator.'
    );
  }

  // Revocation check: logout and any password change/reset bump tokenVersion
  // (see models/User.js) - a token issued before that no longer matches and
  // is rejected here, even though it's still cryptographically valid and
  // unexpired. This is what makes "logout" and "change password" actually
  // invalidate the token, instead of just removing it client-side.
  if (user.tokenVersion !== decoded.tokenVersion) {
    res.status(401);
    throw new Error('Not authorized, session has been revoked');
  }

  req.user = user;
  next();
});

// Role-based authorization - never rely on hidden UI, always enforce server-side
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        'Forbidden: you do not have permission to perform this action'
      );
    }

    next();
  };
};

module.exports = { protect, authorize };

