// ─── src/pages/Saved.js ───────────────────────────────────────────────────────
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import ArticleCard from '../components/ArticleCard';
import './Saved.css';

export default function Saved() {
  const { saved } = useNews();
  const navigate = useNavigate();

  // Transform saved DB shape → article card shape
  const articles = saved.map((a) => ({
    id: a.articleId,
    title: a.title,
    description: a.description,
    url: a.url,
    urlToImage: a.urlToImage,
    source: a.source,
    author: a.author,
    publishedAt: a.publishedAt,
  }));

  return (
    <div className="saved-page">
      <div className="saved-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h1 className="saved-title">Saved Articles</h1>
        <span className="saved-count">{saved.length} article{saved.length !== 1 ? 's' : ''}</span>
      </div>

      {articles.length === 0 ? (
        <div className="empty-state">
          <span>🔖</span>
          <p>No saved articles yet. Start bookmarking articles you like!</p>
          <button className="go-home-btn" onClick={() => navigate('/')}>Browse News</button>
        </div>
      ) : (
        <div className="saved-grid">
          {articles.map((article, i) => (
            <div key={article.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
