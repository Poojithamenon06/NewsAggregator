// ─── frontend/src/context/NewsContext.js ──────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { fetchHeadlines, fetchTrending, getSaved, saveArticle, unsaveArticle, getSavedIds } from '../services/api';

const NewsContext = createContext();

export const CATEGORIES = [
  { id: 'general',       label: 'Top Stories',   icon: '🌐', color: '#6C63FF' },
  { id: 'technology',    label: 'Technology',    icon: '💻', color: '#00BCD4' },
  { id: 'business',      label: 'Business',      icon: '📈', color: '#4CAF50' },
  { id: 'sports',        label: 'Sports',        icon: '⚽', color: '#FF5722' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#E91E63' },
  { id: 'health',        label: 'Health',        icon: '❤️', color: '#F44336' },
  { id: 'science',       label: 'Science',       icon: '🔬', color: '#FF9800' },
];

// All countries GNews supports (60+)
export const COUNTRIES = [
  { code:'us', name:'United States',   flag:'🇺🇸' }, { code:'gb', name:'United Kingdom',  flag:'🇬🇧' },
  { code:'in', name:'India',           flag:'🇮🇳' }, { code:'au', name:'Australia',        flag:'🇦🇺' },
  { code:'ca', name:'Canada',          flag:'🇨🇦' }, { code:'de', name:'Germany',          flag:'🇩🇪' },
  { code:'fr', name:'France',          flag:'🇫🇷' }, { code:'jp', name:'Japan',            flag:'🇯🇵' },
  { code:'cn', name:'China',           flag:'🇨🇳' }, { code:'br', name:'Brazil',           flag:'🇧🇷' },
  { code:'ru', name:'Russia',          flag:'🇷🇺' }, { code:'it', name:'Italy',            flag:'🇮🇹' },
  { code:'es', name:'Spain',           flag:'🇪🇸' }, { code:'mx', name:'Mexico',           flag:'🇲🇽' },
  { code:'kr', name:'South Korea',     flag:'🇰🇷' }, { code:'ae', name:'UAE',              flag:'🇦🇪' },
  { code:'sa', name:'Saudi Arabia',    flag:'🇸🇦' }, { code:'za', name:'South Africa',     flag:'🇿🇦' },
  { code:'ng', name:'Nigeria',         flag:'🇳🇬' }, { code:'eg', name:'Egypt',            flag:'🇪🇬' },
  { code:'ar', name:'Argentina',       flag:'🇦🇷' }, { code:'nl', name:'Netherlands',      flag:'🇳🇱' },
  { code:'se', name:'Sweden',          flag:'🇸🇪' }, { code:'no', name:'Norway',           flag:'🇳🇴' },
  { code:'ch', name:'Switzerland',     flag:'🇨🇭' }, { code:'pl', name:'Poland',           flag:'🇵🇱' },
  { code:'tr', name:'Turkey',          flag:'🇹🇷' }, { code:'id', name:'Indonesia',        flag:'🇮🇩' },
  { code:'ph', name:'Philippines',     flag:'🇵🇭' }, { code:'my', name:'Malaysia',         flag:'🇲🇾' },
  { code:'sg', name:'Singapore',       flag:'🇸🇬' }, { code:'th', name:'Thailand',         flag:'🇹🇭' },
  { code:'pk', name:'Pakistan',        flag:'🇵🇰' }, { code:'ke', name:'Kenya',            flag:'🇰🇪' },
  { code:'ua', name:'Ukraine',         flag:'🇺🇦' }, { code:'il', name:'Israel',           flag:'🇮🇱' },
  { code:'hk', name:'Hong Kong',       flag:'🇭🇰' }, { code:'tw', name:'Taiwan',           flag:'🇹🇼' },
  { code:'nz', name:'New Zealand',     flag:'🇳🇿' }, { code:'ie', name:'Ireland',          flag:'🇮🇪' },
  { code:'pt', name:'Portugal',        flag:'🇵🇹' }, { code:'gr', name:'Greece',           flag:'🇬🇷' },
  { code:'at', name:'Austria',         flag:'🇦🇹' }, { code:'be', name:'Belgium',          flag:'🇧🇪' },
  { code:'dk', name:'Denmark',         flag:'🇩🇰' }, { code:'fi', name:'Finland',          flag:'🇫🇮' },
  { code:'cz', name:'Czech Republic',  flag:'🇨🇿' }, { code:'hu', name:'Hungary',          flag:'🇭🇺' },
  { code:'ro', name:'Romania',         flag:'🇷🇴' }, { code:'cl', name:'Chile',            flag:'🇨🇱' },
  { code:'co', name:'Colombia',        flag:'🇨🇴' }, { code:'pe', name:'Peru',             flag:'🇵🇪' },
  { code:'ve', name:'Venezuela',       flag:'🇻🇪' }, { code:'cu', name:'Cuba',             flag:'🇨🇺' },
  { code:'ma', name:'Morocco',         flag:'🇲🇦' }, { code:'lk', name:'Sri Lanka',        flag:'🇱🇰' },
  { code:'hr', name:'Croatia',         flag:'🇭🇷' }, { code:'sk', name:'Slovakia',         flag:'🇸🇰' },
  { code:'bg', name:'Bulgaria',        flag:'🇧🇬' }, { code:'rs', name:'Serbia',           flag:'🇷🇸' },
];

export function NewsProvider({ children }) {
  const [articles,       setArticles]       = useState([]);
  const [trending,       setTrending]       = useState([]);
  const [savedArticles,  setSavedArticles]  = useState([]);
  const [savedIds,       setSavedIds]       = useState(new Set());
  const [activeCategory, setActiveCategory] = useState('general');
  const [activeCountry,  setActiveCountry]  = useState('us');
  const [loading,        setLoading]        = useState(false);
  const [page,           setPage]           = useState(1);
  const [totalResults,   setTotalResults]   = useState(0);
  const [fetchedAt,      setFetchedAt]      = useState(null);
  const [theme,          setTheme]          = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    fetchTrending().then(d => setTrending(d.articles || [])).catch(() => {});
    refreshSaved();
  }, []);

  const refreshSaved = async () => {
    try {
      const [s, ids] = await Promise.all([getSaved(), getSavedIds()]);
      setSavedArticles(s.articles || []);
      setSavedIds(new Set(ids.ids || []));
    } catch {}
  };

  const loadNews = useCallback(async (category, country, pg = 1) => {
    setLoading(true);
    try {
      const data = await fetchHeadlines({ category, country, page: pg, pageSize: 10 });
      const incoming = (data.articles || []).sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
      );
      setArticles(pg === 1 ? incoming : prev => [...prev, ...incoming]);
      setTotalResults(data.totalResults || 0);
      setFetchedAt(data.fetchedAt || null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load news.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setPage(1);
    setArticles([]);
    loadNews(activeCategory, activeCountry, 1);
  }, [activeCategory, activeCountry]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadNews(activeCategory, activeCountry, next);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  const bookmarkArticle = async (article) => {
    if (savedIds.has(article.id)) {
      try {
        await unsaveArticle(article.id);
        setSavedIds(prev => { const s = new Set(prev); s.delete(article.id); return s; });
        setSavedArticles(prev => prev.filter(a => a.articleId !== article.id));
        toast('Removed from saved', { icon: '🗑️' });
      } catch { toast.error('Failed to remove'); }
    } else {
      try {
        await saveArticle({
          articleId:   article.id,
          title:       article.title,
          description: article.description,
          url:         article.url,
          urlToImage:  article.urlToImage,
          source:      article.source,
          publishedAt: article.publishedAt,
          category:    activeCategory,
          country:     activeCountry,
        });
        setSavedIds(prev => new Set([...prev, article.id]));
        setSavedArticles(prev => [{ ...article, articleId: article.id }, ...prev]);
        toast.success('Saved! 🔖');
      } catch (e) {
        if (e.response?.status === 409) toast('Already saved', { icon: '📌' });
        else toast.error('Failed to save');
      }
    }
  };

  return (
    <NewsContext.Provider value={{
      articles, trending, savedArticles, loading, theme, toggleTheme,
      activeCategory, setActiveCategory,
      activeCountry,  setActiveCountry,
      totalResults, loadMore, page, fetchedAt,
      bookmarkArticle,
      isArticleSaved: (id) => savedIds.has(id),
      refreshSaved,
    }}>
      {children}
    </NewsContext.Provider>
  );
}

export const useNews = () => useContext(NewsContext);
