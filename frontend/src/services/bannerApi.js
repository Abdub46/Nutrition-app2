import api from './api';

export const getBanner = () => api.get('/banner').then((r) => r.data.banner);
export const updateBanner = (payload) => api.put('/banner', payload).then((r) => r.data.banner);