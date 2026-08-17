const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Article = require('../models/Article');

// @desc    Get all writers (accepted) plus any pending/rejected writer requests,
//          so the admin can review and act on all three from one page
// @route   GET /api/writers
// @access  Private (admin)
const getWriters = asyncHandler(async (req, res) => {
  const writers = await User.find({
    isDeleted: false,
    $or: [{ role: 'writer' }, { writerRequestStatus: { $in: ['Pending', 'Rejected'] } }],
  }).sort({ createdAt: -1 });

  const shaped = await Promise.all(
    writers.map(async (w) => {
      const publishedCount = w.role === 'writer' ? await Article.countDocuments({ author: w._id, status: 'Published' }) : 0;
      return {
        _id: w._id,
        fullName: w.fullName,
        email: w.email,
        avatar: w.avatar,
        bio: w.bio,
        qualification: w.qualification,
        isActive: w.isActive,
        // Admin-added writers (the older direct-add flow below) never set
        // writerRequestStatus - treat any actual writer without one as Accepted.
        status: w.writerRequestStatus || (w.role === 'writer' ? 'Accepted' : 'Pending'),
        publishedArticleCount: publishedCount,
        createdAt: w.createdAt,
        lastLogin: w.lastLogin,
      };
    })
  );

  res.json({ success: true, writers: shaped });
});

// @desc    Submit a self-service request to become a writer - collects just a
//          name and optional bio (the account's existing, already-verified
//          email is used as-is). Shows up as "Pending" on the admin Writers
//          page until reviewed.
// @route   POST /api/writer-requests
// @access  Private (any logged-in non-admin, non-writer account)
const submitWriterRequest = asyncHandler(async (req, res) => {
  const { fullName, bio, qualification } = req.body;

  if (!fullName || !fullName.trim()) {
    res.status(400);
    throw new Error('Please provide your name');
  }
  if (!qualification || !['Nutritionist', 'Dietitian'].includes(qualification)) {
    res.status(400);
    throw new Error('Please select whether you are a Nutritionist or a Dietitian');
  }
  if (bio && bio.length > 500) {
    res.status(400);
    throw new Error('Bio is too long (max 500 characters)');
  }

  if (req.user.role === 'admin') {
    res.status(400);
    throw new Error('Admin accounts cannot request writer access');
  }
  if (req.user.role === 'writer') {
    res.status(400);
    throw new Error("You're already a writer");
  }

  req.user.fullName = fullName.trim();
  req.user.bio = bio ? bio.trim() : '';
  // Not yet enforced by the schema (qualification is only required once role
  // becomes 'writer'), but stored now so the admin's accept step - see
  // reviewWriterRequest() - can be pre-filled with what the applicant claimed,
  // rather than starting blank.
  req.user.qualification = qualification;
  // Allows a previously rejected applicant to re-apply by submitting again.
  req.user.writerRequestStatus = 'Pending';
  await req.user.save();

  res.status(201).json({
    success: true,
    message: 'Your request has been submitted for review.',
    status: req.user.writerRequestStatus,
  });
});

// @desc    Accept, reject, or reset a writer request/an existing writer's access.
//          Accepting requires a qualification (same requirement as the direct-add
//          flow below) and grants the 'writer' role; rejecting (including on an
//          already-accepted writer, to revoke access) sets the role back to 'client'.
// @route   PUT /api/writers/:id/review
// @access  Private (admin)
const reviewWriterRequest = asyncHandler(async (req, res) => {
  const { status, qualification } = req.body;

  if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const user = await User.findOne({ _id: req.params.id, isDeleted: false });
  if (!user || (!user.writerRequestStatus && user.role !== 'writer')) {
    res.status(404);
    throw new Error('Writer request not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot change writer status for an admin account');
  }

  if (status === 'Accepted') {
    if (!qualification || !['Nutritionist', 'Dietitian'].includes(qualification)) {
      res.status(400);
      throw new Error('Please specify whether this person is a Nutritionist or a Dietitian');
    }
    user.role = 'writer';
    user.qualification = qualification;
    user.isActive = true;
    user.createdBy = req.user._id;
  } else {
    // Rejected or reset to Pending - neither should leave them with writer access.
    user.role = 'client';
  }
  user.writerRequestStatus = status;

  await user.save();

  res.json({
    success: true,
    writer: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      qualification: user.qualification,
      status: user.writerRequestStatus,
    },
  });
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
//          client-side access and data), found via the email-check step
// @route   POST /api/writers
// @access  Private (admin)
const createWriter = asyncHandler(async (req, res) => {
  const { email, qualification } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  if (!qualification || !['Nutritionist', 'Dietitian'].includes(qualification)) {
    res.status(400);
    throw new Error('Please specify whether this person is a Nutritionist or a Dietitian');
  }

  const existing = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

  if (!existing) {
    res.status(404);
    throw new Error('No existing account found for this email. The person must sign up as a client first before being made a writer.');
  }

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

  res.status(200).json({
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

module.exports = {
  getWriters,
  submitWriterRequest,
  reviewWriterRequest,
  checkWriterEmail,
  createWriter,
  updateWriter,
  toggleWriterStatus,
  deleteWriter,
};