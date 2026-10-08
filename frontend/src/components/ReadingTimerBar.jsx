import React, { useState } from 'react';
import { Play, Pause, Square, BookOpen, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { useReadingSession } from '../contexts/ReadingSessionContext';

export default function ReadingTimerBar() {
  const { activeSession, isPaused, formattedTime, pauseSession, resumeSession, endSession } = useReadingSession();
  const [pagesInput, setPagesInput] = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!activeSession) return null;

  const bookTitle = activeSession.book?.title || 'General Reading';
  const coverUrl = activeSession.book?.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80';

  const handleConfirmEnd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const p = parseInt(pagesInput, 10) || 0;
      await endSession(p);
      setShowEndModal(false);
      setPagesInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="glass-panel"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(15, 23, 42, 0.92)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.3)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          maxWidth: '92vw',
        }}
      >
        {/* Book Thumbnail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={coverUrl}
            alt=""
            style={{ width: '2rem', height: '2.8rem', borderRadius: '4px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Reading Session
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {bookTitle}
            </div>
          </div>
        </div>

        {/* Live Timer Counter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.85rem',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-glass)',
        }}>
          <Clock size={16} color={isPaused ? '#f59e0b' : '#6366f1'} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: isPaused ? '#f59e0b' : '#fff',
            letterSpacing: '0.04em'
          }}>
            {formattedTime}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={isPaused ? resumeSession : pauseSession}
            className="btn btn-sm btn-secondary"
            title={isPaused ? "Resume Session" : "Pause Session"}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            {isPaused ? <Play size={14} color="#10b981" /> : <Pause size={14} color="#f59e0b" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </button>

          <button
            onClick={() => setShowEndModal(true)}
            className="btn btn-sm btn-danger"
            title="Complete & Log Session"
            style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            <Square size={13} />
            <span>Finish</span>
          </button>
        </div>
      </div>

      {/* Completion Modal */}
      {showEndModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Log Reading Session</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              You read <strong>{bookTitle}</strong> for <strong>{formattedTime}</strong>. Record your progress to update your reading streak!
            </p>

            <form onSubmit={handleConfirmEnd}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Pages Read (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 15"
                  value={pagesInput}
                  onChange={(e) => setPagesInput(e.target.value)}
                  className="input-field"
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEndModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save & Close'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
