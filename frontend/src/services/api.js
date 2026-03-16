// ─── frontend/src/services/api.js ─────────────────────────────────────────────
import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('news_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = (d) => api.post('/auth/register', d).then(r => r.data);
export const loginUser = (d) => api.post('/auth/login', d).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);
export const updateProfile = (d) => api.put('/auth/profile', d).then(r => r.data);
export const changePassword = (d) => api.put('/auth/change-password', d).then(r => r.data);

// ── Search History ────────────────────────────────────────────────────────────
export const logSearch = (d) => api.post('/auth/search-history', d).catch(() => { });
export const getSearchHistory = () => api.get('/auth/search-history').then(r => r.data);
export const deleteSearchEntry = (id) => api.delete(`/auth/search-history/${id}`).then(r => r.data);
export const clearSearchHistory = () => api.delete('/auth/search-history').then(r => r.data);

// ── News ──────────────────────────────────────────────────────────────────────
export const fetchHeadlines = (p) => api.get('/news/top-headlines', { params: p }).then(r => r.data);
export const searchArticles = (p) => api.get('/news/search', { params: p }).then(r => r.data);
export const fetchTrending = () => api.get('/news/trending').then(r => r.data);
export const fetchCountries = () => api.get('/news/countries').then(r => r.data);

// ── Saved Articles ────────────────────────────────────────────────────────────
export const getSaved = () => api.get('/saved').then(r => r.data);
export const getSavedIds = () => api.get('/saved/ids').then(r => r.data);
export const saveArticle = (d) => api.post('/saved', d).then(r => r.data);
export const unsaveArticle = (aid) => api.delete(`/saved/${aid}`).then(r => r.data);

export default api;
