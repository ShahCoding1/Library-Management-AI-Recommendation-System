import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import BookCard from '../components/BookCard';

export default function SavedPage({ onSelectBook, onBorrow, setTab }) {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedData = () => {
    setLoading(true);
    Promise.all([
      api.getMyFavorites(),
      api.getMyWishlist()
    ]).then(([favRes, wishRes]) => {
      setFavorites(favRes || []);
      setWishlist(wishRes || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSavedData();
  }, []);

  const handleRemoveFavorite = async (e, bookId) => {
    e.stopPropagation();
    try {
      await api.toggleFavorite(bookId);
      setFavorites((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      alert(err.message || 'Failed to remove favorite');
    }
  };

  const handleRemoveWishlist = async (e, bookId) => {
    e.stopPropagation();
    try {
      await api.toggleWishlist(bookId);
      setWishlist((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      alert(err.message || 'Failed to remove from wishlist');
    }
  };

  const currentList = activeTab === 'favorites' ? favorites : wishlist;

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Saved Books & Wishlist</h1>
        <p className="section-subtitle">
          Manage your favorited literary works and future reading wishlist.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            color: activeTab === 'favorites' ? '#f43f5e' : 'var(--text-muted)',
            borderBottom: activeTab === 'favorites' ? '2px solid #f43f5e' : '2px solid transparent'
          }}
        >
          <Heart size={16} fill={activeTab === 'favorites' ? '#f43f5e' : 'none'} />
          Favorites ({favorites.length})
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            color: activeTab === 'wishlist' ? '#38bdf8' : 'var(--text-muted)',
            borderBottom: activeTab === 'wishlist' ? '2px solid #38bdf8' : '2px solid transparent'
          }}
        >
          <Bookmark size={16} fill={activeTab === 'wishlist' ? '#38bdf8' : 'none'} />
          Wishlist ({wishlist.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading saved items...
        </div>
      ) : currentList.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <BookOpen size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Your {activeTab === 'favorites' ? 'Favorites list' : 'Wishlist'} is currently empty
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Discover books in the catalog and click the favorite or wishlist button to save them here.
          </p>
          <button onClick={() => setTab('catalog')} className="btn btn-primary btn-sm">
            Explore Catalog <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="book-grid">
          {currentList.map((book) => (
            <div key={book.id} style={{ position: 'relative' }}>
              <BookCard
                book={book}
                onSelectBook={onSelectBook}
                onBorrow={onBorrow}
              />
              <button
                onClick={(e) => activeTab === 'favorites' ? handleRemoveFavorite(e, book.id) : handleRemoveWishlist(e, book.id)}
                title="Remove item"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  zIndex: 10,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid var(--border-glass)',
                  color: '#f87171',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
