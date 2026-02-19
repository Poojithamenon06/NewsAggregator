// ─── src/App.js ───────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NewsProvider, useNews } from './context/NewsContext';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import Home from './pages/Home';
import Search from './pages/Search';
import Saved from './pages/Saved';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import './index.css';

// ── Protected Route: redirects to /auth if not logged in ─────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/auth" replace />;
  return children;
}

// ── Public Route: redirects home if already logged in ────────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner" /></div>;
  if (user)    return <Navigate to="/" replace />;
  return children;
}

function AppShell() {
  const { theme } = useNews();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><><CategoryBar /><Home /></></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><><CategoryBar /><Search /></></ProtectedRoute>} />
        <Route path="/saved"  element={<ProtectedRoute><Saved /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NewsProvider>
          <AppShell />
        </NewsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
