const nodemailer = require('nodemailer');

// Created once at module load and reused (with connection pooling) instead of
// opening a brand new SMTP connection on every single call - a fresh
// connection means repeating the TCP+TLS handshake and SMTP auth every time,
// which was adding avoidable latency to every email this app sends (password
// resets, the newsletter). Pooling keeps a small number of connections open
// and reuses them.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  pool: true,
  maxConnections: 3,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
