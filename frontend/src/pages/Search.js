// ─── src/pages/Search.js ─────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchNews } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import './Search.css';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError('');

    searchNews({ q: query, pageSize: 30 })
      .then((data) => {
        setArticles(data.articles || []);
        setTotal(data.totalResults || 0);
      })
      .catch((e) => setError('Search failed. Please try again.'))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="search-title">
          Results for <span className="text-accent">"{query}"</span>
        </h1>
        {!loading && <p className="search-count">{total.toLocaleString()} articles found</p>}
      </div>

      {loading && <SkeletonGrid count={9} />}

      {error && <div className="search-error">{error}</div>}

      {!loading && !error && (
        <div className="search-grid">
          {articles.map((article, i) => (
            <div key={article.id} className="fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      )}

      {!loading && articles.length === 0 && !error && (
        <div className="empty-state">
          <span>🔍</span>
          <p>No results for "{query}"</p>
        </div>
      )}
    </div>
  );
}
