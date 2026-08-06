const asyncHandler = require('express-async-handler');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { sendEmail } = require('../services/emailService');

// @desc    Subscribe an email to the newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const normalizedEmail = email.toLowerCase();
  const existing = await NewsletterSubscriber.findOne({ email: normalizedEmail });
  if (existing) {
    return res.json({ success: true, message: "You're already subscribed!" });
  }

  await NewsletterSubscriber.create({ email: normalizedEmail });

  // Send a confirmation email so subscribers actually receive something when they
  // sign up. The subscription itself is already saved above, so a transient SMTP
  // failure here is logged but doesn't fail the request or lose the lead - the
  // person is on the list either way and can be re-sent updates later.
  try {
    await sendEmail({
      to: normalizedEmail,
      subject: 'Welcome to the Nutrition Counselling Newsletter',
      html: `
        <p>Hi there,</p>
        <p>Thank you for subscribing to our newsletter! You'll now receive updates on new articles, nutrition tips, and announcements from us.</p>
        <p>If you didn't request this, you can safely ignore this email - you won't receive anything further unless you subscribe again.</p>
        <p>Warm regards,<br/>Nutrition Counselling App</p>
      `,
    });
  } catch (err) {
    console.error('Newsletter confirmation email failed to send:', err.message);
  }

  res.status(201).json({ success: true, message: 'Subscribed successfully! Thank you for joining.' });
});

module.exports = { subscribe };
