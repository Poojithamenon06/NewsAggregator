// ─── routes/saved.js ──────────────────────────────────────────────────────────
const express      = require('express');
const SavedArticle = require('../models/SavedArticle');
const { protect }  = require('../middleware/auth');
const router       = express.Router();

// All saved routes require login
router.use(protect);

// GET /api/saved  — get all saved articles for the logged-in user
router.get('/', async (req, res) => {
  try {
    const articles = await SavedArticle
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ articles, count: articles.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/saved  — save an article
router.post('/', async (req, res) => {
  try {
    const article = await SavedArticle.create({
      userId: req.user._id,
      ...req.body,
    });
    res.status(201).json({ message: 'Article saved!', article });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Article already saved.' });
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/saved/:articleId  — unsave an article
router.delete('/:articleId', async (req, res) => {
  try {
    const result = await SavedArticle.findOneAndDelete({
      userId:    req.user._id,
      articleId: req.params.articleId,
    });
    if (!result) return res.status(404).json({ error: 'Not found.' });
    res.json({ message: 'Removed from saved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/saved/ids  — return only saved articleIds (fast check)
router.get('/ids', async (req, res) => {
  try {
    const docs = await SavedArticle.find({ userId: req.user._id }, 'articleId');
    res.json({ ids: docs.map(d => d.articleId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
