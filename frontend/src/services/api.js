// ─── src/services/api.js ──────────────────────────────────────────────────────
import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 10000 });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('news_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser  = (data) => api.post('/auth/register', data).then(r => r.data);
export const loginUser     = (data) => api.post('/auth/login', data).then(r => r.data);
export const getMe         = ()     => api.get('/auth/me').then(r => r.data);
export const updateProfile = (data) => api.put('/auth/profile', data).then(r => r.data);
export const changePassword= (data) => api.put('/auth/change-password', data).then(r => r.data);

// ── News ──────────────────────────────────────────────────────────────────────
export const fetchTopHeadlines = (params) => api.get('/news/top-headlines', { params }).then(r => r.data);
export const searchNews        = (params) => api.get('/news/search', { params }).then(r => r.data);
export const fetchTrending     = ()       => api.get('/news/trending').then(r => r.data);

// ── Saved Articles ────────────────────────────────────────────────────────────
export const getSessionId = () => {
  let id = localStorage.getItem('news_session_id');
  if (!id) { id = 'sess_' + Math.random().toString(36).slice(2) + Date.now(); localStorage.setItem('news_session_id', id); }
  return id;
};
export const getSavedArticles  = (sid) => api.get(`/saved/${sid}`).then(r => r.data);
export const saveArticle       = (sid, article) => api.post(`/saved/${sid}`, article).then(r => r.data);
export const removeSavedArticle= (sid, aid) => api.delete(`/saved/${sid}/${aid}`).then(r => r.data);

export default api;
