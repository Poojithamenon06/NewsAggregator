// ─── src/pages/Profile.js ────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';
import { format } from 'date-fns';
import './Profile.css';

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name = '') {
  const colors = ['#6C63FF','#E91E63','#00BCD4','#FF9800','#4CAF50','#FF5722'];
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [editName,    setEditName]    = useState(user?.name || '');
  const [savingName,  setSavingName]  = useState(false);

  const [curPass,     setCurPass]     = useState('');
  const [newPass,     setNewPass]     = useState('');
  const [newPass2,    setNewPass2]    = useState('');
  const [savingPass,  setSavingPass]  = useState(false);

  if (!user) { navigate('/auth'); return null; }

  const avatarColor = getAvatarColor(user.name);

  // ── Save name ─────────────────────────────────────────────────────────────
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!editName.trim() || editName === user.name) return;
    setSavingName(true);
    try {
      const data = await updateProfile({ name: editName.trim() });
      refreshUser(data.user);
      toast.success('Name updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update name');
    } finally { setSavingName(false); }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!curPass || !newPass || !newPass2) { toast.error('Fill all fields'); return; }
    if (newPass !== newPass2) { toast.error('New passwords do not match'); return; }
    if (newPass.length < 6)   { toast.error('Password must be at least 6 chars'); return; }
    setSavingPass(true);
    try {
      await changePassword({ currentPassword: curPass, newPassword: newPass });
      toast.success('Password changed successfully!');
      setCurPass(''); setNewPass(''); setNewPass2('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally { setSavingPass(false); }
  };

  const handleLogout = () => {
    logout();
    toast('Logged out. See you soon!', { icon: '👋' });
    navigate('/auth');
  };

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="profile-hero">
          <div className="profile-avatar" style={{ background: avatarColor }}>
            {getInitials(user.name)}
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-since">
              Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
            </p>
          </div>
          <button className="profile-logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="profile-stats">
          <div className="pstat" style={{ '--c': '#6C63FF' }}>
            <span className="pstat-icon">📰</span>
            <span className="pstat-label">Personalized Feed</span>
            <span className="pstat-value">Active</span>
          </div>
          <div className="pstat" style={{ '--c': '#E91E63' }}>
            <span className="pstat-icon">🔖</span>
            <span className="pstat-label">Saved Articles</span>
            <span className="pstat-value">Synced</span>
          </div>
          <div className="pstat" style={{ '--c': '#00BCD4' }}>
            <span className="pstat-icon">🌐</span>
            <span className="pstat-label">News Sources</span>
            <span className="pstat-value">Global</span>
          </div>
        </div>

        <div className="profile-grid">
          {/* ── Edit Name ─────────────────────────────────────────────── */}
          <div className="profile-card">
            <h3 className="pcard-title">✏️ Edit Name</h3>
            <form onSubmit={handleSaveName} className="pcard-form">
              <div className="pcard-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <button type="submit" className="pcard-btn" disabled={savingName || editName === user.name}>
                {savingName ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* ── Account Info ──────────────────────────────────────────── */}
          <div className="profile-card">
            <h3 className="pcard-title">📋 Account Info</h3>
            <div className="pcard-info-list">
              <div className="pcard-info-row">
                <span>Email</span>
                <span className="pcard-info-val">{user.email}</span>
              </div>
              <div className="pcard-info-row">
                <span>User ID</span>
                <span className="pcard-info-val mono">{user._id?.slice(-8)}</span>
              </div>
              <div className="pcard-info-row">
                <span>Joined</span>
                <span className="pcard-info-val">{format(new Date(user.createdAt), 'dd MMM yyyy')}</span>
              </div>
              <div className="pcard-info-row">
                <span>Theme</span>
                <span className="pcard-info-val">
                  {user.preferences?.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Change Password ───────────────────────────────────────── */}
          <div className="profile-card profile-card--full">
            <h3 className="pcard-title">🔐 Change Password</h3>
            <form onSubmit={handleChangePassword} className="pcard-form pcard-form--row">
              <div className="pcard-field">
                <label>Current Password</label>
                <input type="password" value={curPass} onChange={e => setCurPass(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="pcard-field">
                <label>New Password</label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="pcard-field">
                <label>Confirm New Password</label>
                <input type="password" value={newPass2} onChange={e => setNewPass2(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" className="pcard-btn pcard-btn--danger" disabled={savingPass}>
                {savingPass ? 'Updating...' : '🔐 Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Back ──────────────────────────────────────────────────────── */}
        <div className="profile-back">
          <button onClick={() => navigate('/')} className="back-btn">← Back to News</button>
        </div>
      </div>
    </div>
  );
}
