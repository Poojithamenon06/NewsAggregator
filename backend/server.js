require('dotenv').config();
console.log('API KEY LOADED:', process.env.GNEWS_API_KEY);
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();
app.set('trust proxy', 1);
connectDB();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'news-aggregator-poojithamenon06s-projects.vercel.app',
    'https://newsaggregator.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));
app.use('/api/saved', require('./routes/saved'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
