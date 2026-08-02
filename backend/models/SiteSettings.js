const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    // Website
    websiteName: { type: String, default: 'NutriCounsel' },
    websiteDescription: { type: String, default: '' },
    websiteLogo: { type: String, default: '' }, // Cloudinary secure_url
    websiteFavicon: { type: String, default: '' }, // Cloudinary secure_url

    // Contact
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },

    // Social links
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },

    // Footer
    footerText: { type: String, default: '' },

    // Newsletter
    newsletterHeading: { type: String, default: 'Stay Updated' },
    newsletterDescription: {
      type: String,
      default: 'Subscribe to receive the latest nutrition tips, wellness articles, and healthy living insights directly in your inbox.',
    },

    // SEO defaults
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },

    // Maintenance mode - future-ready toggle, not yet enforced anywhere
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);