// ─── src/pages/Auth.js ────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Auth() {
  const [tab, setTab]           = useState('login'); // 'login' | 'register'
  const [loading, setLoading]   = useState(false);

  // login fields
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPass,  setLoginPass]        = useState('');

  // register fields
  const [regName,  setRegName]  = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass,  setRegPass]  = useState('');
  const [regPass2, setRegPass2] = useState('');

  const [showPass, setShowPass] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // ── Login submit ─────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      await login(loginEmail, loginPass);
      toast.success('Welcome back! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  // ── Register submit ───────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPass || !regPass2) { toast.error('Fill in all fields'); return; }
    if (regPass !== regPass2) { toast.error('Passwords do not match'); return; }
    if (regPass.length < 6)   { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(regName, regEmail, regPass);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Animated background blobs */}
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />
      <div className="auth-blob auth-blob--3" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-mark">N</span>
          <span className="auth-logo-text">ewsFlow</span>
        </div>
        <p className="auth-tagline">Your world, your news.</p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Create Account
          </button>
          <span className="auth-tab-indicator" style={{ transform: tab === 'login' ? 'translateX(0)' : 'translateX(100%)' }} />
        </div>

        {/* ── LOGIN FORM ─────────────────────────────────────────────────── */}
        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Sign In →'}
            </button>

            <p className="auth-switch">
              Don't have an account?{' '}
              <button type="button" onClick={() => setTab('register')}>Create one</button>
            </p>
          </form>
        )}

        {/* ── REGISTER FORM ──────────────────────────────────────────────── */}
        {tab === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password <span className="auth-hint">(min 6 chars)</span></label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={regPass}
                  onChange={e => setRegPass(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label>Confirm Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={regPass2}
                  onChange={e => setRegPass2(e.target.value)}
                />
              </div>
              {regPass && regPass2 && regPass !== regPass2 && (
                <span className="auth-error">Passwords don't match</span>
              )}
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Create Account →'}
            </button>

            <p className="auth-switch">
              Already have an account?{' '}
              <button type="button" onClick={() => setTab('login')}>Sign in</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
