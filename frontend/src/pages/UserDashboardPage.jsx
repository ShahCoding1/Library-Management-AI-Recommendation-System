import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Sparkles, BookOpen, Clock, Flame, CheckCircle, ArrowRight, Bookmark } from 'lucide-react';
import { api } from '../services/api';
import BookCard from '../components/BookCard';
import { useAuth } from '../contexts/AuthContext';
import { useReadingSession } from '../contexts/ReadingSessionContext';

export default function UserDashboardPage({ setTab, onSelectBook, onBorrow }) {
  const { user } = useAuth();
  const { startSession } = useReadingSession();
  const [recommendations, setRecommendations] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      api.getMyRecommendations({ limit: 8 }),
      api.getMyLoans('active'),
      api.getUserAnalytics()
    ]).then(([recRes, loansRes, statsRes]) => {
      const rawRecs = recRes?.results || [];
      setRecommendations(rawRecs.map((r) => ({
        ...r.book,
        recommendationReason: r.reason
      })));
      setActiveLoans(loansRes || []);
      setStats(statsRes);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleReturnLoan = async (loanId) => {
    if (!window.confirm("Confirm return of this borrowed book?")) return;
    try {
      await api.returnBook(loanId);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || "Failed to return book.");
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Greeting Banner */}
      <div className="glass-panel" style={{
        padding: '2.5rem', marginBottom: '2.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              Reader Dashboard
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.full_name || user?.email.split('@')[0]}!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>
              Your reading habit is active today. Explore personalized book recommendations tailored to your reading profile and mood history.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setTab('catalog')} className="btn btn-primary btn-sm">
              <BookOpen size={15} /> Browse Catalog
            </button>
            <button onClick={() => setTab('analytics')} className="btn btn-secondary btn-sm">
              <Clock size={15} /> Analytics
            </button>
          </div>
        </div>

        {/* Quick KPI Metric Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
          
          <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <Clock size={14} color="#34d399" /> Today's Reading
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
              {stats?.today_formatted || '0m'}
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <Flame size={14} color="#f59e0b" /> Current Streak
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
              {stats?.current_streak_days || 0} Days
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <CheckCircle size={14} color="#818cf8" /> Daily Goal Progress
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>
              {stats?.goal_progress_percent || 0}%
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <Bookmark size={14} color="#ec4899" /> Active Loans
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
              {activeLoans.length}
            </div>
          </div>

        </div>
      </div>

      {/* Currently Borrowed Books Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Currently Borrowed Books</h2>
            <p className="section-subtitle" style={{ fontSize: '0.85rem', marginBottom: 0 }}>Books currently checked out under your library card.</p>
          </div>
          <button onClick={() => setTab('loans')} className="btn btn-secondary btn-sm">
            View All Loans <ArrowRight size={14} />
          </button>
        </div>

        {activeLoans.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            You have no active loans right now. Explore the catalog and borrow books for up to 14 days!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {activeLoans.map((loan) => (
              <div key={loan.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={loan.book?.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80'}
                  alt=""
                  style={{ width: '4.5rem', height: '6rem', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={() => onSelectBook(loan.book)}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', marginBottom: '0.2rem' }}>
                    {loan.book?.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Due date: <strong style={{ color: loan.is_overdue ? '#f87171' : '#34d399' }}>{new Date(loan.due_date).toLocaleDateString()}</strong>
                    {loan.is_overdue && ' (OVERDUE)'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleReturnLoan(loan.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    >
                      Return Book
                    </button>
                    <button
                      onClick={() => startSession(loan.book)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    >
                      <Clock size={12} /> Read Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Personalized AI Recommendations Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="#818cf8" />
          </div>
          <h2 className="section-title" style={{ fontSize: '1.6rem', marginBottom: 0 }}>
            Recommended For You
          </h2>
        </div>
        <p className="section-subtitle" style={{ marginBottom: '1.75rem' }}>
          Personalized hybrid blend using your explicit preferences, rating weights, and mood habits.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Synthesizing personalized recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No recommendations generated yet. Rate or favorite some books to build your profile!
          </div>
        ) : (
          <div className="book-grid">
            {recommendations.map((book) => (
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
      </section>

    </div>
  );
}
