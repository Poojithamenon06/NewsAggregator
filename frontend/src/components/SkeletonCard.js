// ─── src/components/SkeletonCard.js ──────────────────────────────────────────
import React from 'react';
import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skel-card">
      <div className="skeleton skel-card__img" />
      <div className="skel-card__body">
        <div className="skeleton skel-card__meta" />
        <div className="skeleton skel-card__title" />
        <div className="skeleton skel-card__title skel-card__title--short" />
        <div className="skeleton skel-card__footer" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
