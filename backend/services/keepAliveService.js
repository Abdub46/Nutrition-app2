const cron = require('node-cron');
const fetch = require('node-fetch');

/**
 * Render's free tier spins a web service down after ~15 minutes of no inbound
 * traffic, which causes a slow cold-start on the next real request. This pings
 * our own /api/health endpoint every 14 minutes - just under that threshold -
 * to keep the instance warm.
 *
 * Render automatically sets RENDER_EXTERNAL_URL to the service's public URL,
 * so no manual config is needed there; SELF_URL is a manual fallback for other
 * hosts. Only runs in production, and only if a URL is actually known - it's a
 * silent no-op locally.
 */
const startKeepAlive = () => {
  const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.SELF_URL;

  if (process.env.NODE_ENV !== 'production' || !baseUrl) {
    return;
  }

  const healthUrl = `${baseUrl.replace(/\/$/, '')}/api/health`;

  cron.schedule('*/14 * * * *', async () => {
    try {
      const res = await fetch(healthUrl);
      console.log(`[keep-alive] ping ${res.status} at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('[keep-alive] ping failed:', err.message);
    }
  });

  console.log(`[keep-alive] scheduled every 14 minutes -> ${healthUrl}`);
};

// module.exports = { startKeepAlive };