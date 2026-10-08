import React, { useState } from 'react';
import { Star, Heart, Bookmark, BookOpen, Clock, Info } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useReadingSession } from '../contexts/ReadingSessionContext';

export default function BookCard({ book, recommendationReason, onSelectBook, onBorrow, onFavoriteToggle }) {
  const { isAuthenticated } = useAuth();
  const { startSession } = useReadingSession();
  const [isFavorited, setIsFavorited] = useState(book.is_favorited);
  const [isWishlisted, setIsWishlisted] = useState(book.is_wishlisted);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return alert("Please sign in to favorite books.");
    setFavLoading(true);
    try {
      const res = await api.toggleFavorite(book.id);
      setIsFavorited(res.favorited);
      if (onFavoriteToggle) onFavoriteToggle(book.id, res.favorited);
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return alert("Please sign in to save books to your wishlist.");
    try {
      const res = await api.toggleWishlist(book.id);
      setIsWishlisted(res.wishlisted);
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  const authorName = book.authors?.[0]?.name || 'Unknown Author';
  const primaryMood = book.moods?.[0];

  return (
    <div
      onClick={() => onSelectBook && onSelectBook(book)}
      className="glass-panel glass-panel-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        height: '100%',
      }}
    >
      {/* Cover Image Container */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden', background: '#1e293b' }}>
        <img
          src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80'}
          alt={book.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(11, 15, 25, 0.95), transparent)',
        }} />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', right: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
            {book.available_copies > 0 ? `Available (${book.available_copies})` : 'Borrowed'}
          </span>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={handleFavoriteClick}
              disabled={favLoading}
              title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
              style={{
                width: '1.9rem',
                height: '1.9rem',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-glass)',
                color: isFavorited ? '#f43f5e' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Heart size={13} fill={isFavorited ? '#f43f5e' : 'none'} />
            </button>

            <button
              onClick={handleWishlistClick}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
              style={{
                width: '1.9rem',
                height: '1.9rem',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-glass)',
                color: isWishlisted ? '#38bdf8' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Bookmark size={13} fill={isWishlisted ? '#38bdf8' : 'none'} />
            </button>
          </div>
        </div>

        {/* Rating overlay badge */}
        <div style={{
          position: 'absolute',
          bottom: '0.6rem',
          left: '0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#fbbf24',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '0.2rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-glass)'
        }}>
          <Star size={13} fill="#fbbf24" />
          <span>{book.average_rating > 0 ? book.average_rating.toFixed(1) : 'New'}</span>
          {book.ratings_count > 0 && <span style={{ color: 'var(--text-subtle)', fontSize: '0.65rem' }}>({book.ratings_count})</span>}
        </div>
      </div>

      {/* Book Metadata Body */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '0.25rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {book.title}
        </h3>
        
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          by <span style={{ color: '#cbd5e1' }}>{authorName}</span>
        </p>

        {/* Mood and Genre Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
          {primaryMood && (
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              background: `${primaryMood.color_code || '#6366f1'}20`,
              color: primaryMood.color_code || '#818cf8',
              border: `1px solid ${primaryMood.color_code || '#6366f1'}40`
            }}>
              {primaryMood.name}
            </span>
          )}

          {book.genres?.[0] && (
            <span style={{
              fontSize: '0.68rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-muted)'
            }}>
              {book.genres[0].name}
            </span>
          )}
        </div>

        {/* Recommendation Reason Callout */}
        {recommendationReason && (
          <div style={{
            fontSize: '0.72rem',
            color: '#a5b4fc',
            background: 'rgba(99, 102, 241, 0.1)',
            padding: '0.4rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.35rem',
            marginBottom: '0.75rem',
            lineHeight: '1.4'
          }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{recommendationReason}</span>
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
          {book.available_copies > 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onBorrow && onBorrow(book); }}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, padding: '0.45rem 0.6rem' }}
            >
              <BookOpen size={13} /> Borrow
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onBorrow && onBorrow(book); }}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, padding: '0.45rem 0.6rem' }}
            >
              Reserve
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              startSession(book);
            }}
            title="Start Reading Session"
            className="btn btn-secondary btn-sm btn-icon"
          >
            <Clock size={14} color="#34d399" />
          </button>
        </div>
      </div>
    </div>
  );
}
