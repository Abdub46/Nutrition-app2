import api from './api';

export const submitSuggestion = (message) => api.post('/suggestions', { message }).then((r) => r.data);