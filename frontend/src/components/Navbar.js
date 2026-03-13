import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useNews, COUNTRIES, CATEGORIES } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';
import { logSearch, getSearchHistory, deleteSearchEntry, clearSearchHistory } from '../services/api';
import './Navbar.css';

function initials(n=''){return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);}
function avatarBg(n=''){const c=['#c0392b','#8e44ad','#2980b9','#27ae60','#d35400'];let h=0;for(const ch of n)h=ch.charCodeAt(0)+((h<<5)-h);return c[Math.abs(h)%c.length];}
function timeAgo(d){if(!d)return'';const m=Math.floor((Date.now()-new Date(d))/60000);if(m<1)return'now';if(m<60)return`${m}m`;const h=Math.floor(m/60);if(h<24)return`${h}h`;return`${Math.floor(h/24)}d`;}

export default function Navbar() {
  const nav = useNavigate();
  const { theme, toggleTheme, activeCountry, setActiveCountry, activeCategory, setActiveCategory } = useNews();
  const { user, logout } = useAuth();

  const [q,           setQ]           = useState('');
  const [focused,     setFocused]     = useState(false);
  const [history,     setHistory]     = useState([]);
  const [showCountry, setShowCountry] = useState(false);
  const [countryQ,    setCountryQ]    = useState('');
  const [showUser,    setShowUser]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);

  const searchRef  = useRef();
  const countryRef = useRef();
  const userRef    = useRef();

  const loadHist = useCallback(async () => {
    if (!user) return;
    try { const d = await getSearchHistory(); setHistory(d.history || []); } catch {}
  }, [user]);

  useEffect(() => { loadHist(); }, [loadHist]);

  useEffect(() => {
    const fn = (e) => {
      if (searchRef.current  && !searchRef.current.contains(e.target))  setFocused(false);
      if (countryRef.current && !countryRef.current.contains(e.target)) { setShowCountry(false); setCountryQ(''); }
      if (userRef.current    && !userRef.current.contains(e.target))    setShowUser(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const doSearch = async (term) => {
    const t = (term || q).trim();
    if (!t) return;
    setFocused(false); setQ('');
    nav(`/search?q=${encodeURIComponent(t)}`);
    if (user) { await logSearch({ query: t }); loadHist(); }
  };

  const removeEntry = async (e, id) => {
    e.stopPropagation();
    await deleteSearchEntry(id);
    setHistory(p => p.filter(h => h._id !== id));
  };
  const clearAll = async (e) => {
    e.stopPropagation();
    await clearSearchHistory(); setHistory([]);
  };

  const filteredC = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countryQ.toLowerCase()) ||
    c.code.toLowerCase().includes(countryQ.toLowerCase())
  );
  const activeC = COUNTRIES.find(c => c.code === activeCountry);
  const showDrop = focused && user && (q.length > 0 || history.length > 0);
  const dispHist = q ? history.filter(h => h.query?.toLowerCase().includes(q.toLowerCase())) : history;

  return (
    <header className="site-header">
      {/* Top bar: logo + search + controls */}
      <div className="header-main">
        <button className="header-logo" onClick={() => nav('/')}>
          <span className="logo-rule" />
          <span className="logo-title">NewsAggregator</span>
          <span className="logo-rule" />
        </button>

        {/* Search */}
        <div className="header-search" ref={searchRef}>
          <div className={`hs-bar ${focused ? 'hs-bar--open' : ''}`}>
            <svg className="hs-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text" placeholder="Search news worldwide…"
              value={q} onChange={e => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={e => { if(e.key==='Enter') doSearch(); if(e.key==='Escape') setFocused(false); }}
              autoComplete="off"
            />
            {q && <button className="hs-x" onClick={() => setQ('')}>✕</button>}
          </div>
          {showDrop && (
            <div className="hs-dropdown">
              {dispHist.length > 0 && (
                <>
                  <div className="hsd-head">
                    <span>Recent</span>
                    <button onClick={clearAll}>Clear all</button>
                  </div>
                  {dispHist.slice(0, 7).map(h => (
                    <div key={h._id} className="hsd-item" onClick={() => doSearch(h.query)}>
                      <span className="hsd-clock">🕐</span>
                      <span className="hsd-q">{h.query}</span>
                      <span className="hsd-time">{timeAgo(h.createdAt)}</span>
                      <button className="hsd-del" onClick={e => removeEntry(e, h._id)}>✕</button>
                    </div>
                  ))}
                  {q && <div className="hsd-sep"/>}
                </>
              )}
              {q && (
                <div className="hsd-item hsd-item--go" onClick={() => doSearch()}>
                  <span className="hsd-clock">⌕</span>
                  <span>Search <strong>"{q}"</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-controls">
          <button className="hc-btn" onClick={toggleTheme} title="Toggle theme">
            {theme==='dark' ? '☀' : '☾'}
          </button>
          <button className="hc-btn" onClick={() => nav('/saved')} title="Saved">
            <svg viewBox="0 0 20 20" fill="none" width="17" height="17">
              <path d="M5 3h10a1 1 0 011 1v12.5l-6-3-6 3V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Country Picker */}
          <div className="country-pick" ref={countryRef}>
            <button className="cp-trigger" onClick={() => { setShowCountry(p=>!p); setCountryQ(''); }}>
              <span>{activeC?.flag}</span>
              <span className="cp-name">{activeC?.name}</span>
              <span className="cp-arrow">▾</span>
            </button>
            {showCountry && (
              <div className="cp-panel">
                <div className="cpp-search">
                  <svg viewBox="0 0 20 20" fill="none" width="14" height="14"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <input type="text" placeholder="Search any country…" value={countryQ} onChange={e => setCountryQ(e.target.value)} autoFocus />
                  {countryQ && <button onClick={()=>setCountryQ('')}>✕</button>}
                </div>
                <div className="cpp-list">
                  {filteredC.map(c => (
                    <button key={c.code} className={`cpp-item ${activeCountry===c.code?'cpp-item--on':''}`}
                      onClick={() => { setActiveCountry(c.code); setShowCountry(false); setCountryQ(''); }}>
                      <span>{c.flag}</span>
                      <span className="cpp-cname">{c.name}</span>
                      <span className="cpp-code">{c.code.toUpperCase()}</span>
                      {activeCountry===c.code && <span className="cpp-tick">✓</span>}
                    </button>
                  ))}
                  {filteredC.length===0 && <p className="cpp-none">No country found</p>}
                </div>
                <div className="cpp-foot">{COUNTRIES.length} countries</div>
              </div>
            )}
          </div>

          {user ? (
            <div className="user-pick" ref={userRef}>
              <button className="up-avatar" style={{background: avatarBg(user.name)}} onClick={() => setShowUser(p=>!p)}>
                {initials(user.name)}
              </button>
              {showUser && (
                <div className="up-panel">
                  <div className="upp-top">
                    <div className="upp-av" style={{background: avatarBg(user.name)}}>{initials(user.name)}</div>
                    <div>
                      <p className="upp-name">{user.name}</p>
                      <p className="upp-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="upp-sep"/>
                  <button className="upp-item" onClick={() => {nav('/profile'); setShowUser(false);}}>My Profile</button>
                  <button className="upp-item" onClick={() => {nav('/saved'); setShowUser(false);}}>Saved Articles</button>
                  <div className="upp-sep"/>
                  <button className="upp-item upp-item--out" onClick={() => {logout(); nav('/auth');}}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <button className="hc-signin" onClick={() => nav('/auth')}>Sign In</button>
          )}
        </div>
      </div>

      {/* Category nav bar */}
      <nav className="cat-nav">
        <div className="cat-nav-inner">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cat-nav-item ${activeCategory===cat.id ? 'cat-nav-item--on' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
