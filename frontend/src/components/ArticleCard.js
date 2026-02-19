// ─── src/components/ArticleCard.js ───────────────────────────────────────────
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNews } from '../context/NewsContext';
import './ArticleCard.css';

const PLACEHOLDER = 'https://via.placeholder.com/400x220/111115/444?text=No+Image';

export default function ArticleCard({ article, featured = false }) {
  const { bookmarkArticle, isArticleSaved } = useNews();
  const [imgError, setImgError] = useState(false);
  const saved = isArticleSaved(article.id);

  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : '';

  return (
    <article className={`card ${featured ? 'card--featured' : ''}`}>
      {/* Image */}
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="card__image-link">
        <div className="card__image-wrap">
          <img
            src={imgError || !article.urlToImage ? PLACEHOLDER : article.urlToImage}
            alt={article.title}
            onError={() => setImgError(true)}
            className="card__image"
          />
          <div className="card__image-overlay" />
        </div>
      </a>

      {/* Content */}
      <div className="card__body">
        <div className="card__meta">
          <span className="card__source">{article.source}</span>
          <span className="card__dot">·</span>
          <span className="card__time">{timeAgo}</span>
        </div>

        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h3 className={`card__title ${featured ? 'card__title--lg' : ''} truncate-2`}>
            {article.title}
          </h3>
        </a>

        {featured && article.description && (
          <p className="card__desc truncate-3">{article.description}</p>
        )}

        <div className="card__footer">
          {article.author && article.author !== 'Unknown' && (
            <span className="card__author">By {article.author}</span>
          )}
          <button
            className={`card__bookmark ${saved ? 'saved' : ''}`}
            onClick={() => bookmarkArticle(article)}
            title={saved ? 'Remove from saved' : 'Save article'}
          >
            {saved ? '🔖' : '🔖'}
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
