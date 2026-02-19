// ─── routes/saved.js ──────────────────────────────────────────────────────────
const express = require('express');
const SavedArticle = require('../models/SavedArticle');
const router = express.Router();

// ── GET /api/saved/:sessionId ─────────────────────────────────────────────────
router.get('/:sessionId', async (req, res) => {
  try {
    const articles = await SavedArticle.find({ sessionId: req.params.sessionId })
      .sort({ createdAt: -1 });
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/saved/:sessionId ────────────────────────────────────────────────
router.post('/:sessionId', async (req, res) => {
  try {
    const article = new SavedArticle({
      sessionId: req.params.sessionId,
      ...req.body,
    });

    await article.save();
    res.status(201).json({ message: 'Article saved', article });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Article already saved' });
    }
    res.status(400).json({ error: error.message });
  }
});

// ── DELETE /api/saved/:sessionId/:articleId ───────────────────────────────────
router.delete('/:sessionId/:articleId', async (req, res) => {
  try {
    const result = await SavedArticle.findOneAndDelete({
      sessionId: req.params.sessionId,
      articleId: req.params.articleId,
    });

    if (!result) return res.status(404).json({ error: 'Saved article not found' });

    res.json({ message: 'Article removed from saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/saved/:sessionId/check/:articleId ────────────────────────────────
router.get('/:sessionId/check/:articleId', async (req, res) => {
  try {
    const exists = await SavedArticle.exists({
      sessionId: req.params.sessionId,
      articleId: req.params.articleId,
    });
    res.json({ saved: !!exists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
