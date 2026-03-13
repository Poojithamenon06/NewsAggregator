// ─── backend/routes/news.js ───────────────────────────────────────────────────
// GNews API — global real-time news
// KEY FIX for "air pollution Delhi" type searches:
//   • When searching for location-specific topics, we intelligently expand
//     the query with the location name when a country code is provided
//   • We also try WITHOUT the country filter as fallback if results < 3
//   • lang filter removed on search to get more global results
const express    = require('express');
const axios      = require('axios');
const crypto     = require('crypto');
const { protect } = require('../middleware/auth');
const NewsCache  = require('../models/NewsCache');

const router  = express.Router();
const API_KEY = process.env.GNEWS_API_KEY;
const BASE    = 'https://gnews.io/api/v4';
const gNews   = axios.create({ baseURL: BASE, timeout: 12000 });

const CACHE_TTL  = 5 * 60 * 1000; // 5 minutes
const timeBucket = () => Math.floor(Date.now() / CACHE_TTL);

// Full GNews country list
const COUNTRY_MAP = {
  ae:'UAE',            ar:'Argentina',      at:'Austria',        au:'Australia',
  be:'Belgium',        bg:'Bulgaria',       br:'Brazil',         ca:'Canada',
  ch:'Switzerland',    cl:'Chile',          cn:'China',          co:'Colombia',
  cu:'Cuba',           cz:'Czech Republic', de:'Germany',        dk:'Denmark',
  eg:'Egypt',          es:'Spain',          fi:'Finland',        fr:'France',
  gb:'United Kingdom', gr:'Greece',         hk:'Hong Kong',      hr:'Croatia',
  hu:'Hungary',        id:'Indonesia',      ie:'Ireland',        il:'Israel',
  in:'India',          it:'Italy',          jp:'Japan',          ke:'Kenya',
  kr:'South Korea',    lk:'Sri Lanka',      lt:'Lithuania',      lv:'Latvia',
  ma:'Morocco',        mx:'Mexico',         my:'Malaysia',       ng:'Nigeria',
  nl:'Netherlands',    no:'Norway',         nz:'New Zealand',    pe:'Peru',
  ph:'Philippines',    pk:'Pakistan',       pl:'Poland',         pt:'Portugal',
  ro:'Romania',        rs:'Serbia',         ru:'Russia',         sa:'Saudi Arabia',
  se:'Sweden',         sg:'Singapore',      si:'Slovenia',       sk:'Slovakia',
  th:'Thailand',       tr:'Turkey',         tw:'Taiwan',         ua:'Ukraine',
  us:'United States',  ve:'Venezuela',      za:'South Africa',   za:'South Africa',
};

const CATEGORY_MAP = {
  general:'general', technology:'technology', business:'business',
  sports:'sports',   entertainment:'entertainment', health:'health', science:'science',
};

async function cachedFetch(key, fn) {
  try {
    const hit = await NewsCache.findOne({ key });
    if (hit && Date.now() - new Date(hit.fetchedAt).getTime() < CACHE_TTL) return hit.data;
  } catch {}
  const data = await fn();
  NewsCache.findOneAndUpdate({ key }, { key, data, fetchedAt: new Date() }, { upsert: true }).catch(() => {});
  return data;
}

const normalize = (a) => ({
  id:          crypto.createHash('md5').update(a.url || a.title || String(Math.random())).digest('hex'),
  title:       a.title       || 'Untitled',
  description: a.description || '',
  url:         a.url,
  urlToImage:  a.image       || null,
  source:      a.source?.name || 'Unknown',
  sourceUrl:   a.source?.url  || null,
  publishedAt: a.publishedAt,
  content:     a.content     || '',
});

const clean = (arr = []) =>
  arr.filter(a => a?.title && a?.url)
     .map(normalize)
     .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

// ── GET /api/news/top-headlines ───────────────────────────────────────────────
router.get('/top-headlines', protect, async (req, res) => {
  try {
    let { category = 'general', country = 'us', page = 1, pageSize = 10 } = req.query;
    category = CATEGORY_MAP[category] ? category : 'general';
    country  = COUNTRY_MAP[country]   ? country  : 'us';
    page     = Math.max(1, parseInt(page) || 1);
    pageSize = Math.min(10, Math.max(1, parseInt(pageSize) || 10));

    const cacheKey = `hl:${country}:${category}:${page}:${timeBucket()}`;
    const data = await cachedFetch(cacheKey, () =>
      gNews.get('/top-headlines', {
        params: { category: CATEGORY_MAP[category], country, lang: 'en', max: pageSize, page, token: API_KEY },
      }).then(r => r.data)
    );

    res.json({
      status: 'ok', category, country,
      countryName:  COUNTRY_MAP[country],
      page:         parseInt(page),
      totalResults: data.totalArticles || 0,
      articles:     clean(data.articles || []),
      fetchedAt:    new Date().toISOString(),
    });
  } catch (err) { handleError(err, res); }
});

