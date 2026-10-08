import React, { useState, useEffect } from 'react';
import { Star, Heart, Bookmark, BookOpen, Clock, Calendar, Globe, FileText, ArrowLeft, MessageSquare, Plus } from 'lucide-react';
import { api } from '../services/api';
import BookCard from '../components/BookCard';
import RatingModal from '../components/RatingModal';
import { useAuth } from '../contexts/AuthContext';
import { useReadingSession } from '../contexts/ReadingSessionContext';

export default function BookDetailPage({ bookId, onBack, onSelectBook, onBorrow }) {
  const { isAuthenticated } = useAuth();
  const { startSession } = useReadingSession();
  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getBook(bookId),
      api.getSimilarBooks(bookId)
    ]).then(([bRes, simRes]) => {
      setBook(bRes);
      setIsFavorited(bRes.is_favorited);
      setIsWishlisted(bRes.is_wishlisted);
      setSimilarBooks(simRes || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [bookId]);

  if (loading || !book) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading detailed book profile...
      </div>
    );
  }

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) return alert("Please sign in first.");
    const res = await api.toggleFavorite(book.id);
    setIsFavorited(res.favorited);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) return alert("Please sign in first.");
    const res = await api.toggleWishlist(book.id);
    setIsWishlisted(res.wishlisted);
  };

  const primaryAuthor = book.authors?.[0];

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main Book Detail Banner */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 280px) 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Left Column: Cover & Quick Actions */}
          <div>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', marginBottom: '1.25rem' }}>
              <img
                src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80'}
                alt={book.title}
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={handleFavoriteToggle}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, color: isFavorited ? '#f43f5e' : 'inherit' }}
              >
                <Heart size={14} fill={isFavorited ? '#f43f5e' : 'none'} />
                {isFavorited ? 'Favorited' : 'Favorite'}
              </button>

              <button
                onClick={handleWishlistToggle}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, color: isWishlisted ? '#38bdf8' : 'inherit' }}
              >
                <Bookmark size={14} fill={isWishlisted ? '#38bdf8' : 'none'} />
                {isWishlisted ? 'Saved' : 'Wishlist'}
              </button>
            </div>

            <button
              onClick={() => setShowRatingModal(true)}
              className="btn btn-outline btn-sm"
              style={{ width: '100%' }}
            >
              <Star size={14} fill="#fbbf24" color="#fbbf24" />
              {book.user_rating ? `Your Rating: ${book.user_rating}★ (Edit)` : 'Rate & Review Book'}
            </button>
          </div>

          {/* Right Column: Title, Metadata, Actions, Synopsis */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.8rem' }}>
                {book.available_copies > 0 ? `Available in Library (${book.available_copies} copies)` : 'Currently Checked Out'}
              </span>

              {book.category_name && (
                <span className="badge" style={{ fontSize: '0.8rem' }}>
                  {book.category_name}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              {book.title}
            </h1>

            {book.subtitle && (
              <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {book.subtitle}
              </h2>
            )}

            <div style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              By <strong style={{ color: '#cbd5e1' }}>{primaryAuthor?.name || 'Unknown Author'}</strong>
            </div>

            {/* Ratings and Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '1.1rem' }}>
                <Star size={18} fill="#fbbf24" />
                <span>{book.average_rating > 0 ? book.average_rating.toFixed(1) : 'New'}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: 400 }}>({book.ratings_count} reviews)</span>
              </div>
              <div style={{ width: '1px', height: '1.5rem', background: 'var(--border-glass)' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>{book.page_count}</strong> pages
              </div>
              <div style={{ width: '1px', height: '1.5rem', background: 'var(--border-glass)' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Published in <strong>{book.publication_year || 'N/A'}</strong>
              </div>
            </div>

            {/* Moods & Genres */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {book.moods?.map((m) => (
                <span
                  key={m.id}
                  style={{
                    fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)', background: `${m.color_code || '#6366f1'}20`,
                    color: m.color_code || '#818cf8', border: `1px solid ${m.color_code || '#6366f1'}40`
                  }}
                >
                  {m.name}
                </span>
              ))}
              {book.genres?.map((g) => (
                <span
                  key={g.id}
                  style={{
                    fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)'
                  }}
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Synopsis
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                {book.description || 'No description available for this book.'}
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onBorrow && onBorrow(book)}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem' }}
              >
                <BookOpen size={18} />
                {book.available_copies > 0 ? 'Borrow Physical Copy' : 'Reserve Next Copy'}
              </button>

              <button
                onClick={() => startSession(book)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
              >
                <Clock size={18} /> Start Reading Session
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Similar Books Section (Content-Based TF-IDF Cosine Similarity) */}
      {similarBooks.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '1.8rem', height: '1.8rem', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={15} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Similar Books</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                Discovered via Scikit-Learn TF-IDF vectorization & Cosine Similarity on themes and styles.
              </p>
            </div>
          </div>

          <div className="book-grid">
            {similarBooks.map((simBook) => (
              <BookCard
                key={simBook.id}
                book={simBook}
                onSelectBook={onSelectBook}
                onBorrow={onBorrow}
              />
            ))}
          </div>
        </section>
      )}

      {/* Community Reviews Section */}
      <section style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MessageSquare size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Reader Reviews</h3>
          </div>
          <button onClick={() => setShowRatingModal(true)} className="btn btn-secondary btn-sm">
            <Plus size={14} /> Write Review
          </button>
        </div>

        {book.reviews?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {book.reviews.map((rev) => (
              <div key={rev.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                  <strong style={{ color: '#cbd5e1' }}>{rev.user_name || rev.user_email}</strong>
                  <span style={{ color: 'var(--text-subtle)' }}>
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {rev.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
            No written reviews yet. Be the first reader to share your insights!
          </div>
        )}
      </section>

      {/* Rating & Review Modal */}
      {showRatingModal && (
        <RatingModal
          book={book}
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSuccess={(msg) => {
            alert(msg);
            api.getBook(book.id).then(setBook);
          }}
        />
      )}

    </div>
  );
}
