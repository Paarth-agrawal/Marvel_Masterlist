import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Production, StreamingRecord } from '../../types';
import { Poster } from '../shared/Poster';
import { TierBadge } from '../shared/TierBadge';
import { WatchCheckbox, WatchStatusSelect } from '../shared/WatchStatus';
import { StreamingBadges } from '../shared/StreamingBadges';
import { getReleaseYear } from '../../utils/releaseOrder';
import { useProgressStore } from '../../store/progressStore';

interface TitleRowProps {
  production: Production & { computedStreamingAvailability?: StreamingRecord | null };
  index: number;
}

export const TitleRow: React.FC<TitleRowProps> = ({ production: p, index }) => {
  const navigate = useNavigate();
  const { progress } = useProgressStore();
  const status = progress.watchProgress[p.id]?.status ?? 'not_started';

  return (
    <div
      className="title-row fade-in"
      style={{ animationDelay: `${Math.min(index * 15, 300)}ms` }}
      onClick={() => navigate(`/title/${p.id}`)}
      role="row"
      aria-label={p.title}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <WatchCheckbox productionId={p.id} isUpcoming={p.isUpcoming} />
      </div>

      {/* Thumbnail */}
      <div className="title-row-thumb">
        <Poster url={p.posterUrl} title={p.title} />
      </div>

      {/* Info */}
      <div className="title-row-info">
        <div className="title-row-name">{p.title}</div>
        <div className="title-row-sub">
          {p.franchise}
          {p.isUpcoming && ' · Upcoming'}
        </div>
      </div>

      {/* Year */}
      <div className="title-row-year" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
        {getReleaseYear(p.releaseDate)}
      </div>

      {/* Tier */}
      <div className="title-row-tier" style={{ flexShrink: 0 }}>
        <TierBadge tier={p.tier} />
      </div>

      {/* Status */}
      <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
        <WatchStatusSelect productionId={p.id} isUpcoming={p.isUpcoming} />
      </div>
    </div>
  );
};
