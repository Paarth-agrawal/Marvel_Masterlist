import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Production, StreamingRecord } from '../../types';
import { Poster } from '../shared/Poster';
import { TierBadge } from '../shared/TierBadge';
import { StreamingBadges } from '../shared/StreamingBadges';
import { WatchStatusSelect } from '../shared/WatchStatus';
import { getReleaseYear } from '../../utils/releaseOrder';
import { ChevronRight, Clock, Zap } from 'lucide-react';
import { useProgressStore } from '../../store/progressStore';

interface NextToWatchProps {
  production: (Production & { computedStreamingAvailability?: StreamingRecord | null }) | null;
}

export function NextToWatchCard({ production: p }: NextToWatchProps) {
  const navigate = useNavigate();
  const { setWatchStatus } = useProgressStore();

  if (!p) {
    return (
      <div className="celebration fade-in">
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏆</div>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.8rem', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
          All Caught Up!
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          You've completed everything in your current watchlist. Incredible work.
        </p>
      </div>
    );
  }

  const handleMarkWatched = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (p.isUpcoming) {
      alert("This title hasn't been released yet.");
      return;
    }
    setWatchStatus(p.id, 'completed');
  };

  return (
    <div className="next-to-watch fade-in">
      {/* Poster */}
      <div
        className="next-to-watch-poster"
        onClick={() => navigate(`/title/${p.id}`)}
        style={{ cursor: 'pointer' }}
      >
        <Poster url={p.posterUrl} title={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Info */}
      <div>
        <div className="next-to-watch-label">
          <Zap size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
          Next to Watch
        </div>
        <div className="next-to-watch-title">{p.title}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <TierBadge tier={p.tier} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {getReleaseYear(p.releaseDate)}
          </span>
          {p.runtimeMinutes && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Clock size={12} /> {p.runtimeMinutes}m
            </span>
          )}
        </div>

        {/* Streaming */}
        <div style={{ marginBottom: '1rem' }}>
          <StreamingBadges record={p.computedStreamingAvailability ?? null} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {!p.isUpcoming && (
            <button
              id="mark-watched-btn"
              className="btn btn-primary"
              onClick={handleMarkWatched}
            >
              ✓ Mark as Watched
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/title/${p.id}`)}
          >
            Details <ChevronRight size={14} />
          </button>
          <WatchStatusSelect productionId={p.id} isUpcoming={p.isUpcoming} />
        </div>
      </div>
    </div>
  );
}
