# 📰 NewsFlow — News Aggregator System

> Full-stack real-time news aggregator built with React.js, Node.js/Express, and MongoDB  
> Roll No: 23BQ1A05B9 · 23BQ1A0577 · 23BQ1A0578 · 23BQ1A0580

---

## 🏗 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React.js 18, React Router v6, Axios     |
| Backend   | Node.js, Express.js, express-rate-limit |
| Database  | MongoDB + Mongoose ODM                  |
| News Data | NewsAPI.org (REST)                      |
| Styling   | Custom CSS (no UI library)              |

---

## 📁 Project Structure

```
news-aggregator/
├── backend/
│   ├── config/
│   │   └── db.js               ← MongoDB connection
│   ├── models/
│   │   ├── Preference.js       ← User preferences schema
│   │   └── SavedArticle.js     ← Saved articles schema
│   ├── routes/
│   │   ├── news.js             ← /api/news/* (NewsAPI proxy)
│   │   ├── preferences.js      ← /api/preferences/:sessionId
│   │   └── saved.js            ← /api/saved/:sessionId
│   ├── .env.example            ← Environment variables template
│   ├── package.json
│   └── server.js               ← Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── ArticleCard.js  ← News card with bookmark
        │   ├── CategoryBar.js  ← Horizontal category tabs
        │   ├── Navbar.js       ← Search + region selector
        │   ├── SkeletonCard.js ← Loading placeholders
        │   └── TrendingBar.js  ← Sidebar trending list
        ├── context/
        │   └── NewsContext.js  ← Global state (articles, prefs, saved)
        ├── pages/
        │   ├── Home.js         ← Main feed with featured article
        │   ├── Search.js       ← Search results page
        │   └── Saved.js        ← Bookmarked articles
        ├── services/
        │   └── api.js          ← All API calls (Axios)
        ├── App.js              ← Router + theme toggle
        └── index.js
```

---

## ⚙️ Setup Instructions

### Step 1 — Get a Free NewsAPI Key

1. Visit **https://newsapi.org/register**
2. Sign up for a free account
3. Copy your API key from the dashboard

---

### Step 2 — Backend Setup

```bash
cd news-aggregator/backend
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env`:
```env
NEWS_API_KEY=your_actual_api_key_here
MONGODB_URI=mongodb://localhost:27017/newsaggregator
PORT=5000
CLIENT_URL=http://localhost:3000
```

**Start MongoDB** (if running locally):
```bash
mongod --dbpath /data/db
```

**Run the backend:**
```bash
npm run dev      # development (nodemon)
# or
npm start        # production
```

Server starts at: `http://localhost:5000`

---

### Step 3 — Frontend Setup

```bash
cd news-aggregator/frontend
npm install
npm start
```

App opens at: `http://localhost:3000`

> The frontend proxies all `/api/*` calls to `http://localhost:5000` automatically (configured in package.json).

---

## 🔌 REST API Reference

### News Endpoints

| Method | Endpoint                     | Description                        |
|--------|------------------------------|------------------------------------|
| GET    | `/api/news/top-headlines`    | Fetch headlines by category/country |
| GET    | `/api/news/search`           | Full-text search across all news    |
| GET    | `/api/news/trending`         | Top 5 trending articles             |

**Query Params for `/top-headlines`:**
- `category` — general, technology, sports, business, entertainment, health, science
- `country`  — us, in, gb, au, ca, de, fr, jp
- `page`     — pagination (default: 1)
- `pageSize` — articles per page (default: 20)

---

### Preferences Endpoints

| Method | Endpoint                        | Description                  |
|--------|---------------------------------|------------------------------|
| GET    | `/api/preferences/:sessionId`   | Get user preferences         |
| PUT    | `/api/preferences/:sessionId`   | Update user preferences      |

**Body (PUT):**
```json
{
  "categories": ["technology", "sports"],
  "country": "in",
  "theme": "dark"
}
```

---

### Saved Articles Endpoints

| Method | Endpoint                              | Description                |
|--------|---------------------------------------|----------------------------|
| GET    | `/api/saved/:sessionId`               | Get all saved articles     |
| POST   | `/api/saved/:sessionId`               | Save an article            |
| DELETE | `/api/saved/:sessionId/:articleId`    | Remove a saved article     |
| GET    | `/api/saved/:sessionId/check/:id`     | Check if article is saved  |

---

## 🖥 Features

- ✅ Real-time news from NewsAPI across 7 categories
- ✅ Region-based filtering (8 countries)
- ✅ Full-text search across all news
- ✅ Article bookmarking (saved to MongoDB)
- ✅ User preferences persisted to MongoDB
- ✅ Dark / Light theme toggle
- ✅ Responsive design (mobile-friendly)
- ✅ Skeleton loading states
- ✅ Rate limiting on backend (100 req/15min)
- ✅ Featured article layout on homepage
- ✅ Trending news sidebar

---

## 🔮 Future Extensions (as mentioned in project abstract)

- 🤖 Sentiment analysis on articles (positive/negative/neutral)
- 🎯 Personalized recommendation engine
- 🔐 User authentication (JWT + bcrypt)
- 📊 Reading history & analytics dashboard
- 🌐 Multi-language support

---

## 🛠 MongoDB Collections

### `preferences`
```json
{
  "sessionId": "sess_abc123",
  "categories": ["technology", "sports"],
  "country": "in",
  "theme": "dark",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### `savedarticles`
```json
{
  "sessionId": "sess_abc123",
  "articleId": "base64_encoded_url",
  "title": "Article Title",
  "description": "...",
  "url": "https://...",
  "urlToImage": "https://...",
  "source": "BBC News",
  "publishedAt": "2024-01-01T...",
  "category": "technology"
}
```
