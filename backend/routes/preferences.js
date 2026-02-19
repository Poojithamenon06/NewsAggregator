// ─── routes/preferences.js ────────────────────────────────────────────────────
const express = require('express');
const Preference = require('../models/Preference');
const router = express.Router();

// ── GET /api/preferences/:sessionId ──────────────────────────────────────────
router.get('/:sessionId', async (req, res) => {
  try {
    let pref = await Preference.findOne({ sessionId: req.params.sessionId });

    if (!pref) {
      // Return defaults if not found (don't create yet)
      return res.json({
        sessionId: req.params.sessionId,
        categories: ['general'],
        country: 'us',
        language: 'en',
        theme: 'dark',
      });
    }

    res.json(pref);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/preferences/:sessionId ──────────────────────────────────────────
router.put('/:sessionId', async (req, res) => {
  try {
    const { categories, country, language, theme } = req.body;

    const pref = await Preference.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { categories, country, language, theme },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(pref);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
