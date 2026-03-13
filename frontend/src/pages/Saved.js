import React, { useEffect } from 'react';
import { useNews, CATEGORIES } from '../context/NewsContext';
import ArticleCard from '../components/ArticleCard';
import './Saved.css';

export default function Saved() {
  const { savedArticles, refreshSaved, activeCategory } = useNews();

  useEffect(() => { refreshSaved(); }, []);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = savedArticles.filter(a => a.category === cat.id || (!a.category && cat.id === 'general'));
    if (items.length) acc.push({ cat, items });
    return acc;
  }, []);

  const allGrouped = savedArticles.length > 0 ? savedArticles : [];

  return (
    <div className="saved-page">
      <div className="saved-header">
        <h1 className="saved-title">Saved Articles</h1>
        <span className="saved-count">{savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="saved-rule" />

      {savedArticles.length === 0 ? (
        <div className="saved-empty">
          <p className="saved-empty-title">Your reading list is empty</p>
          <p>Bookmark articles from the home feed or search results to save them here.</p>
        </div>
      ) : (
        <div className="saved-grid">
          {savedArticles.map(a => (
            <div key={a.articleId || a.id} className="fade-up">
              <ArticleCard article={{ ...a, id: a.articleId || a.id }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
