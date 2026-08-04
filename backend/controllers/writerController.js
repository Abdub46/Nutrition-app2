const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Article = require('../models/Article');
const { isStrongPassword, STRONG_PASSWORD_MESSAGE } = require('../utils/passwordValidator');

// @desc    Get all writers with published article counts
// @route   GET /api/writers
// @access  Private (admin)
const getWriters = asyncHandler(async (req, res) => {
  const writers = await User.find({ role: 'writer', isDeleted: false }).sort({ createdAt: -1 });

  const shaped = await Promise.all(
    writers.map(async (w) => {
      const publishedCount = await Article.countDocuments({ author: w._id, status: 'Published' });
      return {
        _id: w._id,
        fullName: w.fullName,
        email: w.email,
        avatar: w.avatar,
        bio: w.bio,
        qualification: w.qualification,
        isActive: w.isActive,
        publishedArticleCount: publishedCount,
        createdAt: w.createdAt,
        lastLogin: w.lastLogin,
      };
    })
  );

  res.json({ success: true, writers: shaped });
});

// @desc    Check whether an email belongs to an existing account before adding a writer,
//          so the admin knows upfront whether this will create a new account or upgrade one
// @route   GET /api/writers/check-email?email=...
// @access  Private (admin)
const checkWriterEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const existing = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

  if (!existing) {
    return res.json({ exists: false });
  }

  if (existing.role === 'writer') {
    return res.json({ exists: true, eligible: false, reason: 'This person is already a writer' });
  }

  if (existing.role === 'admin') {
    return res.json({ exists: true, eligible: false, reason: 'This is an admin account and cannot be made a writer' });
  }

  res.json({
    exists: true,
    eligible: true,
    user: { fullName: existing.fullName, email: existing.email },
  });
});

// @desc    Add a writer - upgrades an existing client account in place (keeping their
//          client-side access and data) if the email matches one, otherwise creates a
//          brand new staff account
// @route   POST /api/writers
// @access  Private (admin)
const createWriter = asyncHandler(async (req, res) => {
  const { email, qualification, firstName, lastName, tempPassword } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  if (!qualification || !['Nutritionist', 'Dietitian'].includes(qualification)) {
    res.status(400);
    throw new Error('Please specify whether this person is a Nutritionist or a Dietitian');
  }

  const existing = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

  if (existing) {
    if (existing.role === 'writer') {
      res.status(400);
      throw new Error('This user is already a writer');
    }
    if (existing.role === 'admin') {
      res.status(400);
      throw new Error('Cannot convert an admin account to a writer');
    }

    // Upgrade the existing client account in place - fullName, password, and all of
    // their client-side data (BMI history, appointments, etc.) are left untouched.
    existing.role = 'writer';
    existing.qualification = qualification;
    existing.isActive = true;
    existing.createdBy = req.user._id;
    await existing.save();

    return res.status(200).json({
      success: true,
      upgraded: true,
      writer: {
        _id: existing._id,
        fullName: existing.fullName,
        email: existing.email,
        qualification: existing.qualification,
        isActive: existing.isActive,
        createdAt: existing.createdAt,
      },
    });
  }

  // No existing account with this email - create a brand new staff account
  if (!firstName || !lastName || !tempPassword) {
    res.status(400);
    throw new Error('First name, last name, and a temporary password are required for a new account');
  }

  if (!isStrongPassword(tempPassword)) {
    res.status(400);
    throw new Error(STRONG_PASSWORD_MESSAGE);
  }

  const writer = await User.create({
    fullName: `${firstName.trim()} ${lastName.trim()}`,
    email: email.toLowerCase(),
    password: tempPassword,
    role: 'writer',
    qualification,
    isActive: true,
    mustChangePassword: true,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    upgraded: false,
    writer: {
      _id: writer._id,
      fullName: writer.fullName,
      email: writer.email,
      qualification: writer.qualification,
      isActive: writer.isActive,
      createdAt: writer.createdAt,
    },
  });
});

// @desc    Update writer's basic info
// @route   PUT /api/writers/:id
// @access  Private (admin)
const updateWriter = asyncHandler(async (req, res) => {
  const writer = await User.findOne({ _id: req.params.id, role: 'writer', isDeleted: false });
  if (!writer) {
    res.status(404);
    throw new Error('Writer not found');
  }

  const { fullName, email, bio, avatar } = req.body;
  if (fullName !== undefined) writer.fullName = fullName;
  if (bio !== undefined) writer.bio = bio;
  if (avatar !== undefined) writer.avatar = avatar;
  if (email !== undefined && email.toLowerCase() !== writer.email) {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400);
      throw new Error('A user with this email already exists');
    }
    writer.email = email.toLowerCase();
  }

  await writer.save();
  res.json({ success: true, writer });
});

// @desc    Toggle a writer's active/inactive status
// @route   PUT /api/writers/:id/status
// @access  Private (admin)
const toggleWriterStatus = asyncHandler(async (req, res) => {
  const writer = await User.findOne({ _id: req.params.id, role: 'writer', isDeleted: false });
  if (!writer) {
    res.status(404);
    throw new Error('Writer not found');
  }

  writer.isActive = !writer.isActive;
  await writer.save();

  res.json({ success: true, isActive: writer.isActive });
});

// @desc    Soft-delete a writer (preserves their existing articles' authorship)
// @route   DELETE /api/writers/:id
// @access  Private (admin)
const deleteWriter = asyncHandler(async (req, res) => {
  const writer = await User.findOne({ _id: req.params.id, role: 'writer', isDeleted: false });
  if (!writer) {
    res.status(404);
    throw new Error('Writer not found');
  }

  writer.isDeleted = true;
  writer.isActive = false;
  writer.deletedAt = new Date();
  await writer.save();

  res.json({ success: true, message: 'Writer removed' });
});

module.exports = { getWriters, checkWriterEmail, createWriter, updateWriter, toggleWriterStatus, deleteWriter };