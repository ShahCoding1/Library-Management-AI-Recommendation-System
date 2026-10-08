import React, { useState, useEffect } from 'react';
import { Clock, Flame, Award, Target, Calendar, BarChart2, BookOpen, Play, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useReadingSession } from '../contexts/ReadingSessionContext';

export default function AnalyticsPage({ setTab }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { activeSession, startSession } = useReadingSession();

  useEffect(() => {
    api.getUserAnalytics()
      .then((data) => setAnalytics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSession]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Calculating screen-time & reading metrics...
      </div>
    );
  }

  const maxDailyMinutes = Math.max(...(analytics?.daily_trends?.map((d) => d.minutes) || [1]), 60);

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="section-title">Reading Habit & Screen-Time Analytics</h1>
        <p className="section-subtitle">
          Real-time reading duration telemetry, streak tracking, daily goal progress, and content distribution.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        {/* Today's Reading */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Today's Screen-Time</span>
            <Clock size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {analytics?.today_formatted || '0m'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
            Goal: {analytics?.goal_minutes_per_day || 30} mins/day
          </div>
        </div>

        {/* Current Streak */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Current Streak</span>
            <Flame size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
            {analytics?.current_streak_days || 0} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Days</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
            Best: {analytics?.longest_streak_days || 0} consecutive days
          </div>
        </div>

        {/* 7-Day Total */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>This Week</span>
            <Calendar size={18} color="#818cf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#818cf8' }}>
            {analytics?.week_formatted || '0m'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
            {analytics?.total_sessions || 0} sessions total
          </div>
        </div>

        {/* Lifetime Reading */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lifetime Read Time</span>
            <Award size={18} color="#ec4899" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ec4899' }}>
            {analytics?.total_formatted || '0m'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
            Avg session: {analytics?.avg_session_formatted || '0m'}
          </div>
        </div>

      </div>

      {/* Goal Progress Bar Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Daily Reading Goal</h3>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: analytics?.goal_progress_percent >= 100 ? '#34d399' : '#818cf8' }}>
            {analytics?.goal_progress_percent || 0}% Completed
          </span>
        </div>

        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: `${Math.min(analytics?.goal_progress_percent || 0, 100)}%`,
              height: '100%',
              background: 'var(--grad-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s ease-out'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          <span>0m</span>
          <span>Target: {analytics?.goal_minutes_per_day || 30} minutes / day</span>
        </div>
      </div>

      {/* Two Column Section: 7-Day Trend Chart + Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* 7-Day Trend Chart */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} color="var(--accent-cyan)" /> 7-Day Reading Screen-Time
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginBottom: '2rem' }}>
            Minutes spent actively reading in the web app
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
            {analytics?.daily_trends?.map((d, i) => {
              const heightPercent = maxDailyMinutes > 0 ? (d.minutes / maxDailyMinutes) * 100 : 0;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginBottom: '0.4rem' }}>
                    {d.minutes > 0 ? `${d.minutes}m` : ''}
                  </div>
                  <div
                    style={{
                      width: '28px',
                      height: `${Math.max(heightPercent, 4)}%`,
                      background: d.minutes > 0 ? 'var(--grad-primary)' : 'rgba(255,255,255,0.05)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Read Book Mood Distribution */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Top Mood Profile Footprint
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginBottom: '1.5rem' }}>
            Emotional and atmospheric themes across completed reading sessions
          </p>

          {analytics?.mood_distribution?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
              No mood metrics recorded yet. Start reading books from the catalog to build your footprint.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analytics?.mood_distribution?.map((m, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: m.color_code || 'var(--text-main)' }}>{m.name}</span>
                    <span style={{ color: 'var(--text-subtle)' }}>{m.book_count} books</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(m.book_count * 25, 100)}%`,
                        height: '100%',
                        background: m.color_code || 'var(--accent-primary)',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Action Footer */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>Ready for your next session?</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Start a live timer to log your reading progress and sustain your streak.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => startSession(null)} className="btn btn-primary btn-sm">
            <Play size={14} /> Start Freeform Session
          </button>
          <button onClick={() => setTab('catalog')} className="btn btn-secondary btn-sm">
            <BookOpen size={14} /> Choose Book From Catalog
          </button>
        </div>
      </div>

    </div>
  );
}
