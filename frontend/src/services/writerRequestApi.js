import api from './api';

export const submitWriterRequest = (payload) => api.post('/writer-requests', payload).then((r) => r.data);