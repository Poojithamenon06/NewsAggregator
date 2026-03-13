// ─── src/context/AuthContext.js ───────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser, getMe } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true on first load (checking token)

  // ── Re-hydrate user from stored token on app load ─────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('news_token');
    if (!token) { setLoading(false); return; }

    getMe()
      .then(({ user }) => setUser(user))
      .catch(() => { localStorage.removeItem('news_token'); })
      .finally(() => setLoading(false));
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    localStorage.setItem('news_token', data.token);
    setUser(data.user);
    return data;
  };

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    localStorage.setItem('news_token', data.token);
    setUser(data.user);
    return data;
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('news_token');
    setUser(null);
  };

  // ── Update local user state (after profile edit) ─────────────────────────
  const refreshUser = (updated) => setUser(updated);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
