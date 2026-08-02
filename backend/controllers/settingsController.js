const asyncHandler = require('express-async-handler');
const SiteSettings = require('../models/SiteSettings');

// @desc    Get site settings (public - used site-wide for name/logo/footer/SEO)
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  res.json({ success: true, settings });
});

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private (admin)
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = new SiteSettings();

  const editableFields = [
    'websiteName', 'websiteDescription', 'websiteLogo', 'websiteFavicon',
    'contactEmail', 'contactPhone', 'footerText',
    'newsletterHeading', 'newsletterDescription',
    'seoTitle', 'seoDescription', 'maintenanceMode',
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  });

  if (req.body.socialLinks) {
    settings.socialLinks = { ...settings.socialLinks.toObject(), ...req.body.socialLinks };
  }

  await settings.save();
  res.json({ success: true, settings });
});

module.exports = { getSettings, updateSettings };