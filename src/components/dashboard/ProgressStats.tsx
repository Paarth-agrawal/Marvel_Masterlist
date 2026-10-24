import React from 'react';
import type { ProgressStats } from '../../utils/nextToWatch';
import { ProgressBar } from '../shared/ProgressBar';
import { Film, Tv, Clock, CheckCircle, SkipForward, PlayCircle } from 'lucide-react';

interface ProgressStatsCardProps {
  stats: ProgressStats;
}

export function ProgressStatsCard({ stats }: ProgressStatsCardProps) {
  const {
    total,
    completed,
    inProgress,
    skipped,
    notStarted,
    completionPercent,
    moviesTotal,
    moviesCompleted,
    seriesTotal,
    seriesCompleted,
    estimatedHoursRemaining,
  } = stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text-muted)' }}>{skipped}</div>
          <div className="stat-label">Skipped</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text-secondary)' }}>{notStarted}</div>
          <div className="stat-label">Remaining</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: completionPercent >= 80 ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
            {completionPercent}%
          </div>
          <div className="stat-label">Complete</div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="card-elevated" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ProgressBar
          value={completionPercent}
          height={10}
          showLabel
          label="Overall Progress"
        />
        <ProgressBar
          value={moviesTotal > 0 ? Math.round((moviesCompleted / moviesTotal) * 100) : 0}
          height={6}
          showLabel
          label={`Movies (${moviesCompleted}/${moviesTotal})`}
        />
        <ProgressBar
          value={seriesTotal > 0 ? Math.round((seriesCompleted / seriesTotal) * 100) : 0}
          height={6}
          variant="success"
          showLabel
          label={`Series (${seriesCompleted}/${seriesTotal})`}
        />

        {estimatedHoursRemaining > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', paddingTop: '0.25rem', borderTop: '1px solid var(--border)' }}>
            <Clock size={14} />
            ~{estimatedHoursRemaining} hours remaining to watch
          </div>
        )}
      </div>
    </div>
  );
}
