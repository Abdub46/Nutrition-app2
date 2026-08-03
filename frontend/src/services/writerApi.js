import api from './api';

export const getWriters = () => api.get('/writers').then((r) => r.data.writers);
export const createWriter = (payload) => api.post('/writers', payload).then((r) => r.data.writer);
export const updateWriter = (id, payload) => api.put(`/writers/${id}`, payload).then((r) => r.data.writer);
export const toggleWriterStatus = (id) => api.put(`/writers/${id}/status`).then((r) => r.data);
export const deleteWriter = (id) => api.delete(`/writers/${id}`).then((r) => r.data);