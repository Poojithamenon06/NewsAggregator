// ─── src/pages/Home.js ────────────────────────────────────────────────────────
import React from 'react';
import { useNews } from '../context/NewsContext';
import ArticleCard from '../components/ArticleCard';
import TrendingBar from '../components/TrendingBar';
import { SkeletonGrid } from '../components/SkeletonCard';
import './Home.css';

export default function Home() {
  const { articles, loading, totalResults, loadMore, page, activeCategory } = useNews();

  const hasMore = articles.length < totalResults;
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="home">
      <div className="home__layout">
        {/* ── Main Feed ─────────────────────────────────────────────────── */}
        <main className="home__main">
          {/* Featured article */}
          {!loading && featured && (
            <div className="home__featured fade-up">
              <ArticleCard article={featured} featured />
            </div>
          )}

          {/* Grid */}
          {loading && articles.length === 0 ? (
            <SkeletonGrid count={8} />
          ) : (
            <div className="home__grid">
              {rest.map((article, i) => (
                <div
                  key={article.id}
                  className="fade-up"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          )}

          {/* Load more */}
          {!loading && hasMore && (
            <button className="load-more-btn" onClick={loadMore}>
              Load more articles
            </button>
          )}

          {loading && articles.length > 0 && (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="empty-state">
              <span>📭</span>
              <p>No articles found. Try a different category or region.</p>
            </div>
          )}
        </main>

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside className="home__sidebar">
          <TrendingBar />
        </aside>
      </div>
    </div>
  );
}
