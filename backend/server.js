require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { startKeepAlive } = require('./services/keepAliveService');
const { getHealth } = require('./controllers/healthController');
const { getSitemap } = require('./controllers/sitemapController');

const authRoutes = require('./routes/authRoutes');
const bmiRoutes = require('./routes/bmiRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const articleRoutes = require('./routes/articleRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const toolsRoutes = require('./routes/toolsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const articleCategoryRoutes = require('./routes/articleCategoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const writerRoutes = require('./routes/writerRoutes');
const writerRequestRoutes = require('./routes/writerRequestRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const commentRoutes = require('./routes/commentRoutes');

connectDB();

const app = express();

// Trust the first hop only (Render's reverse proxy sits directly in front of
// this process). Without this, req.ip reflects the proxy's own address
// instead of the real client - rate limiting (see middleware/rateLimitMiddleware.js)
// would then key off one shared IP for all traffic, and any X-Forwarded-For
// header a client sends could be trusted blindly. "1" means "trust exactly
// one proxy hop" - safer than "true", which would trust an arbitrary chain
// and let a client spoof its own IP by setting X-Forwarded-For itself.
app.set('trust proxy', 1);

// Security & parsing middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips any $ or . operators from req.body/query/params - blocks NoSQL injection
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use('/api', apiLimiter);

// Health check - see controllers/healthController.js for what it actually verifies
app.get('/api/health', getHealth);

// XML sitemap - see controllers/sitemapController.js for what's included and why
app.get('/sitemap.xml', getSitemap);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/article-categories', articleCategoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/writers', writerRoutes);
app.use('/api/writer-requests', writerRequestRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/comments', commentRoutes);

// 404 + error handler (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  startKeepAlive();
});

module.exports = app;
