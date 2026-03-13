import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { searchArticles, logSearch, getSearchHistory, deleteSearchEntry, clearSearchHistory } from '../services/api';
import { COUNTRIES } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import './Search.css';

const SORT_OPTS = [
  { v: 'publishedAt', l: 'Newest First' },
  { v: 'relevancy',   l: 'Most Relevant' },
];

function timeAgo(d){if(!d)return'';const m=Math.floor((Date.now()-new Date(d))/60000);if(m<1)return'now';if(m<60)return`${m}m ago`;const h=Math.floor(m/60);if(h<24)return`${h}h ago`;return`${Math.floor(h/24)}d ago`;}

export default function Search() {
  const [sp] = useSearchParams();
  const nav  = useNavigate();
  const { user } = useAuth();
  const initQ = sp.get('q') || '';

  const [q,           setQ]           = useState(initQ);
  const [country,     setCountry]     = useState('');
  const [sortBy,      setSortBy]      = useState('publishedAt');
  const [cq,          setCq]          = useState('');
  const [showCDrop,   setShowCDrop]   = useState(false);
  const [focused,     setFocused]     = useState(false);
  const [history,     setHistory]     = useState([]);
  const [articles,    setArticles]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [error,       setError]       = useState('');
  const [fetchedAt,   setFetchedAt]   = useState(null);

  const inputRef  = useRef();
  const wrapRef   = useRef();
  const cRef      = useRef();

  const loadHist = useCallback(async () => {
    if (!user) return;
    try { const d = await getSearchHistory(); setHistory(d.history || []); } catch {}
  }, [user]);

  useEffect(() => { loadHist(); }, [loadHist]);

  useEffect(() => {
    const fn = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false);
      if (cRef.current    && !cRef.current.contains(e.target))    { setShowCDrop(false); setCq(''); }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const doSearch = useCallback(async (qv, cv, sv, pg = 1) => {
    if (!qv?.trim()) return;
    setLoading(true); setError(''); setFocused(false);
    try {
      const data = await searchArticles({ q: qv.trim(), country: cv || '', sortBy: sv, page: pg, pageSize: 10 });
      setArticles(pg === 1 ? (data.articles || []) : prev => [...prev, ...(data.articles || [])]);
      setTotal(data.totalResults || 0);
      setFetchedAt(data.fetchedAt || null);
      if (user) { await logSearch({ query: qv.trim(), country: cv || '' }); loadHist(); }
    } catch (e) {
      const msg = e.response?.data?.error || 'Search failed.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  }, [user, loadHist]);

  useEffect(() => {
    if (initQ) { setQ(initQ); doSearch(initQ, country, sortBy, 1); setPage(1); }
  }, [initQ]);

  const submit = (e) => {
    e?.preventDefault();
    if (!q.trim()) { toast.error('Enter a search term.'); return; }
    setPage(1); setArticles([]);
    nav(`/search?q=${encodeURIComponent(q.trim())}`);
    doSearch(q, country, sortBy, 1);
  };

  const onHistClick = (h) => {
    setQ(h.query || ''); setCountry(h.country || ''); setFocused(false);
    setPage(1); setArticles([]);
    doSearch(h.query || '', h.country || '', sortBy, 1);
  };

  const delEntry = async (e, id) => {
    e.stopPropagation();
    await deleteSearchEntry(id);
    setHistory(p => p.filter(h => h._id !== id));
  };
  const clearAll = async () => { await clearSearchHistory(); setHistory([]); toast('History cleared'); };

  const selC = COUNTRIES.find(c => c.code === country);
  const filtC = COUNTRIES.filter(c => c.name.toLowerCase().includes(cq.toLowerCase()) || c.code.toLowerCase().includes(cq.toLowerCase()));
  const dispH = q ? history.filter(h => h.query?.toLowerCase().includes(q.toLowerCase())) : history;
  const showDrop = focused && user && (dispH.length > 0 || q.length > 0);
  const hasMore = articles.length < total;

  return (
    <div className="search-page">
      {/* ── Search header ── */}
      <div className="sp-header">
        <div className="sp-title-row">
          <h1 className="sp-title">Search</h1>
          <span className="sp-subtitle">Real-time news from {COUNTRIES.length}+ countries worldwide</span>
        </div>

        <div className="sp-controls">
          {/* Input */}
          <div className="spi-wrap" ref={wrapRef}>
            <form className={`spi-bar ${focused ? 'spi-bar--open' : ''}`} onSubmit={submit}>
              <svg className="spi-icon" viewBox="0 0 20 20" fill="none" width="16" height="16">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                ref={inputRef} type="text"
                placeholder="e.g. air pollution Delhi, Korea elections, Brazil economy…"
                value={q} onChange={e => setQ(e.target.value)}
                onFocus={() => setFocused(true)} autoComplete="off"
              />
              {q && <button type="button" className="spi-x" onClick={() => { setQ(''); inputRef.current?.focus(); }}>✕</button>}
            </form>

            {showDrop && (
              <div className="spi-drop">
                {dispH.length > 0 && (
                  <>
                    <div className="spid-head">
                      <span>Recent Searches</span>
                      <button onClick={clearAll}>Clear all</button>
                    </div>
                    {dispH.slice(0, 10).map(h => (
                      <div key={h._id} className="spid-row" onClick={() => onHistClick(h)}>
                        <span className="spid-icon">🕐</span>
                        <div className="spid-body">
                          <span className="spid-q">{h.query || '—'}</span>
                          {h.country && <span className="spid-c">{COUNTRIES.find(c=>c.code===h.country)?.flag} {COUNTRIES.find(c=>c.code===h.country)?.name}</span>}
                        </div>
                        <span className="spid-time">{timeAgo(h.createdAt)}</span>
                        <button className="spid-del" onClick={e => delEntry(e, h._id)}>✕</button>
                      </div>
                    ))}
                    {q && <div className="spid-sep"/>}
                  </>
                )}
                {q.trim() && (
                  <div className="spid-row spid-row--go" onClick={submit}>
                    <span className="spid-icon">⌕</span>
                    <span>Search for <strong>"{q}"</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Country */}
          <div className="spc-wrap" ref={cRef}>
            <button className={`spc-btn ${country ? 'spc-btn--on' : ''}`} onClick={() => { setShowCDrop(p=>!p); setCq(''); }}>
              {selC ? <>{selC.flag} {selC.name}</> : '🌍 All Countries'}
              <span className="spc-caret">▾</span>
            </button>
            {showCDrop && (
              <div className="spc-drop">
                <div className="spcd-search">
                  <svg viewBox="0 0 20 20" fill="none" width="13" height="13"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <input type="text" placeholder="Search any country…" value={cq} onChange={e => setCq(e.target.value)} autoFocus />
                  {cq && <button onClick={()=>setCq('')}>✕</button>}
                </div>
                <div className="spcd-list">
                  <button className={`spcd-opt ${!country?'spcd-opt--on':''}`} onClick={() => { setCountry(''); setShowCDrop(false); if(q.trim()) doSearch(q,'',sortBy,1); }}>
                    <span>🌍</span><span>All Countries (Global)</span>
                  </button>
                  {filtC.map(c => (
                    <button key={c.code} className={`spcd-opt ${country===c.code?'spcd-opt--on':''}`}
                      onClick={() => { setCountry(c.code); setShowCDrop(false); setCq(''); setPage(1); setArticles([]); if(q.trim()) doSearch(q, c.code, sortBy, 1); }}>
                      <span>{c.flag}</span><span>{c.name}</span>
                      {country===c.code && <span className="spcd-tick">✓</span>}
                    </button>
                  ))}
                  {filtC.length===0 && <p className="spcd-none">No results for "{cq}"</p>}
                </div>
                <p className="spcd-foot">{COUNTRIES.length} countries available</p>
              </div>
            )}
          </div>

          <button className="sp-submit" onClick={submit}>Search</button>
        </div>

        {/* Active chips */}
        {(q || country) && (
          <div className="sp-chips">
            {q      && <span className="sp-chip">"{q}"</span>}
            {country && <span className="sp-chip sp-chip--c">{selC?.flag} {selC?.name}</span>}
            <button className="sp-chip-clear" onClick={() => { setQ(''); setCountry(''); setArticles([]); setTotal(0); nav('/search'); }}>Clear ✕</button>
          </div>
        )}
      </div>
      <div className="sp-rule" />

      {/* ── Results header ── */}
      {(articles.length > 0 || loading) && (
        <div className="sp-results-bar">
          <span className="sp-count">{loading ? 'Searching…' : `${total.toLocaleString()} articles found`}{country && ` · ${selC?.flag} ${selC?.name}`}</span>
          <div className="sp-sort">
            {SORT_OPTS.map(s => (
              <button key={s.v} className={`sp-sort-btn ${sortBy===s.v?'sp-sort-btn--on':''}`}
                onClick={() => { setSortBy(s.v); setPage(1); setArticles([]); if(q.trim()) doSearch(q, country, s.v, 1); }}>
                {s.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {loading && articles.length === 0 && <SkeletonGrid count={9} />}
      {error && <div className="sp-error">⚠ {error}</div>}
      {!loading && articles.length === 0 && !error && q && (
        <div className="sp-empty">
          <p className="sp-empty-title">No results found</p>
          <p>Try removing the country filter or using broader keywords. For location-specific news try including the city name directly in the search (e.g. "pollution Delhi" or "economy Seoul").</p>
        </div>
      )}

      {articles.length > 0 && (
        <>
          <div className="sp-grid">
            {articles.map((a, i) => (
              <div key={a.id} className="fade-up" style={{ animationDelay:`${Math.min(i,8)*.04}s` }}>
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
          {hasMore && !loading && <button className="sp-load-more" onClick={() => { const n=page+1; setPage(n); doSearch(q,country,sortBy,n); }}>Load More Results</button>}
          {loading && articles.length > 0 && <div className="sp-spinner"><div className="spinner"/></div>}
        </>
      )}

      {/* ── Start screen ── */}
      {!q && !country && articles.length === 0 && !loading && (
        <div className="sp-start">
          {history.length > 0 && (
            <div className="sps-section">
              <div className="sps-head">
                <h3>Search History</h3>
                <button onClick={clearAll}>Clear all</button>
              </div>
              <div className="sps-hist-list">
                {history.map(h => (
                  <div key={h._id} className="sps-hist-row" onClick={() => onHistClick(h)}>
                    <span className="sps-hist-icon">🕐</span>
                    <div className="sps-hist-body">
                      <span className="sps-hist-q">{h.query || '—'}</span>
                      {h.country && <span className="sps-hist-c">{COUNTRIES.find(c=>c.code===h.country)?.flag} {COUNTRIES.find(c=>c.code===h.country)?.name}</span>}
                    </div>
                    <span className="sps-hist-time">{timeAgo(h.createdAt)}</span>
                    <button className="sps-hist-del" onClick={e => delEntry(e, h._id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="sps-section">
            <div className="sps-head"><h3>Trending Topics</h3></div>
            <div className="sps-topics">
              {['Air Pollution Delhi','Korea Elections','China Economy','Brazil Politics','Japan Earthquake','Climate Change 2025','Stock Market Crash','FIFA World Cup','Space Mission','Ukraine War','Israel Gaza','AI Revolution'].map(t => (
                <button key={t} className="sps-topic" onClick={() => { setQ(t); doSearch(t,'',sortBy,1); }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="sps-section">
            <div className="sps-head"><h3>Browse by Country</h3></div>
            <div className="sps-countries">
              {COUNTRIES.slice(0, 30).map(c => (
                <button key={c.code} className="sps-country" onClick={() => { setCountry(c.code); }}>{c.flag} {c.name}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
