const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const BmiRecord = require('../models/BmiRecord');
const generateToken = require('../utils/generateToken');
const { calculateBMI, getBMICategory } = require('../utils/bmiUtils');
const { isValidKenyanPhone, isDOBValid, isHeightValid, isWeightValid } = require('../utils/validators');
const { isStrongPassword, STRONG_PASSWORD_MESSAGE } = require('../utils/passwordValidator');
const { sendEmail } = require('../services/emailService');
const { setAuthCookie, clearAuthCookie } = require('../utils/authCookie');

// Reused across requests - verifyIdToken() itself is stateless/per-call, this just
// avoids re-reading process.env.GOOGLE_CLIENT_ID on every login.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new client user
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    dateOfBirth,
    sex,
    occupation,
    county,
    residenceTown,
    height,
    weight,
    hasCurrentMedicalCondition,
    currentMedicalConditionDetails,
    hasFamilyMedicalHistory,
    familyMedicalHistoryDetails,
    balancedDietFrequency,
    fruitVegFrequency,
    fastFoodFrequency,
    mealsPerDay,
    physicalActivity,
    drugUse,
    drugUseDetails,
  } = req.body;

  // Required field checks
  const requiredFields = {
    fullName,
    email,
    password,
    phone,
    dateOfBirth,
    sex,
    occupation,
    county,
    residenceTown,
    height,
    weight,
    balancedDietFrequency,
    fruitVegFrequency,
    fastFoodFrequency,
    mealsPerDay,
  };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === '') {
      res.status(400);
      throw new Error(`${key} is required`);
    }
  }

  if (!isValidKenyanPhone(phone)) {
    res.status(400);
    throw new Error('Please provide a valid Kenyan phone number');
  }

  if (!isDOBValid(dateOfBirth)) {
    res.status(400);
    throw new Error('Date of birth cannot be in the future');
  }

  if (!isHeightValid(Number(height))) {
    res.status(400);
    throw new Error('Height must be between 50cm and 250cm');
  }

  if (!isWeightValid(Number(weight))) {
    res.status(400);
    throw new Error('Weight must be between 10kg and 400kg');
  }

  if (!isStrongPassword(password)) {
    res.status(400);
    throw new Error(STRONG_PASSWORD_MESSAGE);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('Email is already registered');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    dateOfBirth,
    sex,
    occupation,
    county,
    residenceTown,
    country: 'Kenya',
    height: Number(height),
    weight: Number(weight),
    hasCurrentMedicalCondition: !!hasCurrentMedicalCondition,
    currentMedicalConditionDetails: hasCurrentMedicalCondition ? currentMedicalConditionDetails : '',
    hasFamilyMedicalHistory: !!hasFamilyMedicalHistory,
    familyMedicalHistoryDetails: hasFamilyMedicalHistory ? familyMedicalHistoryDetails : '',
    balancedDietFrequency,
    fruitVegFrequency,
    fastFoodFrequency,
    mealsPerDay,
    physicalActivity: !!physicalActivity,
    drugUse: !!drugUse,
    drugUseDetails: drugUse ? drugUseDetails : '',
    role: 'client',
    // No verification flow exists for password signups - this account's real
    // owner is unconfirmed until they prove it via Google sign-in or a
    // password-reset email (see models/User.js for why that matters).
    isEmailVerified: false,
  });

  // Create the first BMI record so trend history starts at signup
  const bmi = calculateBMI(user.height, user.weight);
  await BmiRecord.create({
    user: user._id,
    height: user.height,
    weight: user.weight,
    bmi,
    category: getBMICategory(bmi),
  });

  const token = generateToken(user._id, user.tokenVersion);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    user: sanitizeUser(user),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.isDeleted || user.isActive === false) {
    res.status(403);
    throw new Error('This account has been deactivated. Please contact an administrator.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id, user.tokenVersion);
  setAuthCookie(res, token);

  res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

// @desc    Login or sign up using a Google ID token from Google Identity Services
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    res.status(400);
    throw new Error('Google credential is required');
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(500);
    throw new Error('Google sign-in is not configured on this server');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    res.status(401);
    throw new Error('Invalid Google credential');
  }

  if (!payload?.email || !payload.email_verified) {
    res.status(401);
    throw new Error('Google account email is not verified');
  }

  const email = payload.email.toLowerCase();
  let user = await User.findOne({ googleId: payload.sub });
  let accountReclaimed = false;

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      if (!user.isEmailVerified) {
        // SECURITY: this account's email was never actually confirmed as
        // belonging to whoever set it up (e.g. it could have been registered
        // by someone else using this person's email address before they ever
        // signed up themselves - "account pre-hijacking"). Google just proved,
        // via OAuth, that the person signing in right now genuinely owns this
        // email - which is stronger proof than an unverified local password
        // ever gave us. So we treat this as the real owner reclaiming the
        // account: invalidate whatever password is currently set (nobody
        // will know this random value) so a squatter's password stops
        // working immediately, and mark the email verified going forward.
        // The real owner can still set a new local password anytime via
        // "Forgot password".
        user.password = crypto.randomBytes(32).toString('hex');
        user.isEmailVerified = true;
        // Also revoke any token issued to whoever controlled this account
        // before - otherwise a squatter's still-valid token would keep
        // working even after losing the password above.
        user.tokenVersion += 1;
        accountReclaimed = true;
      }

      // Account already exists (e.g. originally signed up with a password) -
      // link Google as an additional login method. Google has already verified
      // this email address, so this link is safe to make automatically.
      user.googleId = payload.sub;
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
      await user.save();
    } else {
      // Brand new account. Google only gives us name/email/picture, so the rest
      // of the nutrition profile is collected afterwards via completeProfile().
      user = await User.create({
        fullName: payload.name || email.split('@')[0],
        email,
        googleId: payload.sub,
        authProvider: 'google',
        avatar: payload.picture || '',
        role: 'client',
        profileComplete: false,
        isEmailVerified: true, // Google just verified it as part of this OAuth exchange
      });
    }
  }

  if (user.isDeleted || user.isActive === false) {
    res.status(403);
    throw new Error('This account has been deactivated. Please contact an administrator.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id, user.tokenVersion);
  setAuthCookie(res, token);

  res.json({
    success: true,
    user: sanitizeUser(user),
    accountReclaimed,
  });
});

