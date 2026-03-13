// ─── models/SearchHistory.js ──────────────────────────────────────────────────
// Stores every search a user makes. Supports per-entry delete + clear-all.
const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    query:    { type: String, default: '' },
    country:  { type: String, default: '' },   // country code e.g. "in"
    category: { type: String, default: 'general' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
