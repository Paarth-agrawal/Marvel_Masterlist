import React, { useMemo, useCallback, useState } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { useFilters } from '../hooks/useFilters';
import { useProgressStore } from '../store/progressStore';
import { TimelineView } from '../components/timeline/TimelineView';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { calculateProgressStats } from '../utils/nextToWatch';
import { ProgressBar } from '../components/shared/ProgressBar';
import { CheckCircle2, Clock, PlayCircle, SkipForward, Sparkles } from 'lucide-react';
import type { Production, WatchStatus } from '../types';

type WatchlistTab = 'all' | 'in_progress' | 'not_started' | 'completed' | 'skipped';

export default function Watchlist() {
  const { catalog } = useCatalog();
  const { progress } = useProgressStore();
  const [activeTab, setActiveTab] = useState<WatchlistTab>('all');

  const { filters, updateFilter, clearFilters, hasActiveFilters, filtered, presetFiltered } = useFilters(
    catalog as Production[]
  );

  const stats = useMemo(
    () => calculateProgressStats(catalog as Production[], progress.watchProgress),
    [catalog, progress.watchProgress]
  );

  const counts = useMemo(() => {
    let inProgress = 0;
    let notStarted = 0;
    let completed = 0;
    let skipped = 0;

    for (const p of presetFiltered) {
      const status = progress.watchProgress[p.id]?.status ?? 'not_started';
      if (status === 'in_progress') inProgress++;
      else if (status === 'completed') completed++;
      else if (status === 'skipped') skipped++;
      else notStarted++;
    }

    return {
      all: presetFiltered.length,
      in_progress: inProgress,
      not_started: notStarted,
      completed,
      skipped,
    };
  }, [presetFiltered, progress.watchProgress]);

  const handleTabChange = (tab: WatchlistTab) => {
    setActiveTab(tab);
    if (tab === 'all') {
      updateFilter('statuses', []);
    } else {
      updateFilter('statuses', [tab as WatchStatus]);
    }
  };

  const handleSearchChange = useCallback(
    (q: string) => updateFilter('searchQuery', q),
    [updateFilter]
  );

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <h1 className="page-title">My Watchlist</h1>
        <p className="page-subtitle">Track, filter, and organize your personal Marvel journey</p>
      </div>

      {/* Progress summary banner */}
      <div className="card-elevated" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="var(--accent-gold)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Catalog Progress</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.25rem' }}>
            <span><strong>{stats.completed}</strong> completed</span>
            <span><strong>{stats.inProgress}</strong> in progress</span>
            <span><strong>{stats.notStarted}</strong> to watch</span>
            {stats.estimatedHoursRemaining > 0 && (
              <span style={{ color: 'var(--accent-gold)' }}>~{stats.estimatedHoursRemaining}h remaining</span>
            )}
          </div>
        </div>
        <ProgressBar value={stats.completionPercent} height={8} showLabel label="" />
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {([
          { id: 'all', label: 'All Titles', count: counts.all, icon: null },
          { id: 'in_progress', label: 'In Progress', count: counts.in_progress, icon: <PlayCircle size={14} /> },
          { id: 'not_started', label: 'Want to Watch', count: counts.not_started, icon: <Clock size={14} /> },
          { id: 'completed', label: 'Completed', count: counts.completed, icon: <CheckCircle2 size={14} /> },
          { id: 'skipped', label: 'Skipped', count: counts.skipped, icon: <SkipForward size={14} /> },
        ] as const).map(({ id, label, count, icon }) => (
          <button
            key={id}
            className={`pill ${activeTab === id ? 'active' : ''}`}
            onClick={() => handleTabChange(id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            {icon}
            {label}
            <span style={{
              background: activeTab === id ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)',
              borderRadius: '999px',
              padding: '1px 6px',
              fontSize: '0.72rem',
              fontWeight: 600
            }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      <ErrorBoundary>
        <TimelineView
          productions={filtered as Production[]}
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={() => {
            setActiveTab('all');
            clearFilters();
          }}
          hasActiveFilters={hasActiveFilters || activeTab !== 'all'}
          searchQuery={filters.searchQuery}
          onSearchChange={handleSearchChange}
        />
      </ErrorBoundary>
    </div>
  );
}
