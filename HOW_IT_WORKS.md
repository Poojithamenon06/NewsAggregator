# 📰 NewsFlow — How It Works & What's Stored in MongoDB

---

## 🏗️ Architecture Overview

```
Browser (React)  ←→  Express API (Node.js)  ←→  MongoDB
                          ↕
                    NewsAPI.org (external)
```

**Request flow:**
1. User opens the app → React checks localStorage for JWT token
2. If token exists → calls `GET /api/auth/me` to restore session
3. User picks a category + country → React calls `GET /api/news/top-headlines`
4. Express checks MongoDB cache (NewsCache) first
5. If cache is stale (>15 min) → Express calls NewsAPI.org
6. Response is stored in cache and returned to React
7. React renders the articles

---

## 📡 How NewsAPI Is Used

### Endpoint 1 — Real-Time Headlines
```
NewsAPI: GET /v2/top-headlines?country=us&category=technology&page=1&pageSize=20
```
- Used for: The main news feed (home page)
- **country** = the region you select in the navbar (us, in, gb, etc.)
- **category** = the tab you click (technology, sports, business…)
- **sortBy** = always `publishedAt` → newest articles always appear first
- Returns: up to 100 articles per category/country (NewsAPI free plan limit)

### Endpoint 2 — Search (Full Text)
```
NewsAPI: GET /v2/everything?q=climate+change+India&language=en&sortBy=publishedAt
```
- Used for: The Search page
- **q** = your keyword + region name combined (e.g. "AI technology India")
- This gives region-aware results even though `/everything` has no country filter
- User can sort by: Newest First / Most Popular / Most Relevant
- Language is always `en` for consistent results

### Endpoint 3 — Trending Sidebar
```
NewsAPI: GET /v2/top-headlines?country=us&pageSize=5
```
- Used for: The 🔥 Trending Now sidebar widget
- Always fetches the top 5 US headlines
- Cached for 15 minutes

### Endpoint 4 — News Sources
```
NewsAPI: GET /v2/top-headlines/sources?category=technology&country=us
```
- Used for: Showing available sources per region/category
- Helps users understand which publishers are available

---

## 🗄️ What Is Stored in MongoDB

MongoDB database name: **newsaggregator**

### Collection 1: `users`
Stores registered user accounts.

```json
{
  "_id": "ObjectId(...)",
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "$2b$12$hashedpassword...",   ← bcrypt hashed, never plain text
  "preferences": {
    "categories": ["technology", "sports"],
    "country": "in",
    "theme": "dark"
  },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```
**Why:** Stores login credentials and personalisation preferences.

---

### Collection 2: `savedarticles`
Stores articles the user bookmarks (🔖 button).

```json
{
  "_id": "ObjectId(...)",
  "userId": "ObjectId(...)",         ← links to users collection
  "articleId": "aGVsbG8gd29ybGQ",   ← base64 encoded URL (unique ID)
  "title": "NASA Discovers New Exoplanet",
  "description": "Scientists have found...",
  "url": "https://bbc.com/science/...",
  "urlToImage": "https://img.bbc.com/...",
  "source": "BBC News",
  "author": "Sarah Johnson",
  "publishedAt": "2024-01-15T08:30:00Z",
  "category": "science",
  "country": "gb",
  "createdAt": "2024-01-15T10:05:00Z"
}
```
**Why:** NewsAPI does NOT store articles permanently. If we only kept URLs, bookmarks would break when NewsAPI removes old articles. By copying the full article into MongoDB, saved articles are always accessible.

---

### Collection 3: `newscaches`
Caches NewsAPI responses to avoid hitting rate limits.

```json
{
  "_id": "ObjectId(...)",
  "key": "headlines:in:technology:1",  ← cache key (country:category:page)
  "data": {
    "articles": [...],                 ← full NewsAPI response stored here
    "totalResults": 38
  },
  "fetchedAt": "2024-01-15T10:00:00Z"
}
```
**Why:** NewsAPI free plan allows only **100 requests/day**. Without caching, 10 users browsing the same category would use 10 requests. With caching, all 10 users share 1 cached response for 15 minutes.
Documents auto-delete after 1 hour (MongoDB TTL index).

