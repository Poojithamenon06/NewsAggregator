import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Auth() {
  const nav = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      if (tab === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-rule" />
          <h1 className="auth-brand-name">NewsAggregator</h1>
          <span className="auth-rule" />
        </div>
        <p className="auth-tagline">Real-time news from<br/>every corner of the world.</p>
        <div className="auth-stats">
          <div className="auth-stat"><span className="auth-stat-n">60+</span><span>Countries</span></div>
          <div className="auth-stat"><span className="auth-stat-n">Live</span><span>Updates</span></div>
          <div className="auth-stat"><span className="auth-stat-n">7</span><span>Categories</span></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab==='login'?'auth-tab--on':''}`} onClick={() => { setTab('login'); setErr(''); }}>Sign In</button>
            <button className={`auth-tab ${tab==='register'?'auth-tab--on':''}`} onClick={() => { setTab('register'); setErr(''); }}>Create Account</button>
          </div>

          <form onSubmit={submit} className="auth-form">
            {tab === 'register' && (
              <div className="auth-field">
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" required />
              </div>
            )}
            <div className="auth-field">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required />
            </div>
            {err && <p className="auth-err">{err}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Please wait…' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