// ── GET /api/news/search ──────────────────────────────────────────────────────
// FIX: "air pollution Delhi" — when query contains a city/location, we do NOT
// restrict by country code (which limits results). Instead we search globally
// and let the query itself filter. This gives far more results.
router.get('/search', protect, async (req, res) => {
  try {
    let { q = '', country = '', sortBy = 'publishedAt', page = 1, pageSize = 10 } = req.query;
    if (!q.trim()) return res.status(400).json({ error: 'Query "q" is required.' });

    const gnewsSort = sortBy === 'relevancy' ? 'relevance' : 'publishedAt';
    page     = Math.max(1, parseInt(page) || 1);
    pageSize = Math.min(10, Math.max(1, parseInt(pageSize) || 10));

    // Smart query expansion: if country selected, append country name to query
    // so "air pollution" + country=in becomes "air pollution India"
    // This works better than the API country filter for topic-based searches
    let searchQ = q.trim();
    if (country && COUNTRY_MAP[country]) {
      const countryName = COUNTRY_MAP[country];
      // Only add country name if not already in query
      if (!searchQ.toLowerCase().includes(countryName.toLowerCase())) {
        searchQ = `${searchQ} ${countryName}`;
      }
    }

    const cacheKey = `search:${searchQ}:${gnewsSort}:${page}:${timeBucket()}`;

    // First attempt: global search with expanded query (no country restriction)
    let data = await cachedFetch(cacheKey, () =>
      gNews.get('/search', {
        params: {
          q:      searchQ,
          sortby: gnewsSort,
          max:    pageSize,
          page,
          token:  API_KEY,
          // No lang filter — gets more global results
        },
      }).then(r => r.data)
    );

    // Fallback: if still <3 results and country was specified, try original query
    if ((data.articles || []).length < 3 && country && searchQ !== q.trim()) {
      const fallbackKey = `search:${q.trim()}:${gnewsSort}:${page}:${timeBucket()}`;
      const fallback = await cachedFetch(fallbackKey, () =>
        gNews.get('/search', {
          params: { q: q.trim(), sortby: gnewsSort, max: pageSize, page, token: API_KEY },
        }).then(r => r.data)
      );
      if ((fallback.articles || []).length > (data.articles || []).length) data = fallback;
    }

    res.json({
      status:       'ok',
      query:        q,
      searchQuery:  searchQ,
      country:      country || null,
      countryName:  country ? COUNTRY_MAP[country] : null,
      sortBy,
      page:         parseInt(page),
      totalResults: data.totalArticles || 0,
      articles:     clean(data.articles || []),
      fetchedAt:    new Date().toISOString(),
    });
  } catch (err) { handleError(err, res); }
});

// ── GET /api/news/trending ────────────────────────────────────────────────────
router.get('/trending', protect, async (req, res) => {
  try {
    const cacheKey = `trending:${timeBucket()}`;
    const data = await cachedFetch(cacheKey, () =>
      gNews.get('/top-headlines', {
        params: { category: 'general', lang: 'en', max: 6, token: API_KEY },
      }).then(r => r.data)
    );
    res.json({ status: 'ok', articles: clean(data.articles || []).slice(0, 6) });
  } catch (err) { handleError(err, res); }
});

// ── GET /api/news/countries ───────────────────────────────────────────────────
router.get('/countries', (req, res) => {
  res.json({
    status: 'ok',
    countries: Object.entries(COUNTRY_MAP).map(([code, name]) => ({ code, name })),
  });
});

function handleError(err, res) {
  if (err.response) {
    const s = err.response.status;
    const m = err.response.data?.errors?.[0] || err.response.data?.message || 'GNews error';
    if (s === 403) return res.status(403).json({ error: 'Invalid GNEWS_API_KEY in .env' });
    if (s === 429) return res.status(429).json({ error: 'GNews rate limit (100/day). Try again tomorrow.' });
    return res.status(s).json({ error: m });
  }
  if (err.code === 'ECONNABORTED') return res.status(504).json({ error: 'GNews timed out.' });
  console.error('news route:', err.message);
  res.status(500).json({ error: 'Failed to fetch news.' });
}

module.exports = router;
