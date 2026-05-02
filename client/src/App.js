import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import Settings from './pages/Settings';
import './App.css';

function AppInner() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="splash">
        <span className="splash-icon">◎</span>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const navItems = [
    { id: 'dashboard', label: 'Expenses', icon: '◈' },
    { id: 'report', label: 'Report', icon: '◉' },
    { id: 'settings', label: 'Settings', icon: '◎' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">◎</span>
          <span className="brand-name">Ledger</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <span className="user-currency">{user.homeCurrency}</span>
          </div>
          <button className="btn-logout" onClick={logout}>Sign Out</button>
        </div>
      </aside>
      <main className="main-content">
        {page === 'dashboard' && <Dashboard />}
        {page === 'report' && <Report />}
        {page === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
