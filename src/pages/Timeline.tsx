import React, { useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useProgressStore } from '../store/progressStore';
import { useFilters } from '../hooks/useFilters';
import { TimelineView } from '../components/timeline/TimelineView';
import { NextToWatchCard } from '../components/dashboard/NextToWatch';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { Poster } from '../components/shared/Poster';
import { TierBadge } from '../components/shared/TierBadge';
import { getNextToWatch } from '../utils/nextToWatch';
import { sortProductionsByMode } from '../utils/releaseOrder';
import { Check, PlayCircle } from 'lucide-react';
import type { Production, Tier } from '../types';

export default function Timeline() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { catalog, error } = useCatalog();
  const { progress, setWatchStatus } = useProgressStore();

  const franchiseParam = searchParams.get('franchise');
  const tierParam = searchParams.get('tier');
  const storedTier = localStorage.getItem('__timeline_tier_filter__');

  const initialTiers: Tier[] = [];
  if (tierParam) initialTiers.push(tierParam as Tier);
  else if (storedTier) {
    initialTiers.push(storedTier as Tier);
    localStorage.removeItem('__timeline_tier_filter__');
  }

  const { filters, updateFilter, clearFilters, hasActiveFilters, filtered, presetFiltered } = useFilters(
    catalog as Production[],
    {
      franchises: franchiseParam ? [franchiseParam] : [],
      tiers: initialTiers,
    }
  );

  useEffect(() => {
    if (franchiseParam && !filters.franchises.includes(franchiseParam)) {
      updateFilter('franchises', [franchiseParam]);
    }
  }, [franchiseParam, filters.franchises, updateFilter]);

  const sortedPreset = useMemo(
    () => sortProductionsByMode(presetFiltered, progress.preferences.orderMode),
    [presetFiltered, progress.preferences.orderMode]
  );

  const nextToWatch = useMemo(
    () => getNextToWatch(sortedPreset, progress.watchProgress),
    [sortedPreset, progress.watchProgress]
  );

  const handleSearchChange = useCallback(
    (q: string) => updateFilter('searchQuery', q),
    [updateFilter]
  );

  if (error) {
    return <div className="alert alert-error" style={{ marginTop: '2rem' }}>{error}</div>;
  }

  return (
    <div style={{ paddingTop: '1rem' }}>
      {/* Sticky Now Watching mini-bar just below navbar */}
      {nextToWatch && (
        <div className="sticky-now-watching" role="region" aria-label="Now Watching Mini-Bar">
          <div className="sticky-now-watching-left">
            <div
              className="sticky-now-watching-thumb"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/title/${nextToWatch.id}`)}
              title={`View ${nextToWatch.title}`}
            >
              <Poster url={nextToWatch.posterUrl} title={nextToWatch.title} />
            </div>
            <div className="sticky-now-watching-info">
              <div className="sticky-now-watching-tag">
                <PlayCircle size={13} color="var(--accent-gold)" />
                <span>Now Watching</span>
                <TierBadge tier={nextToWatch.tier} />
              </div>
              <div
                className="sticky-now-watching-title"
                onClick={() => navigate(`/title/${nextToWatch.id}`)}
                title={`Go to ${nextToWatch.title}`}
              >
                {nextToWatch.title}
              </div>
            </div>
          </div>
          <button
            id="sticky-mark-watched-btn"
            className="sticky-now-watching-btn"
            onClick={() => setWatchStatus(nextToWatch.id, 'completed')}
            title="Mark as Watched"
            aria-label={`Mark ${nextToWatch.title} as Watched`}
          >
            <Check size={14} strokeWidth={2.8} />
            <span>Mark as Watched</span>
          </button>
        </div>
      )}

      {/* Page header */}
      <div className="page-header" style={{ marginTop: '0.5rem' }}>
        <h1 className="page-title">Release Timeline</h1>
        <p className="page-subtitle">
          All Marvel screen content in original release order
          {' '}·{' '}
          <strong style={{ color: 'var(--accent-gold)' }}>
            {progress.preferences.orderMode === 'release' ? 'Release Order' : 'MCU Story Order'}
          </strong>
        </p>
      </div>

      {/* Full Next to Watch hero banner if preferred */}
      {nextToWatch && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorBoundary>
            <NextToWatchCard production={nextToWatch as any} />
          </ErrorBoundary>
        </div>
      )}

      {/* Timeline */}
      <ErrorBoundary>
        <TimelineView
          productions={filtered as Production[]}
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          searchQuery={filters.searchQuery}
          onSearchChange={handleSearchChange}
        />
      </ErrorBoundary>
    </div>
  );
}
