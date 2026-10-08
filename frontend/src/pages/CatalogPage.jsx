import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, Sparkles, BookOpen, Star, Check } from 'lucide-react';
import { api } from '../services/api';
import BookCard from '../components/BookCard';
import MoodChip from '../components/MoodChip';

export default function CatalogPage({ initialParams = {}, onSelectBook, onBorrow }) {
  const [books, setBooks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Metadata filters
  const [moods, setMoods] = useState([]);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialParams.q || '');
  const [selectedMoods, setSelectedMoods] = useState(initialParams.mood ? [initialParams.mood] : []);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [ordering, setOrdering] = useState('relevance');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load initial taxonomy
  useEffect(() => {
    Promise.all([
      api.getMoods(),
      api.getGenres(),
      api.getAuthors()
    ]).then(([mRes, gRes, aRes]) => {
      setMoods(mRes || []);
      setGenres(gRes || []);
      setAuthors(aRes || []);
    }).catch(console.error);
  }, []);

  // Fetch filtered books
  const fetchFilteredBooks = (page = 1) => {
    setLoading(true);
    const params = {
      page,
      page_size: 12,
      ordering,
    };

    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedMoods.length > 0) params.moods = selectedMoods.join(',');
    if (selectedGenre) params.genres = selectedGenre;
    if (selectedAuthor) params.author = selectedAuthor;
    if (minRating) params.min_rating = minRating;
    if (availableOnly) params.available = 'true';

    api.search(params)
      .then((res) => {
        setBooks(res.results || []);
        setTotalCount(res.count || 0);
        setTotalPages(res.total_pages || 1);
        setCurrentPage(res.current_page || 1);
      })
      .catch((err) => {
        console.error("Search failed:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFilteredBooks(1);
  }, [selectedMoods, selectedGenre, selectedAuthor, minRating, availableOnly, ordering]);

  // Debounced Autocomplete
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        api.autocomplete(searchQuery.trim())
          .then((data) => {
            setSuggestions(data);
            setShowSuggestions(true);
          })
          .catch(() => {});
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions(null);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchFilteredBooks(1);
  };

  const handleToggleMood = (mood) => {
    setSelectedMoods((prev) => {
      if (prev.includes(mood.slug)) {
        return prev.filter((s) => s !== mood.slug);
      } else {
        return [...prev, mood.slug];
      }
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMoods([]);
    setSelectedGenre('');
    setSelectedAuthor('');
    setMinRating('');
    setAvailableOnly(false);
    setOrdering('relevance');
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header & Search Bar */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="section-title">Library Catalog & Advanced Search</h1>
        <p className="section-subtitle">
          Multi-criteria filtered discovery with dedicated mood profiles and real-time inventory.
        </p>

        {/* Search Input Box */}
        <div style={{ position: 'relative', maxWidth: '720px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={18}
                color="var(--text-subtle)"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search by title, author, keyword, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions && setShowSuggestions(true)}
                className="input-field"
                style={{ paddingLeft: '2.75rem', height: '3.2rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
              Search
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '105%',
                left: 0,
                right: 0,
                zIndex: 40,
                padding: '0.75rem',
                maxHeight: '320px',
                overflowY: 'auto'
              }}
            >
              {suggestions.books?.length > 0 && (
                <div style={{ marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Books</div>
                  {suggestions.books.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => { setSearchQuery(b.title); setShowSuggestions(false); }}
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '4px' }}
                      className="glass-panel-hover"
                    >
                      {b.title}
                    </div>
                  ))}
                </div>
              )}

              {suggestions.authors?.length > 0 && (
                <div style={{ marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Authors</div>
                  {suggestions.authors.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => { setSelectedAuthor(a.id); setShowSuggestions(false); }}
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '4px' }}
                      className="glass-panel-hover"
                    >
                      by {a.name}
                    </div>
                  ))}
                </div>
              )}

              {suggestions.moods?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Moods</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {suggestions.moods.map((m) => (
                      <MoodChip
                        key={m.id}
                        mood={m}
                        isSelected={selectedMoods.includes(m.slug)}
                        onClick={() => { handleToggleMood(m); setShowSuggestions(false); }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Responsive Layout (Section 88) */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Filter Sidebar */}
        <aside className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '5.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <Filter size={16} color="var(--accent-primary)" /> Filters
            </div>
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              title="Reset all filters"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Mood Selector Chips (Multi-select) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.6rem', color: '#c7d2fe' }}>
              Discover by Mood {selectedMoods.length > 0 && `(${selectedMoods.length})`}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {moods.map((m) => (
                <MoodChip
                  key={m.id}
                  mood={m}
                  isSelected={selectedMoods.includes(m.slug)}
                  onClick={handleToggleMood}
                />
              ))}
            </div>
          </div>

          {/* Genre Dropdown */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.85rem' }}
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.slug}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Author Dropdown */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Author
            </label>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.85rem' }}
            >
              <option value="">All Authors</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Rating Threshold */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Minimum Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.85rem' }}
            >
              <option value="">Any Rating</option>
              <option value="4.5">★ 4.5 and above</option>
              <option value="4.0">★ 4.0 and above</option>
              <option value="3.0">★ 3.0 and above</option>
            </select>
          </div>

          {/* Availability Toggle */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input
              type="checkbox"
              id="availOnly"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              style={{ width: '1rem', height: '1rem', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <label htmlFor="availOnly" style={{ fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-main)' }}>
              Currently Available Only
            </label>
          </div>

        </aside>

        {/* Right Results Grid */}
        <div>
          {/* Top Sort & Count Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing <strong>{books.length}</strong> of <strong>{totalCount}</strong> books
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Sort by:</span>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="input-field"
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="relevance">Relevance</option>
                <option value="-average_rating">Highest Rated</option>
                <option value="-created_at">Newest Arrivals</option>
                <option value="title">Title (A-Z)</option>
                <option value="-available_copies">Available Copies</option>
              </select>
            </div>
          </div>

          {/* Books Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              Filtering catalog...
            </div>
          ) : books.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <BookOpen size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No books matched your criteria</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
                Try removing some filters or exploring a different mood profile.
              </p>
              <button onClick={handleResetFilters} className="btn btn-secondary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="book-grid">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelectBook={onSelectBook}
                  onBorrow={onBorrow}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
              <button
                onClick={() => fetchFilteredBooks(currentPage - 1)}
                disabled={currentPage <= 1}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                onClick={() => fetchFilteredBooks(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
