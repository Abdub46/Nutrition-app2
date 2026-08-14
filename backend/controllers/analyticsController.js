const asyncHandler = require('express-async-handler');
const PageView = require('../models/PageView');
const User = require('../models/User');
const { detectDevice } = require('../utils/deviceDetect');

// @desc    Record a single page view (called by the frontend on every route change)
// @route   POST /api/analytics/track
// @access  Public
const trackPageView = asyncHandler(async (req, res) => {
  const { path, sessionId } = req.body;

  // Tracking should never disrupt the visitor - fail quietly on bad input
  // rather than throwing, since this is a fire-and-forget call from the frontend.
  if (!path || !sessionId || typeof path !== 'string' || typeof sessionId !== 'string') {
    return res.status(204).end();
  }

  await PageView.create({
    path: path.slice(0, 300),
    sessionId: sessionId.slice(0, 100),
    device: detectDevice(req.headers['user-agent']),
  });

  res.status(204).end();
});

// Returns a Date for the start of today/this-week(Monday)/this-month, local server time.
const startOf = (unit) => {
  const d = new Date();
  if (unit === 'day') {
    d.setHours(0, 0, 0, 0);
  } else if (unit === 'week') {
    const day = d.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diffToMonday);
    d.setHours(0, 0, 0, 0);
  } else if (unit === 'month') {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
};

// @desc    Traffic/performance analytics for the admin "Performance" tab
// @route   GET /api/admin/analytics/performance
// @access  Private (admin)
const getPerformanceAnalytics = asyncHandler(async (req, res) => {
  const startOfToday = startOf('day');
  const startOfWeek = startOf('week');
  const startOfMonth = startOf('month');

  const distinctSessionsSince = async (since) => (await PageView.distinct('sessionId', { createdAt: { $gte: since } })).length;

  const [visitorsToday, visitorsThisWeek, visitorsThisMonth, pageViewsThisMonth, sessionIdsThisMonth] = await Promise.all([
    distinctSessionsSince(startOfToday),
    distinctSessionsSince(startOfWeek),
    distinctSessionsSince(startOfMonth),
    PageView.countDocuments({ createdAt: { $gte: startOfMonth } }),
    PageView.distinct('sessionId', { createdAt: { $gte: startOfMonth } }),
  ]);

  const avgPagesPerSession = sessionIdsThisMonth.length
    ? Math.round((pageViewsThisMonth / sessionIdsThisMonth.length) * 10) / 10
    : 0;

  // Bounce rate: % of this-month sessions that viewed exactly one page.
  let bounceRate = 0;
  if (sessionIdsThisMonth.length) {
    const singlePageSessionAgg = await PageView.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: '$sessionId', count: { $sum: 1 } } },
      { $match: { count: 1 } },
      { $count: 'total' },
    ]);
    const bounced = singlePageSessionAgg[0]?.total || 0;
    bounceRate = Math.round((bounced / sessionIdsThisMonth.length) * 1000) / 10; // one decimal place
  }

  // Daily visitors (distinct sessions/day) - last 30 days, zero-filled so the
  // line graph doesn't have gaps on days with no traffic.
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const dailyAgg = await PageView.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sessionId: '$sessionId' } } },
    { $group: { _id: '$_id.date', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const dailyMap = new Map(dailyAgg.map((d) => [d._id, d.count]));
  const dailyVisitors = [];
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyVisitors.push({ date: key, count: dailyMap.get(key) || 0 });
  }

  // Most visited pages this month, top 8
  const mostVisitedAgg = await PageView.aggregate([
    { $match: { createdAt: { $gte: startOfMonth } } },
    { $group: { _id: '$path', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);
  const mostVisitedPages = mostVisitedAgg.map((p) => ({ path: p._id, count: p.count }));

  // Signups by month (last 12 months) - same underlying data as the Overview
  // tab's "Monthly Signup Trend", rendered as a line graph here per the
  // Performance tab spec.
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const signupAgg = await User.aggregate([
    { $match: { role: 'client', createdAt: { $gte: twelveMonthsAgo } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  const signupsByMonth = signupAgg.map((item) => ({
    label: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    count: item.count,
  }));

  // Device usage this month
  const deviceAgg = await PageView.aggregate([
    { $match: { createdAt: { $gte: startOfMonth } } },
    { $group: { _id: '$device', count: { $sum: 1 } } },
  ]);
  const deviceUsage = deviceAgg.map((d) => ({ label: d._id, count: d.count }));

  res.json({
    success: true,
    visitorsToday,
    visitorsThisWeek,
    visitorsThisMonth,
    pageViewsThisMonth,
    avgPagesPerSession,
    bounceRate,
    dailyVisitors,
    mostVisitedPages,
    signupsByMonth,
    deviceUsage,
  });
});

module.exports = { trackPageView, getPerformanceAnalytics };