// ─── routes/news.js ───────────────────────────────────────────────────────────
const express = require('express');
const axios = require('axios');
const router = express.Router();

const NEWS_API_BASE = 'https://newsapi.org/v2';
const API_KEY = process.env.NEWS_API_KEY;

const newsApi = axios.create({ baseURL: NEWS_API_BASE, params: { apiKey: API_KEY } });

// Category → keyword mapping for reliable results regardless of region
const CATEGORY_KEYWORDS = {
  general:       'breaking news',
  technology:    'technology artificial intelligence',
  business:      'business economy finance',
  sports:        'sports football cricket',
  entertainment: 'entertainment movies celebrities',
  health:        'health medicine wellness',
  science:       'science research discovery',
};

// ── GET /api/news/top-headlines ───────────────────────────────────────────────
// Uses /everything with English language for consistent global coverage
router.get('/top-headlines', async (req, res) => {
  try {
    const { category = 'general', page = 1, pageSize = 20, q } = req.query;
    const keyword = q || CATEGORY_KEYWORDS[category] || 'news';

    const { data } = await newsApi.get('/everything', {
      params: {
        q: keyword,
        language: 'en',
        sortBy: 'publishedAt',
        page,
        pageSize,
      },
    });

    res.json({
      status: 'ok',
      totalResults: data.totalResults,
      articles: data.articles.filter(a => a.title && a.title !== '[Removed]').map(normalizeArticle),
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// ── GET /api/news/search ──────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const { q, sortBy = 'publishedAt', page = 1, pageSize = 20 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query "q" is required' });

    const { data } = await newsApi.get('/everything', {
      params: { q, sortBy, page, pageSize, language: 'en' },
    });

    res.json({
      status: 'ok',
      totalResults: data.totalResults,
      articles: data.articles.filter(a => a.title && a.title !== '[Removed]').map(normalizeArticle),
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// ── GET /api/news/trending ────────────────────────────────────────────────────
router.get('/trending', async (req, res) => {
  try {
    const { data } = await newsApi.get('/everything', {
      params: { q: 'breaking news today', language: 'en', sortBy: 'popularity', pageSize: 5 },
    });

    res.json({
      status: 'ok',
      articles: data.articles.filter(a => a.title && a.title !== '[Removed]').map(normalizeArticle),
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

function normalizeArticle(article, index) {
  return {
    id: Buffer.from(article.url || String(index)).toString('base64').slice(0, 32),
    title: article.title || 'Untitled',
    description: article.description || '',
    url: article.url,
    urlToImage: article.urlToImage,
    source: article.source?.name || 'Unknown',
    author: article.author || 'Unknown',
    publishedAt: article.publishedAt,
    content: article.content || '',
  };
}

function handleApiError(error, res) {
  if (error.response) {
    return res.status(error.response.status).json({ error: error.response.data?.message || 'NewsAPI error' });
  }
  res.status(500).json({ error: 'Failed to fetch news. Check your API key.' });
}

module.exports = router;
