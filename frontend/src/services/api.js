import axios from 'axios';

const api = axios.create({
  // Use the production API URL when VITE_API_URL is configured.
  // Fall back to /api so local Vite proxy continues to work.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // Sends/receives the httpOnly auth cookie (see backend/utils/authCookie.js) -
  // required for cross-origin requests (e.g. a Vercel frontend calling a
  // Render backend) to actually carry the cookie at all.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle expired/invalid sessions globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');

      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

