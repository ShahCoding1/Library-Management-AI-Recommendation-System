import React from 'react';
import { BookOpen, Award, CheckCircle, Database, Cpu, Activity } from 'lucide-react';

export default function Footer({ onOpenAuth }) {
  return (
    <footer style={{
      marginTop: '5rem',
      borderTop: '1px solid var(--border-glass)',
      background: 'rgba(11, 15, 25, 0.95)',
      padding: '3.5rem 0 2rem 0',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          
          {/* Col 1: System Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '2rem', height: '2rem', borderRadius: '6px',
                background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <BookOpen size={16} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>LIBRI<span className="gradient-text">FYP</span></span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Master Full-Stack Final Year Project (FYP) combining atomic library circulation, genuine TF-IDF and collaborative filtering, 18-profile mood discovery, and validated screen-time analytics.
            </p>
          </div>

          {/* Col 2: Academic Features */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Academic Core
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#10b981" /> Scikit-Learn TF-IDF Cosine Recommender
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#10b981" /> Item-Based Collaborative Filtering
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#10b981" /> 18-Profile Mood Search & Discovery
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#10b981" /> Validated Reading Time & Streaks
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#10b981" /> Atomic Concurrency Inventory & Loans
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture Stack */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System Architecture
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={15} color="#38bdf8" />
                <span>Django ORM & PostgreSQL-Ready Relational DB</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={15} color="#a855f7" />
                <span>Python ML Inference & Feature Matrices</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={15} color="#34d399" />
                <span>React 19 Frontend + Vanilla CSS Tokens</span>
              </div>
            </div>
          </div>

          {/* Col 4: Viva Quick Demo Guide */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Viva Demo Credentials
            </h4>
            <div className="glass-panel" style={{ padding: '0.85rem', fontSize: '0.8rem', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong style={{ color: '#fbbf24' }}>Reader:</strong> reader@library.com
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong style={{ color: '#38bdf8' }}>Librarian:</strong> librarian@library.com
              </div>
              <div>
                <strong style={{ color: '#f43f5e' }}>Admin:</strong> admin@library.com
              </div>
              <div style={{ marginTop: '0.4rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                Password: <code>Reader123!</code> / <code>Admin123!</code>
              </div>
            </div>
          </div>

        </div>

        <div style={{
          borderTop: '1px solid var(--border-glass)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-subtle)'
        }}>
          <div>© 2026 Master Full-Stack + AI University Final Year Project (FYP). Production Standard.</div>
          <div>Version 1.0-Production</div>
        </div>
      </div>
    </footer>
  );
}
