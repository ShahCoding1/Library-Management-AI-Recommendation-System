import React, { useState, useEffect } from 'react';
import { Search, Compass, Sparkles, BookOpen, Clock, Shield, ArrowRight, Star, Heart, Bookmark } from 'lucide-react';
import { api } from '../services/api';
import BookCard from '../components/BookCard';
import MoodChip from '../components/MoodChip';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage({ setTab, onSelectBook, onBorrow, onOpenAuth }) {
  const { isAuthenticated } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getBooks({ page_size: 8, ordering: '-average_rating' }),
      api.getMoods()
    ]).then(([booksRes, moodsRes]) => {
      setFeaturedBooks(booksRes?.results || []);
      setMoods(moodsRes || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setTab('catalog', { q: searchQuery });
  };

  const handleMoodClick = (mood) => {
    setTab('moods', { slug: mood.slug });
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 0 4rem 0',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-glass)',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.25), transparent)'
      }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#c7d2fe' }}>
            <Sparkles size={14} color="#818cf8" />
            <span>Academic Final Year Project • Genuine Hybrid AI & Screen-Time Analytics</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            maxWidth: '900px',
            margin: '0 auto 1.25rem auto'
          }}>
            Discover Books by <span className="gradient-text">Mood</span>, Read with Purpose, Track Every Minute.
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6
          }}>
            An intelligent library platform powered by TF-IDF text modeling, item-based collaborative filtering, 18-profile mood discovery, and validated screen-time tracking.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              maxWidth: '640px',
              margin: '0 auto 2rem auto',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(17, 24, 39, 0.8)',
              backdropFilter: 'blur(16px)',
              padding: '0.4rem 0.5rem 0.4rem 1.2rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <Search size={18} color="var(--text-subtle)" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by title, author, historical era, philosophy, or mood..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-sans)'
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.25rem' }}>
              Explore
            </button>
          </form>

          {/* Mood Discovery Quick Strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', maxWidth: '850px', margin: '0 auto' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', alignSelf: 'center', marginRight: '0.4rem' }}>
              Popular Moods:
            </span>
            {moods.slice(0, 8).map((m) => (
              <MoodChip
                key={m.id}
                mood={m}
                onClick={handleMoodClick}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Featured / Critically Acclaimed Section */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 className="section-title">Critically Acclaimed Titles</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                High-rated literary classics and speculative fiction from our catalog.
              </p>
            </div>
            <button onClick={() => setTab('catalog')} className="btn btn-secondary btn-sm">
              View All Catalog <ArrowRight size={15} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading curated titles...
            </div>
          ) : (
            <div className="book-grid">
              {featuredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelectBook={onSelectBook}
                  onBorrow={onBorrow}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tri-Pillar Architecture Feature Grid */}
      <section style={{ padding: '4rem 0', background: 'rgba(17, 24, 39, 0.4)', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <h2 className="section-title">The Three Integrated Domains</h2>
            <p className="section-subtitle">
              Engineered as a comprehensive Final Year Project with rigorous engineering standards.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Pillar 1 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <BookOpen size={24} color="#818cf8" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Library Circulation</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Transactional inventory management, copy-level barcodes, 14-day loan rules with automated due-date calculations, returns queue, and waitlist reservations.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Sparkles size={24} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Hybrid AI Recommender</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Mathematical TF-IDF and Cosine similarity, item-based collaborative filtering, 18 mood profiles, and transparent explanations generated from real scoring data.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Clock size={24} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Reading & Screen-Time</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Live session timer with heartbeat verification, inactivity capping, daily streaks, customizable reading goals, and genre/mood distribution charts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="glass-panel" style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Experience the Full System in Action
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
              Explore the catalog, test mood-based discovery, borrow books, start real reading sessions, and inspect the recommendation engine weights.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setTab('catalog')} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                Open Catalog <Compass size={16} />
              </button>
              {!isAuthenticated && (
                <button onClick={onOpenAuth} className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem' }}>
                  Sign In Demo
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
