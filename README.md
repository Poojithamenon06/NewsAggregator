# 📰 NewsAggregator — Setup Guide

## ⚡ Quick Start

### 1. Get your GNews API key (FREE, takes 30 seconds)
1. Go to **https://gnews.io/register**
2. Create a free account
3. Copy your API key from the dashboard
4. Free plan: **100 requests/day**, **real-time news** (minutes delay, NOT 24hrs like NewsAPI)

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Open .env and paste your GNews API key as GNEWS_API_KEY=xxxxx
npm install
npm run dev        # → http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start          # → http://localhost:3000
```

### 4. Start MongoDB
```bash
mongod             # in a separate terminal
```

---

## 🔑 .env file (backend/.env)
```
GNEWS_API_KEY=your_gnews_key_here
MONGODB_URI=mongodb://localhost:27017/newsaggregator
JWT_SECRET=any_long_random_string_here
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## ❓ Why GNews instead of NewsAPI.org?
| | NewsAPI.org (free) | GNews (free) |
|---|---|---|
| News delay | **24 hours behind** | **Minutes** |
| Global coverage | ~54 countries, US-heavy | **60+ countries, truly global** |
| Country filter on search | ❌ No | ✅ Yes |
| Requests/day free | 100 | 100 |

---

## 📊 What's stored in MongoDB
| Collection | What |
|---|---|
| `users` | Accounts, bcrypt passwords, preferences |
| `savedarticles` | Bookmarked articles (full copy so links never break) |
| `newscaches` | GNews API responses cached 5 min (saves API quota) |
| `searchhistories` | Every user search — supports per-entry delete + clear all |
