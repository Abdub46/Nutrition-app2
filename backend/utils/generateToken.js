const jwt = require('jsonwebtoken');

// tokenVersion is embedded so a token can be revoked server-side (logout,
// password change/reset) without needing a separate blacklist store - see
// models/User.js tokenVersion and middleware/authMiddleware.js protect().
const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign(
    { id, tokenVersion },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

module.exports = generateToken;

