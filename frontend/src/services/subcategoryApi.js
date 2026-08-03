import api from './api';

export const getSubcategories = (categoryId) =>
  api.get('/subcategories', { params: categoryId ? { category: categoryId } : {} }).then((r) => r.data.subcategories);
export const createSubcategory = (name, category) =>
  api.post('/subcategories', { name, category }).then((r) => r.data.subcategory);
export const updateSubcategory = (id, name) =>
  api.put(`/subcategories/${id}`, { name }).then((r) => r.data.subcategory);
export const deleteSubcategory = (id) => api.delete(`/subcategories/${id}`).then((r) => r.data);