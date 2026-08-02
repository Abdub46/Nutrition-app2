import api from './api';

// folder: 'articles' | 'avatars' | 'branding'
export const uploadImage = (file, folder = 'misc') => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post(`/uploads?folder=${folder}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.url);
};