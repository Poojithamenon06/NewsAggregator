import React from 'react';
import { useNews, CATEGORIES, COUNTRIES } from '../context/NewsContext';
import ArticleCard from '../components/ArticleCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import TrendingBar from '../components/TrendingBar';
import './Home.css';

function timeStr(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
         ' · ' + new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Home() {
  const { articles, loading, totalResults, loadMore, activeCategory, activeCountry, fetchedAt } = useNews();

  const cat   = CATEGORIES.find(c => c.id === activeCategory);
  const ctry  = COUNTRIES.find(c => c.code === activeCountry);
  const hasMore = articles.length > 0 && articles.length < totalResults;

  // Layout: hero (0), secondary (1-2), grid (3+)
  const hero      = articles[0];
  const secondary = articles.slice(1, 3);
  const rest      = articles.slice(3);

  return (
    <div className="home-page">
      {/* Section header — newspaper style */}
      <div className="home-deck">
        <div className="home-deck-left">
          <span className="deck-category" style={{ color: cat?.color }}>{cat?.icon} {cat?.label}</span>
          <span className="deck-sep">·</span>
          <span className="deck-region">{ctry?.flag} {ctry?.name}</span>
        </div>
        <div className="home-deck-right">
          {fetchedAt && <span className="deck-updated">Updated {timeStr(fetchedAt)}</span>}
          <span className="deck-live">● Live</span>
        </div>
      </div>
      <div className="home-rule" />

      {loading && articles.length === 0 ? (
        <SkeletonGrid count={9} />
      ) : (
        <>
          {/* ── Main layout ── */}
          <div className="home-layout">
            <main className="home-main">
              {/* Hero story */}
              {hero && (
                <div className="home-hero fade-up">
                  <ArticleCard article={hero} featured />
                </div>
              )}

              {/* Secondary stories — 2-col */}
              {secondary.length > 0 && (
                <div className="home-secondary">
                  {secondary.map((a, i) => (
                    <div key={a.id} className="fade-up" style={{ animationDelay: `${(i+1)*.07}s` }}>
                      <ArticleCard article={a} />
                    </div>
                  ))}
                </div>
              )}

              {/* Section divider */}
              {rest.length > 0 && (
                <div className="home-divider">
                  <span>More Stories</span>
                </div>
              )}

              {/* Grid */}
              <div className="home-grid">
                {rest.map((a, i) => (
                  <div key={a.id} className="fade-up" style={{ animationDelay: `${Math.min(i,8)*.04}s` }}>
                    <ArticleCard article={a} />
                  </div>
                ))}
              </div>

              {hasMore && !loading && (
                <button className="home-load-more" onClick={loadMore}>
                  Load More Stories
                </button>
              )}
              {loading && articles.length > 0 && (
                <div className="home-spinner"><div className="spinner" /></div>
              )}
              {!loading && articles.length === 0 && (
                <div className="home-empty">
                  <p className="home-empty-title">No stories available</p>
                  <p>Try selecting a different country or category.</p>
                </div>
              )}
            </main>

            {/* Sidebar */}
            <aside className="home-sidebar">
              <TrendingBar />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