---

### Collection 4: `searchhistories`
Logs every search a user performs.

```json
{
  "_id": "ObjectId(...)",
  "userId": "ObjectId(...)",
  "query": "stock market crash",
  "region": "us",
  "category": "business",
  "createdAt": "2024-01-15T10:10:00Z"
}
```
**Why:** Powers the "Recent Searches" feature on the search page and profile history.

---

## 🔐 How Authentication Works

```
1. REGISTER:
   User fills form → POST /api/auth/register
   → Password hashed with bcrypt (12 salt rounds)
   → User saved to MongoDB
   → JWT token generated (expires in 7 days)
   → Token stored in browser localStorage

2. LOGIN:
   User fills form → POST /api/auth/login
   → Email looked up in MongoDB
   → bcrypt.compare(entered password, stored hash)
   → If match: JWT token returned
   → Token stored in localStorage

3. EVERY API CALL (after login):
   React attaches header: Authorization: Bearer <token>
   → Express middleware (auth.js) verifies JWT
   → If valid: req.user = user object
   → If invalid/expired: 401 error → user redirected to /auth

4. SESSION RESTORE:
   On app load → check localStorage for token
   → If found: call GET /api/auth/me
   → If valid: restore user session silently
   → If expired: clear token, redirect to login
```

---

## 🔄 News Sorting Logic

Articles are sorted by **publishedAt (newest first)** at the backend level:

```javascript
articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
```

On the Search page, user can change sort order:
- **Newest First** → `sortBy=publishedAt` (default)
- **Most Popular** → `sortBy=popularity` (based on NewsAPI engagement metrics)
- **Most Relevant** → `sortBy=relevancy` (based on keyword match score)

---

## 🌍 How Region-Based News Works

### Homepage (category tabs):
```
User selects 🇮🇳 India + 💻 Technology tab
→ GET /api/news/top-headlines?country=in&category=technology
→ NewsAPI returns Indian tech news specifically
→ Results sorted by publishedAt (newest first)
```

### Search with region filter:
```
User types "cricket" + selects 🇮🇳 India
→ GET /api/news/search?q=cricket&region=in
→ Backend builds query: "cricket India"
→ NewsAPI /everything returns cricket+India articles
→ User sees Indian cricket news
```

The reason we combine keyword + country name as a text query for `/everything` is that the NewsAPI `/everything` endpoint does NOT support a `country` parameter — only `/top-headlines` does. So injecting the country name as a keyword is the most reliable way to get region-relevant search results.

---

## 📊 Data Flow Diagram

```
[User clicks "Technology" + "🇮🇳 India"]
          ↓
[React: fetchHeadlines({category:'technology', country:'in'})]
          ↓
[Express: GET /api/news/top-headlines?category=technology&country=in]
          ↓
[Check MongoDB NewsCache for key "headlines:in:technology:1"]
          ↓
    ┌─────┴─────┐
  [HIT]      [MISS / STALE]
    ↓              ↓
[Return      [Call NewsAPI:
 cached       /v2/top-headlines
 data]         ?country=in
               &category=technology]
                   ↓
              [Save to NewsCache]
                   ↓
              [Return to React]
          ↓
[React sorts by publishedAt DESC]
          ↓
[Render ArticleCards in grid]
```

---

## 🗂️ MongoDB Collections Summary Table

| Collection       | Purpose                          | Auto-Delete |
|------------------|----------------------------------|-------------|
| `users`          | Accounts, hashed passwords, prefs | Never       |
| `savedarticles`  | User bookmarks (full article copy)| Never       |
| `newscaches`     | NewsAPI response cache (15 min)   | After 1 hr  |
| `searchhistories`| User search logs                  | Never       |
