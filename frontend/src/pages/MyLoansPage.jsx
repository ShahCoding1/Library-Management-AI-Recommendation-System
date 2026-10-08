import React, { useState, useEffect } from 'react';
import { Bookmark, Clock, RotateCcw, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { api } from '../services/api';

export default function MyLoansPage({ onSelectBook }) {
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.getMyLoans(),
      api.getMyReservations()
    ]).then(([loansRes, resRes]) => {
      setLoans(loansRes || []);
      setReservations(resRes || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturn = async (loanId) => {
    if (!window.confirm("Confirm return of this book?")) return;
    try {
      const res = await api.returnBook(loanId);
      alert(res.message);
      fetchData();
    } catch (err) {
      alert(err.message || "Return failed");
    }
  };

  const handleRenew = async (loanId) => {
    try {
      const res = await api.renewLoan(loanId);
      alert(res.message);
      fetchData();
    } catch (err) {
      alert(err.message || "Renewal failed");
    }
  };

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const returnedLoans = loans.filter((l) => l.status === 'RETURNED');

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">My Loans & Reservations</h1>
        <p className="section-subtitle">
          Track active book loans, renew durations, process returns, and monitor reservation queues.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            color: activeTab === 'active' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'active' ? '2px solid var(--accent-primary)' : '2px solid transparent'
          }}
        >
          Active Loans ({activeLoans.length})
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            color: activeTab === 'reservations' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'reservations' ? '2px solid var(--accent-primary)' : '2px solid transparent'
          }}
        >
          Reservations Queue ({reservations.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            color: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'history' ? '2px solid var(--accent-primary)' : '2px solid transparent'
          }}
        >
          Return History ({returnedLoans.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading your library records...
        </div>
      ) : activeTab === 'active' ? (
        activeLoans.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            You have no active loans right now.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeLoans.map((loan) => (
              <div key={loan.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <img
                    src={loan.book?.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80'}
                    alt=""
                    style={{ width: '4.5rem', height: '6rem', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => onSelectBook && onSelectBook(loan.book)}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.3rem' }}>
                      {loan.book?.title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Issued on: {new Date(loan.issue_date).toLocaleDateString()} • Copy Code: <code>{loan.copy_code}</code>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${loan.is_overdue ? 'badge-danger' : 'badge-success'}`}>
                        {loan.is_overdue ? 'Overdue' : 'Active Loan'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: loan.is_overdue ? '#f87171' : 'var(--text-muted)' }}>
                        Due on: <strong>{new Date(loan.due_date).toLocaleDateString()}</strong>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        (Renewals: {loan.renewal_count}/2)
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleRenew(loan.id)}
                    disabled={loan.renewal_count >= 2 || loan.is_overdue}
                    className="btn btn-secondary btn-sm"
                    title={loan.renewal_count >= 2 ? "Max renewals reached" : "Extend due date by 14 days"}
                  >
                    <RotateCcw size={14} /> Renew (+14 Days)
                  </button>
                  <button
                    onClick={() => handleReturn(loan.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Return Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'reservations' ? (
        reservations.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No active reservations. When all copies of a book are checked out, you can reserve your position here!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reservations.map((res) => (
              <div key={res.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={res.book?.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80'}
                    alt=""
                    style={{ width: '3.5rem', height: '5rem', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.3rem' }}>
                      {res.book?.title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Reserved on {new Date(res.reservation_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Waitlist Position</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>#{res.queue_position}</div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        returnedLoans.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No completed loans in your reading history yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {returnedLoans.map((loan) => (
              <div key={loan.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.2rem' }}>
                    {loan.book?.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Returned on {new Date(loan.return_date).toLocaleDateString()}
                  </div>
                </div>
                <span className="badge badge-success">Returned</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
