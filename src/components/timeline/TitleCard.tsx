import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { Production, StreamingRecord } from '../../types';
import { Poster } from '../shared/Poster';
import { TierBadge } from '../shared/TierBadge';
import { WatchCheckbox, WatchStatusSelect } from '../shared/WatchStatus';
import { StreamingBadges } from '../shared/StreamingBadges';
import { getReleaseYear } from '../../utils/releaseOrder';
import { useProgressStore } from '../../store/progressStore';

interface TitleCardProps {
  production: Production & { computedStreamingAvailability?: StreamingRecord | null };
}

export const TitleCard: React.FC<TitleCardProps> = ({ production: p }) => {
  const navigate = useNavigate();
  const { progress } = useProgressStore();
  const status = progress.watchProgress[p.id]?.status ?? 'not_started';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';
  const isSkipped = status === 'skipped';

  return (
    <div
      className={`title-card fade-in ${isCompleted ? 'completed' : ''} ${isInProgress ? 'in-progress' : ''} ${isSkipped ? 'skipped' : ''}`}
      onClick={() => navigate(`/title/${p.id}`)}
      role="article"
      aria-label={p.title}
    >
      {/* Poster */}
      <div className="title-card-poster">
        <Poster url={p.posterUrl} title={p.title} />
        <div className="poster-vignette" />

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

      {/* Body */}
      <div className="title-card-body">
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
              <span>{p.runtimeMinutes}m</span>
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
