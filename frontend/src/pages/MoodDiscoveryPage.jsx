import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, BookOpen, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import BookCard from '../components/BookCard';

export default function MoodDiscoveryPage({ initialMoodSlug, onSelectBook, onBorrow }) {
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodBooks, setMoodBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(false);

  useEffect(() => {
    api.getMoods()
      .then((data) => {
        setMoods(data || []);
        if (initialMoodSlug) {
          const match = data.find((m) => m.slug === initialMoodSlug);
          if (match) handleSelectMood(match);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [initialMoodSlug]);

  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
    setBooksLoading(true);
    api.getMoodRecommendations(mood.slug, 12)
      .then((res) => {
        const rawResults = res?.results || [];
        setMoodBooks(rawResults.map((r) => ({
          ...r.book,
          recommendationReason: r.reason
        })));
      })
      .catch(console.error)
      .finally(() => setBooksLoading(false));
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '1rem', fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
          <Sparkles size={14} /> Mood-Driven Intelligent Discovery
        </div>
        <h1 className="section-title" style={{ fontSize: '2.5rem' }}>What are you in the mood for?</h1>
        <p className="section-subtitle">
          Select an emotional or atmospheric state. Our recommendation engine aligns content profiles, themes, and tone to match your choice.
        </p>
      </div>

      {/* Selected Mood Active View */}
      {selectedMood ? (
        <div>
          <button
            onClick={() => setSelectedMood(null)}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={15} /> Back to All Moods
          </button>

          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              marginBottom: '2.5rem',
              borderLeft: `4px solid ${selectedMood.color_code || '#6366f1'}`,
              background: `linear-gradient(135deg, ${selectedMood.color_code || '#6366f1'}15 0%, rgba(15, 23, 42, 0.9) 100%)`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: selectedMood.color_code,
                  boxShadow: `0 0 10px ${selectedMood.color_code}`
                }}
              />
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
                {selectedMood.name} Mood
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '700px' }}>
              {selectedMood.description}
            </p>
          </div>

          {booksLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Curating books matching {selectedMood.name}...
            </div>
          ) : moodBooks.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
              <BookOpen size={36} color="var(--text-subtle)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>No books currently mapped to this mood profile.</p>
            </div>
          ) : (
            <div className="book-grid">
              {moodBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  recommendationReason={book.recommendationReason}
                  onSelectBook={onSelectBook}
                  onBorrow={onBorrow}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Mood Grid (18 Profiles) */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {moods.map((mood) => {
            const color = mood.color_code || '#6366f1';
            return (
              <div
                key={mood.id}
                onClick={() => handleSelectMood(mood)}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  borderTop: `3px solid ${color}`
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: `${color}15`,
                  filter: 'blur(10px)'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: color, boxShadow: `0 0 8px ${color}`
                  }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                    {mood.name}
                  </h3>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem', minHeight: '2.5rem' }}>
                  {mood.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ color: color, fontWeight: 600 }}>Explore Mood →</span>
                  {mood.books_count !== undefined && (
                    <span style={{ color: 'var(--text-subtle)' }}>{mood.books_count} titles</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
