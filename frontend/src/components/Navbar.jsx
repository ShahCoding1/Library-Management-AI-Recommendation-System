import React, { useState } from 'react';
import { BookOpen, Compass, Sparkles, LayoutDashboard, Bookmark, Clock, Shield, LogIn, LogOut, User, Play, Pause, Square } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useReadingSession } from '../contexts/ReadingSessionContext';

export default function Navbar({ currentTab, setTab, onOpenAuth }) {
  const { user, isAuthenticated, logout, isAdmin, isLibrarian } = useAuth();
  const { activeSession, formattedTime, isPaused, pauseSession, resumeSession, endSession } = useReadingSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleEndReading = async () => {
    const pages = prompt("How many pages did you read during this session?", "10");
    if (pages !== null) {
      await endSession(parseInt(pages, 10) || 0);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-glass)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        
        {/* Brand Logo */}
        <div
          onClick={() => setTab('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              LIBRI<span className="gradient-text">FYP</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Smart Library & Screen-Time
            </div>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setTab('landing')}
            className={`btn btn-sm ${currentTab === 'landing' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Home
          </button>
          
          <button
            onClick={() => setTab('catalog')}
            className={`btn btn-sm ${currentTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Compass size={15} /> Catalog & Search
          </button>

          <button
            onClick={() => setTab('moods')}
            className={`btn btn-sm ${currentTab === 'moods' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Sparkles size={15} /> Mood Discovery
          </button>

          {isAuthenticated && (
            <>
              <button
                onClick={() => setTab('dashboard')}
                className={`btn btn-sm ${currentTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <LayoutDashboard size={15} /> Dashboard
              </button>

              <button
                onClick={() => setTab('loans')}
                className={`btn btn-sm ${currentTab === 'loans' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Bookmark size={15} /> My Loans
              </button>

              <button
                onClick={() => setTab('analytics')}
                className={`btn btn-sm ${currentTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Clock size={15} /> Screen-Time
              </button>
            </>
          )}

          {(isAdmin || isLibrarian) && (
            <button
              onClick={() => setTab('admin')}
              className={`btn btn-sm ${currentTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
            >
              <Shield size={15} color="#fbbf24" /> Admin Portal
            </button>
          )}
        </nav>

        {/* Right Section: Active Reading Timer & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Active Timer Ribbon in Navbar */}
          {activeSession && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isPaused ? '#f59e0b' : '#10b981',
                boxShadow: isPaused ? 'none' : '0 0 8px #10b981'
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formattedTime}</span>
              <button
                onClick={isPaused ? resumeSession : pauseSession}
                title={isPaused ? "Resume Session" : "Pause Session"}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex' }}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button
                onClick={handleEndReading}
                title="End Reading Session"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e', display: 'flex' }}
              >
                <Square size={14} />
              </button>
            </div>
          )}

          {/* User Profile / Auth State */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <User size={15} />
                <span>{user.full_name || user.email.split('@')[0]}</span>
                <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {user.role}
                </span>
              </button>

              {dropdownOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '200px',
                    padding: '0.5rem',
                    zIndex: 60,
                  }}
                >
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-glass)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Signed in as <br />
                    <strong style={{ color: 'var(--text-main)' }}>{user.email}</strong>
                  </div>
                  <button
                    onClick={() => { setTab('saved'); setDropdownOpen(false); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none',
                      color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.85rem', borderRadius: '4px'
                    }}
                  >
                    Favorites & Wishlist
                  </button>
                  <button
                    onClick={() => { setTab('analytics'); setDropdownOpen(false); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none',
                      color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.85rem', borderRadius: '4px'
                    }}
                  >
                    My Reading Stats
                  </button>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); setTab('landing'); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none',
                      color: '#f43f5e', cursor: 'pointer', fontSize: '0.85rem', borderRadius: '4px',
                      display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem'
                    }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <LogIn size={15} /> Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
