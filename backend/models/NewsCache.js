// ─── models/NewsCache.js ──────────────────────────────────────────────────────
// Caches GNews API responses for 5 minutes to conserve the 100 req/day limit.
// TTL index auto-deletes stale entries after 30 minutes.
const mongoose = require('mongoose');

const NewsCacheSchema = new mongoose.Schema({
  key:       { type: String, required: true, unique: true, index: true },
  data:      { type: mongoose.Schema.Types.Mixed, required: true },
  fetchedAt: { type: Date, default: Date.now },
});

NewsCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 1800 });

module.exports = mongoose.model('NewsCache', NewsCacheSchema);
