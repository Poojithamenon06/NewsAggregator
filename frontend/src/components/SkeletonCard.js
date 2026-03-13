import React from 'react';
import './SkeletonCard.css';

function SkeletonCard() {
  return (
    <div className="skel-card">
      <div className="skeleton skel-img" />
      <div className="skel-body">
        <div className="skeleton skel-meta" />
        <div className="skeleton skel-line skel-line--lg" />
        <div className="skeleton skel-line" />
        <div className="skeleton skel-line skel-line--sm" />
      </div>
    </div>
  );
}
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="skel-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
export default SkeletonCard;
