import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { api } from '../services/api';

export default function RatingModal({ book, isOpen, onClose, onSuccess }) {
  const [score, setScore] = useState(book?.user_rating || 5);
  const [hoverScore, setHoverScore] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !book) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.rateBook(book.id, score);
      if (content.trim()) {
        await api.addReview(book.id, content.trim());
      }
      if (onSuccess) onSuccess("Thank you! Your rating and feedback were recorded.");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit rating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Rate & Review</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Share your experience with <strong>{book.title}</strong>
        </p>

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
          {/* Star selector */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                onClick={() => setScore(star)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
                  transform: (hoverScore || score) >= star ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <Star
                  size={32}
                  fill={(hoverScore || score) >= star ? '#fbbf24' : 'none'}
                  color={(hoverScore || score) >= star ? '#fbbf24' : '#475569'}
                />
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Written Review (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="What did you think of the story, prose, and character development?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Save Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
