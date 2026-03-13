// ─── backend/routes/auth.js ───────────────────────────────────────────────────
const express       = require('express');
const jwt           = require('jsonwebtoken');
const User          = require('../models/User');
const SearchHistory = require('../models/SearchHistory');
const { protect }   = require('../middleware/auth');

const router = express.Router();
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ error: 'An account with this email already exists.' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: 'Account created!', token: signToken(user._id), user: user.toSafeObject() });
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Provide email and password.' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password.' });
    res.json({ message: 'Login successful!', token: signToken(user._id), user: user.toSafeObject() });
  } catch { res.status(500).json({ error: 'Login failed.' }); }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: req.user.toSafeObject() }));

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    res.json({ message: 'Profile updated!', user: user.toSafeObject() });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ error: 'Current password is incorrect.' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed!' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// POST /api/auth/search-history  — save search entry (no dups)
router.post('/search-history', protect, async (req, res) => {
  try {
    const { query, country, category } = req.body;
    if (!query?.trim() && !country) return res.status(200).json({ message: 'skip' });
    // Skip if same as last entry
    const last = await SearchHistory.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (last && last.query === (query?.trim() || '') && last.country === (country || ''))
      return res.status(200).json({ message: 'dup' });
    await SearchHistory.create({
      userId:   req.user._id,
      query:    query?.trim() || '',
      country:  country  || '',
      category: category || 'general',
    });
    res.status(201).json({ message: 'Saved.' });
  } catch { res.status(200).json({ message: 'ok' }); }
});

// GET /api/auth/search-history
router.get('/search-history', protect, async (req, res) => {
  try {
    const history = await SearchHistory
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('_id query country category createdAt');
    res.json({ history });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/auth/search-history/:id — delete one entry
router.delete('/search-history/:id', protect, async (req, res) => {
  try {
    await SearchHistory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/auth/search-history — clear all
router.delete('/search-history', protect, async (req, res) => {
  try {
    await SearchHistory.deleteMany({ userId: req.user._id });
    res.json({ message: 'History cleared.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
