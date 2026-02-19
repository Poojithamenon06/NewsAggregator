// ─── src/context/NewsContext.js ───────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getSessionId, fetchTopHeadlines, fetchTrending,
  getSavedArticles, saveArticle, removeSavedArticle,
} from '../services/api';

const NewsContext = createContext();

export const CATEGORIES = [
  { id: 'general',       label: 'Top Stories',    icon: '🌐', color: '#6C63FF' },
  { id: 'technology',    label: 'Technology',     icon: '💻', color: '#00BCD4' },
  { id: 'business',      label: 'Business',       icon: '📈', color: '#4CAF50' },
  { id: 'sports',        label: 'Sports',         icon: '⚽', color: '#FF5722' },
  { id: 'entertainment', label: 'Entertainment',  icon: '🎬', color: '#E91E63' },
  { id: 'health',        label: 'Health',         icon: '❤️', color: '#F44336' },
  { id: 'science',       label: 'Science',        icon: '🔬', color: '#FF9800' },
];

export function NewsProvider({ children }) {
  const sessionId = getSessionId();

  const [articles, setArticles]       = useState([]);
  const [trending, setTrending]       = useState([]);
  const [saved, setSaved]             = useState([]);
  const [activeCategory, setActiveCategory] = useState('general');
  const [loading, setLoading]         = useState(false);
  const [page, setPage]               = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [theme, setTheme]             = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    fetchTrending().then(d => setTrending(d.articles || [])).catch(() => {});
    getSavedArticles(sessionId).then(d => setSaved(d.articles || [])).catch(() => {});
  }, []);

  const loadNews = useCallback(async (category = activeCategory, pg = 1) => {
    setLoading(true);
    try {
      const data = await fetchTopHeadlines({ category, page: pg, pageSize: 20 });
      if (pg === 1) setArticles(data.articles || []);
      else setArticles(prev => [...prev, ...(data.articles || [])]);
      setTotalResults(data.totalResults || 0);
    } catch {
      toast.error('Failed to load news. Check your API key.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { setPage(1); loadNews(activeCategory, 1); }, [activeCategory]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  const bookmarkArticle = async (article) => {
    const alreadySaved = saved.some(a => a.articleId === article.id);
    if (alreadySaved) {
      await removeSavedArticle(sessionId, article.id);
      setSaved(prev => prev.filter(a => a.articleId !== article.id));
      toast('Removed from saved', { icon: '🗑️' });
    } else {
      try {
        await saveArticle(sessionId, { ...article, articleId: article.id, category: activeCategory });
        const d = await getSavedArticles(sessionId);
        setSaved(d.articles || []);
        toast.success('Article saved! 🔖');
      } catch (e) {
        if (e.response?.status === 409) toast('Already saved!', { icon: '📌' });
        else toast.error('Failed to save');
      }
    }
  };

  const isArticleSaved = (id) => saved.some(a => a.articleId === id);

  const loadMore = () => { const n = page + 1; setPage(n); loadNews(activeCategory, n); };

  return (
    <NewsContext.Provider value={{
      articles, trending, saved, loading, theme, toggleTheme,
      activeCategory, setActiveCategory, totalResults, loadMore, page,
      bookmarkArticle, isArticleSaved, sessionId,
    }}>
      {children}
    </NewsContext.Provider>
  );
}

export const useNews = () => useContext(NewsContext);
