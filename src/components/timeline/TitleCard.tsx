import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { Production, StreamingRecord } from '../../types';
import { Poster } from '../shared/Poster';
import { TierBadge } from '../shared/TierBadge';
import { WatchCheckbox, WatchStatusSelect } from '../shared/WatchStatus';
import { StreamingBadges } from '../shared/StreamingBadges';
import { getReleaseYear, formatRuntime } from '../../utils/releaseOrder';
import { useProgressStore } from '../../store/progressStore';
import { requestStreamingForViewport } from '../../utils/streamingApi';

interface TitleCardProps {
  production: Production & { computedStreamingAvailability?: StreamingRecord | null };
}

export const TitleCard: React.FC<TitleCardProps> = ({ production: p }) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const { progress } = useProgressStore();
  const status = progress.watchProgress[p.id]?.status ?? 'not_started';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';
  const isSkipped = status === 'skipped';
  const [dominantTint, setDominantTint] = useState<string | null>(null);

  // Viewport-based on-demand streaming lookup
  useEffect(() => {
    if (!cardRef.current || !p.tmdbId) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestStreamingForViewport({
            id: p.id,
            tmdbId: p.tmdbId,
            contentType: p.contentType,
          });
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [p.id, p.tmdbId, p.contentType]);

  return (
    <div
      ref={cardRef}
      className={`title-card fade-in ${isCompleted ? 'completed' : ''} ${isInProgress ? 'in-progress' : ''} ${isSkipped ? 'skipped' : ''}`}
      onClick={() => navigate(`/title/${p.id}`)}
      role="article"
      aria-label={p.title}
    >
      {/* Poster */}
      <div className="title-card-poster">
        <Poster
          url={p.posterUrl}
          title={p.title}
          onColorExtracted={setDominantTint}
        />
        <div className="poster-vignette" />

        {/* Diagonal WATCHED watermark text on poster for completed cards */}
        {isCompleted && (
          <div className="card-watched-watermark" aria-hidden="true">
            WATCHED
          </div>
        )}

        {/* Series episode/season pill badge on top-right of poster */}
        {(p.contentType === 'series' || p.contentType === 'animated-series') && (
          <div
            className="series-pill-badge"
            title={p.episodeCount ? `${p.episodeCount} Episodes` : 'Series'}
          >
            {p.episodeCount ? `${p.episodeCount} EP` : p.seasonNumber ? `S${p.seasonNumber}` : 'SERIES'}
          </div>
        )}

        {/* Completed green checkmark badge overlay */}
        {isCompleted && (
          <div className="completed-poster-badge" title="Completed" aria-label="Completed">
            <Check size={14} strokeWidth={3} />
          </div>
        )}

        {/* Upcoming overlay */}
        {p.isUpcoming && (
          <div className="upcoming-overlay">
            <span className="upcoming-badge">Upcoming</span>
          </div>
        )}

        {/* Status dot */}
        <div className="title-card-overlay">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TierBadge tier={p.tier} />
            <div className={`status-dot status-dot-${status}`} />
          </div>
        </div>
      </div>

      {/* Body with subtle dominant color tint in footer area */}
      <div
        className="title-card-body"
        style={dominantTint ? { backgroundColor: dominantTint } : undefined}
      >
        <div className="title-card-title">{p.title}</div>
        <div className="title-card-meta">
          <span>{getReleaseYear(p.releaseDate)}</span>
          {p.seasonNumber !== null && (
            <>
              <span className="meta-dot">·</span>
              <span>S{p.seasonNumber}</span>
            </>
          )}
          {p.runtimeMinutes && (
            <>
              <span className="meta-dot">·</span>
              <span>{formatRuntime(p.runtimeMinutes)}</span>
            </>
          )}
        </div>

        {/* Streaming */}
        <StreamingBadges record={p.computedStreamingAvailability ?? null} />

        {/* Actions */}
        <div className="title-card-actions" onClick={(e) => e.stopPropagation()}>
          <WatchCheckbox productionId={p.id} isUpcoming={p.isUpcoming} />
          <WatchStatusSelect productionId={p.id} isUpcoming={p.isUpcoming} />
        </div>
      </div>
    </div>
  );
};
