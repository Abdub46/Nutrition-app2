import api from './api';

export const getComments = (articleId) => api.get(`/articles/${articleId}/comments`);

export const addComment = (articleId, content) => api.post(`/articles/${articleId}/comments`, { content });

export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);