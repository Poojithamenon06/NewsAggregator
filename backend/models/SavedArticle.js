// ─── models/SavedArticle.js ───────────────────────────────────────────────────
//
//  What this stores in MongoDB:
//  ────────────────────────────
//  When a user clicks 🔖 "Save" on any article, a document is inserted here.
//  Since NewsAPI doesn't store articles permanently, we copy the full article
//  data into our own DB so bookmarks never break (even if NewsAPI removes it).
//
//  Collection: savedarticles
//  Documents look like:
//    {
//      userId:      ObjectId("..."),    ← which logged-in user saved it
//      articleId:   "base64shortid",    ← unique article identifier
//      title:       "Article headline",
//      description: "Short summary...",
//      url:         "https://...",
//      urlToImage:  "https://img.jpg",
//      source:      "BBC News",
//      author:      "John Smith",
//      publishedAt: ISODate("..."),
//      category:    "technology",
//      country:     "us",
//      savedAt:     ISODate("..."),
//    }
//
const mongoose = require('mongoose');

const SavedArticleSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId:   { type: String, index: true }, // fallback for non-auth sessions
    articleId:   { type: String, required: true },
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    url:         { type: String, required: true },
    urlToImage:  { type: String, default: null },
    source:      { type: String, default: 'Unknown' },
    author:      { type: String, default: null },
    publishedAt: { type: Date },
    category:    { type: String, default: 'general' },
    country:     { type: String, default: 'us' },
  },
  { timestamps: true }
);

// Prevent duplicate saves per user
SavedArticleSchema.index({ userId: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('SavedArticle', SavedArticleSchema);
