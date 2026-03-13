import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import './ArticleCard.css';

const PLACEHOLDER = 'https://placehold.co/600x340/1e2022/666?text=No+Image';

function timeAgo(d) {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

export default function ArticleCard({ article, featured = false, compact = false }) {
  const { bookmarkArticle, isArticleSaved } = useNews();
  const [imgErr, setImgErr] = useState(false);
  const saved = isArticleSaved(article.id);
  const img   = imgErr || !article.urlToImage ? PLACEHOLDER : article.urlToImage;

  if (compact) {
    return (
      <article className="card-compact">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="card-compact__img-link">
          <img src={img} alt={article.title} onError={() => setImgErr(true)} className="card-compact__img" />
        </a>
        <div className="card-compact__body">
          <span className="card-compact__source">{article.source}</span>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            <h4 className="card-compact__title truncate-3">{article.title}</h4>
          </a>
          <span className="card-compact__time">{timeAgo(article.publishedAt)}</span>
        </div>
      </article>
    );
  }

  if (featured) {
    return (
      <article className="card-hero">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="card-hero__img-link">
          <img src={img} alt={article.title} onError={() => setImgErr(true)} className="card-hero__img" />
          <div className="card-hero__overlay" />
          <div className="card-hero__content">
            <div className="card-hero__meta">
              <span className="card-hero__badge">TOP STORY</span>
              <span className="card-hero__dot">·</span>
              <span className="card-hero__source">{article.source}</span>
              <span className="card-hero__dot">·</span>
              <span className="card-hero__time">{timeAgo(article.publishedAt)}</span>
            </div>
            <h2 className="card-hero__title">{article.title}</h2>
            {article.description && (
              <p className="card-hero__desc truncate-2">{article.description}</p>
            )}
          </div>
        </a>
        <button
          className={`card-hero__save ${saved ? 'card-hero__save--on' : ''}`}
          onClick={() => bookmarkArticle(article)}
          title={saved ? 'Remove' : 'Save'}
        >
          {saved ? '◆' : '◇'}
        </button>
      </article>
    );
  }

  return (
    <article className="card">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="card__img-link">
        <div className="card__img-wrap">
          <img src={img} alt={article.title} onError={() => setImgErr(true)} className="card__img" />
        </div>
      </a>
      <div className="card__body">
        <div className="card__meta">
          <span className="card__source">{article.source}</span>
          <span className="card__dot">·</span>
          <span className="card__time">{timeAgo(article.publishedAt)}</span>
        </div>
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h3 className="card__title truncate-3">{article.title}</h3>
        </a>
        {article.description && (
          <p className="card__desc truncate-2">{article.description}</p>
        )}
        <div className="card__footer">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="card__read-btn">
            Read →
          </a>
          <button
            className={`card__save ${saved ? 'card__save--on' : ''}`}
            onClick={() => bookmarkArticle(article)}
            title={saved ? 'Remove' : 'Save'}
          >
            {saved ? '◆ Saved' : '◇ Save'}
          </button>
        </div>
      </div>
    </article>
  );
}
