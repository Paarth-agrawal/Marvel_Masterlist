import React, { useMemo } from 'react';
import type { ProgressStats } from '../../utils/nextToWatch';
import { ProgressBar } from '../shared/ProgressBar';
import { calculatePhaseProgress } from '../../utils/mcuPhases';
import { useProgressStore } from '../../store/progressStore';
import { Film, Tv, Clock, Compass, Shield } from 'lucide-react';

interface ProgressStatsCardProps {
  stats: ProgressStats;
}

export function ProgressStatsCard({ stats }: ProgressStatsCardProps) {
  const { progress } = useProgressStore();
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

  const phaseProgress = useMemo(() => {
    return calculatePhaseProgress(progress.watchProgress);
  }, [progress.watchProgress]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Stats row with large Bebas Neue numbers and small Inter labels */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{total}</div>
          <div className="stat-label">TOTAL</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{completed}</div>
          <div className="stat-label">COMPLETED</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>{inProgress}</div>
          <div className="stat-label">IN PROGRESS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#707080' }}>{skipped}</div>
          <div className="stat-label">SKIPPED</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#9090a8' }}>{notStarted}</div>
          <div className="stat-label">REMAINING</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: completionPercent >= 75 ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
            {completionPercent}%
          </div>
          <div className="stat-label">COMPLETE</div>
        </div>
      </div>

      {/* Your Marvel Journey Section */}
      <div className="card-elevated" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.4rem', letterSpacing: '0.05em' }}>
            <Compass size={18} color="var(--accent-red)" />
            <span>YOUR MARVEL JOURNEY</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            MCU Saga &amp; Phase Progress
          </span>
        </div>

        {/* Phase Blocks */}
        <div className="journey-phases-grid">
          {phaseProgress.map((p) => {
            const isFinished = p.completed === p.total && p.total > 0;
            return (
              <div key={p.phase} className={`journey-phase-card ${isFinished ? 'phase-completed' : ''}`}>
                <div className="journey-phase-header">
                  <div className="journey-phase-name">{p.name}</div>
                  <div className="journey-phase-count">
                    {p.completed}/{p.total}
                  </div>
                </div>
                <div className="journey-phase-years">{p.years}</div>
                <div className="journey-phase-bar-track">
                  <div
                    className="journey-phase-bar-fill"
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
                <div className="journey-phase-footer">
                  <span className="journey-phase-pct">{p.percent}%</span>
                  {isFinished && <span className="journey-phase-badge">Completed ✓</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Breakdown Progress Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
          <ProgressBar
            value={completionPercent}
            height={9}
            showLabel
            label="Overall Watchlist"
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
            label={`Series & TV (${seriesCompleted}/${seriesTotal})`}
          />

          {estimatedHoursRemaining > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', paddingTop: '0.25rem' }}>
              <Clock size={14} color="var(--accent-gold)" />
              <span>Approximately <strong>{estimatedHoursRemaining} hours</strong> of Marvel screen time remaining</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
