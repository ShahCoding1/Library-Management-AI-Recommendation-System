import React, { useState } from 'react';
import { X, BookOpen, Calendar, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function BorrowModal({ book, isOpen, onClose, onSuccess }) {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !book) return null;

  const isAvailable = book.available_copies > 0;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  const handleAction = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert("Please sign in first.");
    setLoading(true);
    setError('');

    try {
      if (isAvailable) {
        const res = await api.borrowBook(book.id, notes);
        if (onSuccess) onSuccess(res.message);
      } else {
        const res = await api.reserveBook(book.id);
        if (onSuccess) onSuccess(res.message);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
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

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {isAvailable ? 'Confirm Book Loan' : 'Reserve Unavailable Book'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {isAvailable ? 'Loan policy: 14 days standard duration with up to 2 renewals.' : 'All copies are currently issued. Join the priority waitlist.'}
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

        <div style={{ display: 'flex', gap: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
          <img
            src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80'}
            alt=""
            style={{ width: '3.5rem', height: '5rem', objectFit: 'cover', borderRadius: '4px' }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{book.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {book.authors?.[0]?.name}</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.68rem' }}>
                {isAvailable ? `${book.available_copies} copies available` : '0 copies available'}
              </span>
            </div>
          </div>
        </div>

        {isAvailable && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.6rem 0.9rem', background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.2)',
            fontSize: '0.82rem', color: '#c7d2fe', marginBottom: '1.25rem'
          }}>
            <Calendar size={15} color="#818cf8" />
            <span>Scheduled Return Date: <strong>{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
          </div>
        )}

        <form onSubmit={handleAction}>
          {isAvailable && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Notes / Purpose (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Research on AI and philosophy"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : isAvailable ? 'Confirm & Borrow Copy' : 'Join Reservation Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
