import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useCatalog } from '../hooks/useCatalog';
import { TierBadge } from '../components/shared/TierBadge';
import { Poster } from '../components/shared/Poster';
import { WatchStatusSelect } from '../components/shared/WatchStatus';
import { getReleaseYear } from '../utils/releaseOrder';
import type { Production } from '../types';

export default function Search() {
  const { catalog } = useCatalog();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(catalog as Production[], {
        keys: [
          { name: 'title', weight: 1.0 },
          { name: 'alternativeTitles', weight: 0.8 },
          { name: 'franchise', weight: 0.6 },
          { name: 'synopsis', weight: 0.3 },
        ],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [catalog]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query]);

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <div className="page-header">
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">Find any Marvel title across all universes</p>
      </div>

      {/* Search input */}
      <div className="search-input-wrapper" style={{ maxWidth: 600, marginBottom: '1.5rem' }}>
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          id="search-main-input"
          type="search"
          className="search-input"
          placeholder="Search by title, franchise, or synopsis…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          aria-label="Search all Marvel titles"
          style={{ fontSize: '1rem', padding: '0.65rem 1rem 0.65rem 2.75rem' }}
        />
      </div>

      {/* Results */}
      {query.trim() === '' ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <div className="empty-state-icon">🔍</div>
          <h3>Start Typing</h3>
          <p>Search across {catalog.length} Marvel titles</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <div className="empty-state-icon">😕</div>
          <h3>No Results</h3>
          <p>No titles found for "<strong>{query}</strong>"</p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "<strong style={{ color: 'var(--text-secondary)' }}>{query}</strong>"
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {results.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr auto',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderBottom: i < results.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onClick={() => navigate(`/title/${p.id}`)}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 52, height: 78, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                  <Poster url={p.posterUrl} title={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{p.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <TierBadge tier={p.tier} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {getReleaseYear(p.releaseDate)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.franchise}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {p.synopsis}
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <WatchStatusSelect productionId={p.id} isUpcoming={p.isUpcoming} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
