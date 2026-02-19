// ─── src/components/Navbar.js ─────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function getAvatarColor(name = '') {
  const colors = ['#6C63FF','#E91E63','#00BCD4','#FF9800','#4CAF50','#FF5722'];
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useNews();
  const { user, logout }       = useAuth();

  const [localQuery, setLocalQuery] = useState('');
  const [showUser,   setShowUser]   = useState(false);
  const userRef = useRef();

  useEffect(() => {
    const h = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!localQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(localQuery)}`);
    setLocalQuery('');
  };

  const handleLogout = () => { logout(); navigate('/auth'); setShowUser(false); };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <button className="navbar__logo" onClick={() => navigate('/')}>
          <span className="logo-mark">N</span>
          <span className="logo-text">ewsFlow</span>
        </button>

        {/* Search */}
        <form className="navbar__search" onSubmit={handleSearch}>
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search headlines..."
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        {/* Controls */}
        <div className="navbar__controls">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="icon-btn" onClick={() => navigate('/saved')} title="Saved">
            🔖
          </button>

          {/* User Menu */}
          {user ? (
            <div className="user-menu" ref={userRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setShowUser(p => !p)}
                style={{ background: getAvatarColor(user.name) }}
                title={user.name}
              >
                {getInitials(user.name)}
              </button>
              {showUser && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dd-avatar" style={{ background: getAvatarColor(user.name) }}>
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="user-dd-name">{user.name}</p>
                      <p className="user-dd-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button className="user-dd-item" onClick={() => { navigate('/profile'); setShowUser(false); }}>
                    👤 My Profile
                  </button>
                  <button className="user-dd-item" onClick={() => { navigate('/saved'); setShowUser(false); }}>
                    🔖 Saved Articles
                  </button>
                  <div className="user-dropdown-divider" />
                  <button className="user-dd-item user-dd-item--danger" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="signin-btn" onClick={() => navigate('/auth')}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
