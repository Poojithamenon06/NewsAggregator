// ─── models/SavedArticle.js ───────────────────────────────────────────────────
const mongoose = require('mongoose');

const SavedArticleSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    articleId: {
      type: String,
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    urlToImage: { type: String },
    source: { type: String },
    author: { type: String },
    publishedAt: { type: Date },
    category: { type: String, default: 'general' },
  },
  { timestamps: true }
);

// Prevent duplicate saves per session
SavedArticleSchema.index({ sessionId: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('SavedArticle', SavedArticleSchema);
