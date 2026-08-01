const mongoose = require('mongoose');

const siteBannerSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    text: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    linkText: { type: String, default: '' },
    showLinkIcon: { type: Boolean, default: false },
    backgroundColor: { type: String, default: '#16a34e' },
    textColor: { type: String, default: '#ffffff' },
    showCloseButton: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteBanner', siteBannerSchema);
