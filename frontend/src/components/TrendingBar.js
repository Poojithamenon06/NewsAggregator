import React from 'react';
import { useNews } from '../context/NewsContext';
import ArticleCard from './ArticleCard';
import './TrendingBar.css';

export default function TrendingBar() {
  const { trending } = useNews();
  return (
    <div className="trending-panel">
      <div className="tp-header">
        <span className="tp-label">Trending</span>
        <span className="tp-rule" />
      </div>
      {trending.length === 0 ? (
        <div className="tp-empty">Loading…</div>
      ) : (
        <div className="tp-list">
          {trending.map((a, i) => (
            <div key={a.id} className="tp-item">
              <span className="tp-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="tp-content">
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="tp-title">
                  {a.title}
                </a>
                <span className="tp-source">{a.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
