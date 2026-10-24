import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useProgressStore } from '../store/progressStore';
import { sortByReleaseOrder, sortProductionsByMode } from '../utils/releaseOrder';
import { getNextToWatch, calculateProgressStats } from '../utils/nextToWatch';
import { filterByPreset, getPreset } from '../utils/presets';
import { NextToWatchCard } from '../components/dashboard/NextToWatch';
import { ProgressStatsCard } from '../components/dashboard/ProgressStats';
import { TierBadge } from '../components/shared/TierBadge';
import { Poster } from '../components/shared/Poster';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { getReleaseYear } from '../utils/releaseOrder';
import { ChevronRight, Calendar, Zap } from 'lucide-react';
import type { Production } from '../types';

export default function Home() {
  const { catalog, loading, error } = useCatalog();
  const { progress } = useProgressStore();

  const preset = getPreset(progress.preferences.activePreset);

  const sortedFiltered = useMemo(() => {
    const filtered = filterByPreset(catalog, preset) as Production[];
    const visible = progress.preferences.showUpcoming
      ? filtered
      : filtered.filter((p) => !p.isUpcoming);
    const effectiveMode = preset.id === 'complete-marvel' ? 'release' : progress.preferences.orderMode;
    return sortProductionsByMode(visible, effectiveMode);
  }, [catalog, preset, progress.preferences.showUpcoming, progress.preferences.orderMode]);

  const nextToWatch = useMemo(
    () => getNextToWatch(sortedFiltered, progress.watchProgress),
    [sortedFiltered, progress.watchProgress]
  );

  const stats = useMemo(
    () => calculateProgressStats(sortedFiltered, progress.watchProgress),
    [sortedFiltered, progress.watchProgress]
  );

  // Recently completed (last 5)
  const recentlyCompleted = useMemo(() => {
    return sortedFiltered
      .filter((p) => progress.watchProgress[p.id]?.status === 'completed')
      .sort((a, b) => {
        const tA = progress.watchProgress[a.id]?.updatedAt ?? '';
        const tB = progress.watchProgress[b.id]?.updatedAt ?? '';
        return tB.localeCompare(tA);
      })
      .slice(0, 5);
  }, [sortedFiltered, progress.watchProgress]);

  // Upcoming releases (next 3)
  const upcoming = useMemo(() => {
    return catalog
      .filter((p) => p.isUpcoming && p.releaseDate)
      .sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? ''))
      .slice(0, 3);
  }, [catalog]);

  if (loading) return <PageLoader />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      {/* Hero: Next to Watch */}
      <section aria-label="Next to watch" style={{ marginBottom: '2rem' }}>
        <div className="section-title">
          <Zap size={18} color="var(--accent-red)" /> Next to Watch
        </div>
        <ErrorBoundary>
          <NextToWatchCard production={nextToWatch as any} />
        </ErrorBoundary>
      </section>

      {/* Progress */}
      <section aria-label="Watch progress" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="section-title" style={{ margin: 0 }}>Progress</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Preset: <strong style={{ color: 'var(--text-secondary)' }}>{preset.label}</strong>
          </span>
        </div>
        {stats.total === 0 ? (
          <div className="alert alert-info">
            Mark your first title to get started. Try the timeline to browse all titles!
          </div>
        ) : (
          <ErrorBoundary>
            <ProgressStatsCard stats={stats} />
          </ErrorBoundary>
        )}
      </section>

      {/* Bottom cards grid */}
      <div className="dashboard-grid">
        {/* Recently Completed */}
        <div>
          <div className="section-title">Recently Completed</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {recentlyCompleted.length === 0 ? (
              <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                No completed titles yet
              </div>
            ) : (
              recentlyCompleted.map((p) => (
                <Link
                  key={p.id}
                  to={`/title/${p.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                    <Poster url={p.posterUrl} title={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{getReleaseYear(p.releaseDate)}</div>
                  </div>
                  <TierBadge tier={p.tier} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Releases */}
        <div>
          <div className="section-title">
            <Calendar size={18} /> Upcoming
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {upcoming.length === 0 ? (
              <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No upcoming titles</div>
            ) : (
              upcoming.map((p) => (
                <Link
                  key={p.id}
                  to={`/title/${p.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{p.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                      {p.releaseDate ?? 'TBA'}
                    </div>
                  </div>
                  <TierBadge tier={p.tier} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="section-title">Quick Links</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { to: '/timeline', label: 'Browse Full Timeline', desc: 'All titles in release order' },
              { to: '/doomsday', label: '⚡ Doomsday Prep', desc: 'Get ready for Dec 2026' },
              { to: '/franchises', label: 'Browse Franchises', desc: 'By universe and series' },
              { to: '/settings', label: 'Settings & Backup', desc: 'Export / import progress' },
            ].map(({ to, label, desc }) => (
              <Link
                key={to}
                to={to}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'border-color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--text-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent-red)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span>Loading Marvel catalog…</span>
    </div>
  );
}