// @desc    Get current logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

// @desc    Clear the auth cookie and revoke the token that was in it. The
//          token itself is httpOnly, so client-side JS can't delete it
//          directly - this is the only way to actually log out.
// @route   POST /api/auth/logout
// @access  Private (needs a valid token to know whose session to revoke)
const logout = asyncHandler(async (req, res) => {
  // Bumping tokenVersion invalidates this token immediately, server-side -
  // without it, "logout" only ever removed the cookie client-side, and a
  // copy of the token (stolen via XSS, or just sitting on an old device)
  // would keep working until it expired on its own, up to 30 days later.
  //
  // Note: since there's only one tokenVersion per account (not one per
  // device/session), this logs the account out everywhere, not just this
  // browser - a deliberate simplicity trade-off given the app doesn't track
  // individual sessions. Worth revisiting if multi-device "log out this
  // device only" ever becomes a requirement.
  req.user.tokenVersion += 1;
  await req.user.save({ validateBeforeSave: false });

  clearAuthCookie(res);
  res.json({ success: true });
});

// @desc    Fill in the nutrition profile fields Google sign-up doesn't collect
//          (phone, DOB, body measurements, medical/dietary/lifestyle info)
// @route   PUT /api/auth/complete-profile
// @access  Private
const completeProfile = asyncHandler(async (req, res) => {
  const {
    phone,
    dateOfBirth,
    sex,
    occupation,
    county,
    residenceTown,
    height,
    weight,
    hasCurrentMedicalCondition,
    currentMedicalConditionDetails,
    hasFamilyMedicalHistory,
    familyMedicalHistoryDetails,
    balancedDietFrequency,
    fruitVegFrequency,
    fastFoodFrequency,
    mealsPerDay,
    physicalActivity,
    drugUse,
    drugUseDetails,
  } = req.body;

  const requiredFields = {
    phone,
    dateOfBirth,
    sex,
    occupation,
    county,
    residenceTown,
    height,
    weight,
    balancedDietFrequency,
    fruitVegFrequency,
    fastFoodFrequency,
    mealsPerDay,
  };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === '') {
      res.status(400);
      throw new Error(`${key} is required`);
    }
  }

  if (!isValidKenyanPhone(phone)) {
    res.status(400);
    throw new Error('Please provide a valid Kenyan phone number');
  }
  if (!isDOBValid(dateOfBirth)) {
    res.status(400);
    throw new Error('Date of birth cannot be in the future');
  }
  if (!isHeightValid(Number(height))) {
    res.status(400);
    throw new Error('Height must be between 50cm and 250cm');
  }
  if (!isWeightValid(Number(weight))) {
    res.status(400);
    throw new Error('Weight must be between 10kg and 400kg');
  }

  const user = req.user;
  user.phone = phone;
  user.dateOfBirth = dateOfBirth;
  user.sex = sex;
  user.occupation = occupation;
  user.county = county;
  user.residenceTown = residenceTown;
  user.height = Number(height);
  user.weight = Number(weight);
  user.hasCurrentMedicalCondition = !!hasCurrentMedicalCondition;
  user.currentMedicalConditionDetails = hasCurrentMedicalCondition ? currentMedicalConditionDetails : '';
  user.hasFamilyMedicalHistory = !!hasFamilyMedicalHistory;
  user.familyMedicalHistoryDetails = hasFamilyMedicalHistory ? familyMedicalHistoryDetails : '';
  user.balancedDietFrequency = balancedDietFrequency;
  user.fruitVegFrequency = fruitVegFrequency;
  user.fastFoodFrequency = fastFoodFrequency;
  user.mealsPerDay = mealsPerDay;
  user.physicalActivity = !!physicalActivity;
  user.drugUse = !!drugUse;
  user.drugUseDetails = drugUse ? drugUseDetails : '';
  user.profileComplete = true;

  await user.save();

  // Create the first BMI record now that height/weight are known, mirroring what
  // signup() does for password-based accounts - only if one doesn't exist yet,
  // since re-submitting this form shouldn't create duplicate history entries.
  const existingBmiRecord = await BmiRecord.findOne({ user: user._id });
  if (!existingBmiRecord) {
    const bmi = calculateBMI(user.height, user.weight);
    await BmiRecord.create({
      user: user._id,
      height: user.height,
      weight: user.weight,
      bmi,
      category: getBMICategory(bmi),
    });
  }

  res.json({ success: true, user: sanitizeUser(user) });
});

// @desc    Forgot password - generate reset token & email it
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  // Always respond the same way to avoid leaking which emails are registered
  const genericResponse = {
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  };

  if (!user) return res.json(genericResponse);

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Hello ${user.fullName},</p><p>You requested a password reset. Click the link below to set a new password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent, please try again later');
  }

  res.json(genericResponse);
});

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || !isStrongPassword(password)) {
    res.status(400);
    throw new Error(STRONG_PASSWORD_MESSAGE);
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    res.status(400);
    throw new Error('Reset token is invalid or has expired');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // Completing a reset via the emailed token proves they control this inbox -
  // same reasoning as the Google sign-in case in googleAuth() above.
  user.isEmailVerified = true;
  // Revoke any previously issued token (including a possibly stolen one) -
  // the fresh token generated right below carries the new tokenVersion, so
  // this session stays logged in while every other one is kicked out.
  user.tokenVersion += 1;
  await user.save();

  const token = generateToken(user._id, user.tokenVersion);
  setAuthCookie(res, token);

  res.json({
    success: true,
    message: 'Password has been reset successfully',
  });
});

// Remove sensitive fields before sending user object to client
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = { signup, login, googleAuth, getMe, logout, completeProfile, forgotPassword, resetPassword };