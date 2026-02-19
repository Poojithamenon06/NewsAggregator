// ─── src/components/CategoryBar.js ───────────────────────────────────────────
import React from 'react';
import { useNews, CATEGORIES } from '../context/NewsContext';
import './CategoryBar.css';

export default function CategoryBar() {
  const { activeCategory, setActiveCategory } = useNews();

  return (
    <div className="catbar">
      <div className="catbar__inner">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`catbar__btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            style={{ '--cat-color': cat.color }}
          >
            <span className="catbar__pill">
              <span className="catbar__icon">{cat.icon}</span>
              <span className="catbar__label">{cat.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
