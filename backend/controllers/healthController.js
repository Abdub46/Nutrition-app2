const mongoose = require('mongoose');

const DB_STATE_LABELS = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

// @desc    Health/monitoring endpoint - reports whether the API process is up,
//          whether it can actually reach MongoDB (not just that Express is
//          alive), and basic resource stats. Intended for an external uptime
//          monitor (UptimeRobot, Better Uptime, a cron+curl, etc.) - status
//          code reflects health so a monitor can alert on non-200 alone,
//          without needing to parse the body.
// @route   GET /api/health
// @access  Public
const getHealth = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbConnected = dbState === 1;
  const memoryUsage = process.memoryUsage();

  const body = {
    success: dbConnected,
    status: dbConnected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: DB_STATE_LABELS[dbState] || 'unknown',
      connected: dbConnected,
    },
    memory: {
      rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    },
  };

  // 200 when everything's fine, 503 (Service Unavailable) when the DB isn't
  // reachable - lets monitors key off the HTTP status alone if they want to.
  res.status(dbConnected ? 200 : 503).json(body);
};

module.exports = { getHealth };