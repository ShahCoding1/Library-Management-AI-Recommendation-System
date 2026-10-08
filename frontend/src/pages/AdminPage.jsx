import React, { useState, useEffect } from 'react';
import { Shield, Users, BookOpen, Clock, Activity, Cpu, RotateCcw, Search, CheckCircle, AlertTriangle, RefreshCw, Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../services/api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [recStats, setRecStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);

  // Recommendation debug tool
  const [debugBookId, setDebugBookId] = useState('');
  const [debugUserId, setDebugUserId] = useState('');
  const [debugResult, setDebugResult] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);

  // New Book Modal
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    subtitle: '',
    description: '',
    isbn: '',
    publication_year: 2024,
    page_count: 320,
    cover_image_url: '',
    initial_copies: 3
  });

  const fetchOverview = () => {
    setLoading(true);
    Promise.all([
      api.getAdminAnalytics().catch(() => null),
      api.getAdminRecStats().catch(() => null),
      api.getAdminUsers().catch(() => null),
      api.getAdminLoans().catch(() => null),
      api.getAdminAuditLogs().catch(() => null),
    ]).then(([statRes, rStatRes, uRes, lRes, aRes]) => {
      setAdminStats(statRes);
      setRecStats(rStatRes);
      setUsers(uRes?.results || uRes || []);
      setLoans(lRes?.results || lRes || []);
      setAuditLogs(aRes?.results || aRes || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRebuildModel = async () => {
    if (!window.confirm("Trigger re-computation and serialization of the TF-IDF feature matrix?")) return;
    setRebuilding(true);
    try {
      const res = await api.rebuildRecommendationModel();
      alert(res.message || "Recommendation model rebuilt successfully!");
      fetchOverview();
    } catch (err) {
      alert(err.message || "Failed to rebuild recommendation model.");
    } finally {
      setRebuilding(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.message || "Failed to update user role");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const updated = !currentStatus;
      await api.updateUserStatus(userId, updated);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: updated } : u));
    } catch (err) {
      alert(err.message || "Failed to update user status");
    }
  };

  const handleRunDebug = async (e) => {
    e.preventDefault();
    setDebugLoading(true);
    try {
      const data = await api.getAdminRecDebug(debugBookId, debugUserId);
      setDebugResult(data);
    } catch (err) {
      alert(err.message || "Failed to run rec debug");
    } finally {
      setDebugLoading(false);
    }
  };

  const handleCreateBookSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createBook(newBook);
      alert(`Book "${newBook.title}" successfully added to library catalog!`);
      setShowAddBookModal(false);
      setNewBook({
        title: '', subtitle: '', description: '', isbn: '',
        publication_year: 2024, page_count: 320, cover_image_url: '', initial_copies: 3
      });
      fetchOverview();
    } catch (err) {
      alert(err.message || "Failed to create book");
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Admin Portal Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <Shield size={16} /> Administrative & Librarian Control Center
          </div>
          <h1 className="section-title">System Management & ML Telemetry</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleRebuildModel}
            disabled={rebuilding}
            className="btn btn-outline btn-sm"
          >
            <RefreshCw size={14} className={rebuilding ? "animate-spin" : ""} />
            {rebuilding ? "Rebuilding Matrix..." : "Rebuild TF-IDF Model"}
          </button>
          
          <button
            onClick={() => setShowAddBookModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} /> Add New Catalog Book
          </button>

          <button onClick={fetchOverview} className="btn btn-secondary btn-sm">
            <RotateCcw size={14} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            color: activeTab === 'overview' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'overview' ? '2px solid var(--accent-primary)' : '2px solid transparent'
          }}
        >
          System Overview
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            color: activeTab === 'loans' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'loans' ? '2px solid var(--accent-primary)' : '2px solid transparent'
          }}
        >
          Circulation Desk ({loans.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            color: activeTab === 'users' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'users' ? '2px solid var(--accent-primary)' : '2px solid transparent'
          }}
        >
          User Accounts & Roles ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('recs')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            color: activeTab === 'recs' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'recs' ? '2px solid var(--accent-primary)' : '2px solid transparent'
          }}
        >
          ML Rec Engine & Vectors
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            color: activeTab === 'audit' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'audit' ? '2px solid var(--accent-primary)' : '2px solid transparent'
          }}
        >
          Audit Ledger ({auditLogs.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading administrative records...
        </div>
      ) : activeTab === 'overview' ? (
        <div>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Catalog Titles</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{adminStats?.total_books || 0}</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Registered Patrons</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{adminStats?.total_users || 0}</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Active Loans</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{adminStats?.active_loans || 0}</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Overdue Loans</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>{adminStats?.overdue_loans || 0}</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Rec Engine CTR</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8' }}>{adminStats?.recommendation_ctr || 0}%</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Total Screen-Time</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>{adminStats?.total_reading_time_hours || 0}h</div>
            </div>
          </div>

          {/* Platform 7-Day Trend Chart */}
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Platform-Wide Reading Screen-Time (Last 7 Days)
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '160px', gap: '1rem', paddingTop: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
              {adminStats?.reading_trends?.map((t, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem' }}>{t.hours}h</div>
                  <div style={{ width: '32px', height: `${Math.max(t.hours * 15, 6)}%`, background: 'var(--grad-primary)', borderRadius: '4px 4px 0 0' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'loans' ? (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Active & Overdue Circulation Desk</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-subtle)' }}>
                <th style={{ padding: '0.75rem' }}>Book Title</th>
                <th style={{ padding: '0.75rem' }}>Patron</th>
                <th style={{ padding: '0.75rem' }}>Copy Code</th>
                <th style={{ padding: '0.75rem' }}>Issue Date</th>
                <th style={{ padding: '0.75rem' }}>Due Date</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{loan.book?.title}</td>
                  <td style={{ padding: '0.75rem' }}>{loan.user?.email}</td>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{loan.copy_code}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(loan.issue_date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(loan.due_date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${loan.is_overdue ? 'badge-danger' : 'badge-success'}`}>
                      {loan.is_overdue ? 'OVERDUE' : loan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'users' ? (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Registered System Users & Role Authorization</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-subtle)' }}>
                <th style={{ padding: '0.75rem' }}>Email / Name</th>
                <th style={{ padding: '0.75rem' }}>Assigned Role</th>
                <th style={{ padding: '0.75rem' }}>Account Status</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{u.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.full_name || 'No name set'}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="input-field"
                      style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    >
                      <option value="READER">Reader (Patron)</option>
                      <option value="LIBRARIAN">Librarian</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'recs' ? (
        <div>
          {/* Debug Form */}
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Cpu size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recommendation Algorithm Debugger & Vector Inspector</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Simulate recommendation score calculation, inspect TF-IDF cosine similarity scores, collaborative filtering rating matrix weights, and mood filters.
            </p>

            <form onSubmit={handleRunDebug} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.35rem' }}>Book ID (Optional for Similar Vector)</label>
                <input
                  type="text"
                  placeholder="e.g. 1"
                  value={debugBookId}
                  onChange={(e) => setDebugBookId(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.35rem' }}>User ID (Optional for User Blend)</label>
                <input
                  type="text"
                  placeholder="e.g. 1"
                  value={debugUserId}
                  onChange={(e) => setDebugUserId(e.target.value)}
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={debugLoading} className="btn btn-primary" style={{ height: '2.8rem' }}>
                <Search size={16} /> Run Inspection
              </button>
            </form>

            {debugResult && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.8)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Debug Score Breakdown</h4>
                <pre style={{ fontSize: '0.8rem', color: '#38bdf8', overflowX: 'auto', fontFamily: 'var(--font-mono)' }}>
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Audit Logs */
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Circulation & Inventory Audit Trail</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-subtle)' }}>
                <th style={{ padding: '0.65rem' }}>Timestamp</th>
                <th style={{ padding: '0.65rem' }}>Action</th>
                <th style={{ padding: '0.65rem' }}>User</th>
                <th style={{ padding: '0.65rem' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.65rem', color: 'var(--text-subtle)' }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ padding: '0.65rem', fontWeight: 600 }}>{log.action}</td>
                  <td style={{ padding: '0.65rem' }}>{log.user_email || 'System'}</td>
                  <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>{JSON.stringify(log.details || {})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Book Modal */}
      {showAddBookModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Add New Book to Library Catalog</h3>
            <form onSubmit={handleCreateBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Book Title *</label>
                <input
                  type="text" required
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Subtitle</label>
                <input
                  type="text"
                  value={newBook.subtitle}
                  onChange={(e) => setNewBook({ ...newBook, subtitle: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Synopsis / Description *</label>
                <textarea
                  required rows={3}
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Publication Year</label>
                  <input
                    type="number"
                    value={newBook.publication_year}
                    onChange={(e) => setNewBook({ ...newBook, publication_year: parseInt(e.target.value, 10) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Page Count</label>
                  <input
                    type="number"
                    value={newBook.page_count}
                    onChange={(e) => setNewBook({ ...newBook, page_count: parseInt(e.target.value, 10) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Initial Physical Copies</label>
                <input
                  type="number" min="1" max="20"
                  value={newBook.initial_copies}
                  onChange={(e) => setNewBook({ ...newBook, initial_copies: parseInt(e.target.value, 10) })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddBookModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
