import React from 'react';

export default function MoodChip({ mood, isSelected, onClick, showCount = false }) {
  const color = mood.color_code || '#6366f1';

  return (
    <button
      onClick={() => onClick && onClick(mood)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.45rem 0.9rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.82rem',
        fontWeight: isSelected ? 700 : 500,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        border: `1px solid ${isSelected ? color : 'var(--border-glass)'}`,
        background: isSelected ? `${color}25` : 'rgba(15, 23, 42, 0.6)',
        color: isSelected ? '#ffffff' : 'var(--text-muted)',
        boxShadow: isSelected ? `0 0 14px ${color}40` : 'none',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: isSelected ? `0 0 8px ${color}` : 'none',
        }}
      />
      <span>{mood.name}</span>
      {showCount && mood.books_count !== undefined && (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginLeft: '2px' }}>
          ({mood.books_count})
        </span>
      )}
    </button>
  );
}
