import React, { useState } from 'react';
import { X, LogIn, UserPlus, Shield, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register({ email, password, full_name: fullName });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setTab('login');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem', position: 'relative' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              flex: 1, padding: '0.75rem', background: 'none', border: 'none',
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              color: tab === 'login' ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: tab === 'login' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              flex: 1, padding: '0.75rem', background: 'none', border: 'none',
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              color: tab === 'register' ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: tab === 'register' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.65rem 0.9rem', marginBottom: '1.2rem',
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Julian Croft"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In to Library' : 'Complete Registration'}
          </button>
        </form>

        {/* Viva Demo Quick-Fill Profiles */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', textAlign: 'center' }}>
            Viva Demo 1-Click Credentials
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('reader@library.com', 'Reader123!')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem', justifyContent: 'center' }}
            >
              <User size={12} color="#10b981" /> Reader
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('librarian@library.com', 'Librarian123!')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem', justifyContent: 'center' }}
            >
              <Sparkles size={12} color="#38bdf8" /> Librarian
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@library.com', 'Admin123!')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem', justifyContent: 'center' }}
            >
              <Shield size={12} color="#f59e0b" /> Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
