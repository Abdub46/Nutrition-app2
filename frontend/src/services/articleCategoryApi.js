import api from './api';

export const getArticleCategories = () => api.get('/article-categories').then((r) => r.data.categories);
export const createArticleCategory = (name) => api.post('/article-categories', { name }).then((r) => r.data.category);
export const updateArticleCategory = (id, name) => api.put(`/article-categories/${id}`, { name }).then((r) => r.data.category);
export const deleteArticleCategory = (id) => api.delete(`/article-categories/${id}`).then((r) => r.data);