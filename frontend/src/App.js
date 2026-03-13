import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NewsProvider, useNews } from './context/NewsContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import Saved from './pages/Saved';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/auth" replace />;
  return children;
}
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner" /></div>;
  if (user)    return <Navigate to="/" replace />;
  return children;
}

function AppShell() {
  const { theme } = useNews();
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color:      'var(--text)',
            border:     '1px solid var(--border2)',
            fontFamily: 'var(--font-sans)',
            fontSize:   '13.5px',
            borderRadius: '4px',
          },
          success: { iconTheme: { primary: '#27ae60', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#c0392b', secondary: '#fff' } },
        }}
      />
      <Navbar />
      <main style={{ paddingTop: '0' }}>
        <Routes>
          <Route path="/auth"    element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/"        element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/search"  element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/saved"   element={<ProtectedRoute><Saved /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </main>
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
