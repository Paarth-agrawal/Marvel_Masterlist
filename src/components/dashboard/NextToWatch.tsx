import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Production, StreamingRecord } from '../../types';
import { Poster } from '../shared/Poster';
import { TierBadge } from '../shared/TierBadge';
import { StreamingBadges } from '../shared/StreamingBadges';
import { WatchStatusSelect } from '../shared/WatchStatus';
import { getReleaseYear, formatRuntime, formatReleaseDate } from '../../utils/releaseOrder';
import { ChevronRight, Clock, Zap, Check } from 'lucide-react';
import { useProgressStore } from '../../store/progressStore';

interface NextToWatchProps {
  production: (Production & { computedStreamingAvailability?: StreamingRecord | null }) | null;
}

export function NextToWatchCard({ production: p }: NextToWatchProps) {
  const navigate = useNavigate();
  const { setWatchStatus } = useProgressStore();
  const [justWatched, setJustWatched] = useState(false);

  if (!p) {
    return (
      <div className="celebration fade-in">
        <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🏆</div>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.2rem', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
          All Caught Up!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
          You've completed every released Marvel title in your watchlist. You are the most powerful being in the universe.
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
    setJustWatched(true);
    setTimeout(() => {
      setWatchStatus(p.id, 'completed');
      setJustWatched(false);
    }, 400);
  };

  return (
    <div className={`next-to-watch-hero fade-in ${justWatched ? 'card-watched-flash' : ''}`}>
      {/* Blurred poster background art */}
      {p.posterUrl && (
        <div
          className="next-hero-bg-blur"
          style={{ backgroundImage: `url(${p.posterUrl})` }}
          aria-hidden="true"
        />
      )}
      <div className="next-hero-gradient-overlay" aria-hidden="true" />

      {/* Main hero content */}
      <div className="next-hero-content">
        {/* Large Poster on Left */}
        <div
          className="next-hero-poster"
          onClick={() => navigate(`/title/${p.id}`)}
          title={`View ${p.title}`}
        >
          <Poster url={p.posterUrl} title={p.title} width={180} height={270} />
          <div className="poster-vignette" />
        </div>

        {/* Hero Details */}
        <div className="next-hero-details">
          <div className="next-hero-tag">
            <Zap size={14} color="var(--accent-red)" />
            <span>Next to Watch · Recommended</span>
          </div>

          <h2
            className="next-hero-title"
            onClick={() => navigate(`/title/${p.id}`)}
          >
            {p.title}
          </h2>

          <div className="next-hero-meta">
            <TierBadge tier={p.tier} />
            <span className="meta-dot">·</span>
            <span className="next-hero-meta-item">{formatReleaseDate(p.releaseDate)}</span>
            {p.runtimeMinutes && (
              <>
                <span className="meta-dot">·</span>
                <span className="next-hero-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} /> {formatRuntime(p.runtimeMinutes)}
                </span>
              </>
            )}
            {p.seasonNumber !== null && (
              <>
                <span className="meta-dot">·</span>
                <span className="next-hero-meta-item">Season {p.seasonNumber}</span>
              </>
            )}
          </div>

          {p.synopsis && (
            <p className="next-hero-synopsis">
              {p.synopsis}
            </p>
          )}

          {/* Streaming options */}
          <div className="next-hero-streaming">
            <StreamingBadges record={p.computedStreamingAvailability ?? null} />
          </div>

          {/* Action buttons */}
          <div className="next-hero-actions">
            {!p.isUpcoming && (
              <button
                id="hero-mark-watched-btn"
                className="btn btn-primary next-hero-watch-btn"
                onClick={handleMarkWatched}
              >
                <Check size={16} strokeWidth={2.5} />
                <span>{justWatched ? 'Watched ✓' : 'Mark as Watched'}</span>
              </button>
            )}
            <button
              className="btn btn-secondary next-hero-details-btn"
              onClick={() => navigate(`/title/${p.id}`)}
            >
              <span>View Details</span>
              <ChevronRight size={15} />
            </button>
            <div onClick={(e) => e.stopPropagation()}>
              <WatchStatusSelect productionId={p.id} isUpcoming={p.isUpcoming} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
