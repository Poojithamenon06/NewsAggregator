// ─── models/Preference.js ─────────────────────────────────────────────────────
const mongoose = require('mongoose');

const PreferenceSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    categories: {
      type: [String],
      default: ['general'],
      enum: ['general', 'technology', 'sports', 'business', 'entertainment', 'health', 'science', 'politics'],
    },
    country: {
      type: String,
      default: 'us',
      enum: ['us', 'in', 'gb', 'au', 'ca', 'de', 'fr', 'jp', 'cn', 'ae'],
    },
    language: {
      type: String,
      default: 'en',
    },
    theme: {
      type: String,
      default: 'dark',
      enum: ['dark', 'light'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Preference', PreferenceSchema);
