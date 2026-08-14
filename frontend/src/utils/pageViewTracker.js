import api from '../services/api';

const SESSION_KEY = 'analytics_session_id';

// One ID per browser tab, for the lifetime of that tab (sessionStorage) - lets
// the backend count distinct visitors/sessions without any personal data.
const getSessionId = () => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

// Fire-and-forget - a tracking failure should never affect the visitor's experience.
export const trackPageView = (path) => {
  api.post('/analytics/track', { path, sessionId: getSessionId() }).catch(() => {});
};