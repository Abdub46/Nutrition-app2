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
        isActive: w.isActive,
        publishedArticleCount: publishedCount,
        createdAt: w.createdAt,
        lastLogin: w.lastLogin,
      };
    })
  );

  res.json({ success: true, writers: shaped });
});

// @desc    Create a new writer account
// @route   POST /api/writers
// @access  Private (admin)
const createWriter = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, tempPassword } = req.body;

  if (!firstName || !lastName || !email || !tempPassword) {
    res.status(400);
    throw new Error('First name, last name, email, and temporary password are all required');
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  if (!isStrongPassword(tempPassword)) {
    res.status(400);
    throw new Error(STRONG_PASSWORD_MESSAGE);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const writer = await User.create({
    fullName: `${firstName.trim()} ${lastName.trim()}`,
    email: email.toLowerCase(),
    password: tempPassword,
    role: 'writer',
    isActive: true,
    mustChangePassword: true,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    writer: {
      _id: writer._id,
      fullName: writer.fullName,
      email: writer.email,
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

module.exports = { getWriters, createWriter, updateWriter, toggleWriterStatus, deleteWriter };