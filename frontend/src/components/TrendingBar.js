// ─── src/components/TrendingBar.js ───────────────────────────────────────────
import React from 'react';
import { useNews } from '../context/NewsContext';
import './TrendingBar.css';

export default function TrendingBar() {
  const { trending } = useNews();

  if (!trending.length) return null;

  return (
    <aside className="trending">
      <h4 className="trending__title">🔥 Trending Now</h4>
      <ol className="trending__list">
        {trending.map((article, i) => (
          <li key={article.id} className="trending__item">
            <span className="trending__num">{String(i + 1).padStart(2, '0')}</span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="trending__link"
            >
              {article.title}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
