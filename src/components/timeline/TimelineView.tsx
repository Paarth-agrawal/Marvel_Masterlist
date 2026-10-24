import React, { useState } from 'react';
import type { Production, ActiveFilters, Tier, ContentType, WatchStatus } from '../../types';
import { TitleCard } from './TitleCard';
import { TitleRow } from './TitleRow';
import { LayoutGrid, List, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useProgressStore } from '../../store/progressStore';
import { PRESETS } from '../../utils/presets';

type ViewMode = 'card' | 'list';

interface TimelineViewProps {
  productions: Production[];
  filters: ActiveFilters;
  updateFilter: <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const TIERS: { id: Tier; label: string }[] = [
  { id: 'mcu',         label: 'MCU' },
  { id: 'x-men',      label: 'X-Men' },
  { id: 'spider-man', label: 'Spider-Man' },
  { id: 'legacy',     label: 'Legacy' },
  { id: 'sony',       label: 'Sony' },
  { id: 'tv',         label: 'Television' },
  { id: 'animation',  label: 'Animation' },
];

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: 'movie',          label: 'Movies' },
  { id: 'series',         label: 'Series' },
  { id: 'animated-series',label: 'Animated' },
  { id: 'special',        label: 'Specials' },
];

const STATUSES: { id: WatchStatus; label: string }[] = [
  { id: 'not_started', label: 'Not Started' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed',   label: 'Completed' },
  { id: 'skipped',     label: 'Skipped' },
];

function toggleInArray<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function TimelineView({
  productions,
  filters,
  updateFilter,
  clearFilters,
  hasActiveFilters,
  searchQuery,
  onSearchChange,
}: TimelineViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [showFilters, setShowFilters] = useState(false);
  const { progress, setPreset, setOrderMode } = useProgressStore();

  const orderMode = progress.preferences.orderMode;
  const activePreset = progress.preferences.activePreset;

  return (
    <div>
      {/* Order mode banner */}
      {orderMode === 'chronology' && activePreset !== 'complete-marvel' && (
        <div className="mode-banner">
          ⚠ Story chronological order — this is not the original release order.
          <button className="btn btn-ghost btn-sm" onClick={() => setOrderMode('release')} style={{ marginLeft: 'auto' }}>
            Switch to Release Order
          </button>
        </div>
      )}

      {/* Controls bar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {/* Search */}
        <div className="search-input-wrapper" style={{ flex: '1 1 200px', minWidth: '160px' }}>
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            id="timeline-search"
            type="search"
            className="search-input"
            placeholder="Search titles…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search timeline"
          />
        </div>

        {/* Preset pills */}
        <div className="pill-group" style={{ flex: '2 1 300px' }}>
          {PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.id}
              className={`pill ${activePreset === preset.id ? 'active' : ''}`}
              onClick={() => setPreset(preset.id)}
              id={`preset-${preset.id}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Order mode toggle */}
        {activePreset === 'complete-marvel' ? (
          <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
            <span
              className="pill active"
              id="order-release-btn"
              title="Complete Marvel is sorted by release date with no exceptions"
            >
              Release Order
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
            <button
              className={`pill ${orderMode === 'release' ? 'active' : ''}`}
              onClick={() => setOrderMode('release')}
              id="order-release-btn"
              title="Release Order (default)"
            >
              Release Order
            </button>
            <button
              className={`pill ${orderMode === 'chronology' ? 'active' : ''}`}
              onClick={() => setOrderMode('chronology')}
              id="order-chronology-btn"
            >
              MCU Story Order
            </button>
          </div>
        )}

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          <button
            id="view-card-btn"
            className={`icon-btn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
            title="Card view"
            style={viewMode === 'card' ? { borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' } : {}}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            id="view-list-btn"
            className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
            style={viewMode === 'list' ? { borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' } : {}}
          >
            <List size={16} />
          </button>
        </div>

        {/* Filter toggle */}
        <button
          id="filter-toggle-btn"
          className={`btn btn-secondary btn-sm ${hasActiveFilters ? '' : ''}`}
          onClick={() => setShowFilters((v) => !v)}
          style={hasActiveFilters ? { borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' } : {}}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && <span style={{ background: 'var(--accent-red)', color: 'white', borderRadius: '999px', padding: '1px 6px', fontSize: '0.7rem' }}>●</span>}
          {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="filter-panel fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filters</span>
            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <X size={14} /> Clear all
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {/* Tier */}
            <div className="filter-section">
              <div className="filter-label">Tier</div>
              <div className="pill-group">
                {TIERS.map(({ id, label }) => (
                  <button
                    key={id}
                    className={`pill ${filters.tiers.includes(id) ? 'active-red' : ''}`}
                    onClick={() => updateFilter('tiers', toggleInArray(filters.tiers, id))}
                    id={`filter-tier-${id}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type */}
            <div className="filter-section">
              <div className="filter-label">Type</div>
              <div className="pill-group">
                {CONTENT_TYPES.map(({ id, label }) => (
                  <button
                    key={id}
                    className={`pill ${filters.contentTypes.includes(id) ? 'active-red' : ''}`}
                    onClick={() => updateFilter('contentTypes', toggleInArray(filters.contentTypes, id))}
                    id={`filter-type-${id}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="filter-section">
              <div className="filter-label">Status</div>
              <div className="pill-group">
                {STATUSES.map(({ id, label }) => (
                  <button
                    key={id}
                    className={`pill ${filters.statuses.includes(id) ? 'active-red' : ''}`}
                    onClick={() => updateFilter('statuses', toggleInArray(filters.statuses, id))}
                    id={`filter-status-${id}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div className="filter-section">
              <div className="filter-label">Special</div>
              <div className="pill-group">
                <button
                  className={`pill ${filters.doomsdayOnly ? 'active-red' : ''}`}
                  onClick={() => updateFilter('doomsdayOnly', !filters.doomsdayOnly)}
                  id="filter-doomsday-only"
                >
                  Doomsday Prep
                </button>
                <button
                  className={`pill ${filters.upcomingOnly ? 'active-red' : ''}`}
                  onClick={() => updateFilter('upcomingOnly', !filters.upcomingOnly)}
                  id="filter-upcoming-only"
                >
                  Upcoming
                </button>
              </div>
            </div>

            {/* Decades */}
            <div className="filter-section">
              <div className="filter-label">Decade</div>
              <div className="pill-group">
                {([
                  { label: "70s/80s", range: [1970, 1989] as [number, number] },
                  { label: "90s", range: [1990, 1999] as [number, number] },
                  { label: "2000s", range: [2000, 2009] as [number, number] },
                  { label: "2010s", range: [2010, 2019] as [number, number] },
                  { label: "2020s", range: [2020, 2029] as [number, number] },
                ]).map(({ label, range }) => {
                  const isActive = filters.decades && filters.decades[0] === range[0] && filters.decades[1] === range[1];
                  return (
                    <button
                      key={label}
                      className={`pill ${isActive ? 'active-red' : ''}`}
                      onClick={() => updateFilter('decades', isActive ? null : range)}
                      id={`filter-decade-${range[0]}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Streaming Platform */}
            <div className="filter-section">
              <div className="filter-label">Streaming (India)</div>
              <div className="pill-group">
                {(['JioHotstar', 'Netflix India', 'Amazon Prime Video India']).map((platform) => (
                  <button
                    key={platform}
                    className={`pill ${filters.streamingPlatforms.includes(platform) ? 'active-red' : ''}`}
                    onClick={() => updateFilter('streamingPlatforms', toggleInArray(filters.streamingPlatforms, platform))}
                    id={`filter-stream-${platform.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {platform.replace(' India', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active:</span>
              {filters.franchises.map((f) => (
                <span key={f} className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '2px 8px' }}>
                  Franchise: {f}
                  <button onClick={() => updateFilter('franchises', filters.franchises.filter((x) => x !== f))} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {filters.tiers.map((t) => (
                <span key={t} className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '2px 8px' }}>
                  Tier: {t.toUpperCase()}
                  <button onClick={() => updateFilter('tiers', filters.tiers.filter((x) => x !== t))} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {filters.contentTypes.map((c) => (
                <span key={c} className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '2px 8px' }}>
                  Type: {c}
                  <button onClick={() => updateFilter('contentTypes', filters.contentTypes.filter((x) => x !== c))} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {filters.statuses.map((s) => (
                <span key={s} className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '2px 8px' }}>
                  Status: {s}
                  <button onClick={() => updateFilter('statuses', filters.statuses.filter((x) => x !== s))} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {filters.doomsdayOnly && (
                <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '2px 8px' }}>
                  Doomsday Prep
                  <button onClick={() => updateFilter('doomsdayOnly', false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.upcomingOnly && (
                <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '2px 8px' }}>
                  Upcoming
                  <button onClick={() => updateFilter('upcomingOnly', false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.decades && (
                <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '2px 8px' }}>
                  {filters.decades[0]}s
                  <button onClick={() => updateFilter('decades', null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.streamingPlatforms.map((p) => (
                <span key={p} className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '2px 8px' }}>
                  {p}
                  <button onClick={() => updateFilter('streamingPlatforms', filters.streamingPlatforms.filter((x) => x !== p))} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {productions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🪐</div>
          <h3>No titles found</h3>
          <p>Perhaps the search was... inevitable.</p>
          {hasActiveFilters && (
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={clearFilters} id="clear-filters-empty-btn">
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === 'card' ? (
        <div className="timeline-grid">
          {productions.map((p) => (
            <TitleCard key={p.id} production={p as any} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {productions.map((p, i) => (
            <TitleRow key={p.id} production={p as any} index={i} />
          ))}
        </div>
      )}

      {productions.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing {productions.length} title{productions.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
