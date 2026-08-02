import api from './api';

export const getSettings = () => api.get('/settings').then((r) => r.data.settings);
export const updateSettings = (payload) => api.put('/settings', payload).then((r) => r.data.settings);