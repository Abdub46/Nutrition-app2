const asyncHandler = require('express-async-handler');
const SiteBanner = require('../models/SiteBanner');

const getBanner = asyncHandler(async (req, res) => {
  let banner = await SiteBanner.findOne();
  if (!banner) {
    return res.json({
      success: true,
      banner: {
        enabled: false,
        text: '',
        linkUrl: '',
        linkText: '',
        showLinkIcon: false,
        backgroundColor: '#16a34e',
        textColor: '#ffffff',
        showCloseButton: true,
        updatedAt: null,
      },
    });
  }
  res.json({ success: true, banner });
});

const updateBanner = asyncHandler(async (req, res) => {
  const {
    enabled, text, linkUrl, linkText, showLinkIcon, backgroundColor, textColor, showCloseButton,
  } = req.body;

  let banner = await SiteBanner.findOne();
  if (!banner) banner = new SiteBanner();

  if (enabled !== undefined) banner.enabled = !!enabled;
  if (text !== undefined) banner.text = text;
  if (linkUrl !== undefined) banner.linkUrl = linkUrl;
  if (linkText !== undefined) banner.linkText = linkText;
  if (showLinkIcon !== undefined) banner.showLinkIcon = !!showLinkIcon;
  if (backgroundColor !== undefined) banner.backgroundColor = backgroundColor;
  if (textColor !== undefined) banner.textColor = textColor;
  if (showCloseButton !== undefined) banner.showCloseButton = !!showCloseButton;

  await banner.save();
  res.json({ success: true, banner });
});

module.exports = { getBanner, updateBanner };