import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import doomsdayData from '../../data/doomsday.json';
import { useCatalog } from '../hooks/useCatalog';
import { useProgressStore } from '../store/progressStore';
import { TierBadge } from '../components/shared/TierBadge';
import { Poster } from '../components/shared/Poster';
import { WatchStatusSelect } from '../components/shared/WatchStatus';
import { AlertTriangle, Calendar, ChevronRight, Users } from 'lucide-react';
import type { Production } from '../types';

const CATEGORY_CONFIG = {
  essential:         { label: 'Essential',          color: 'var(--accent-red)',  cls: 'doomsday-category-essential' },
  recommended:       { label: 'Strongly Recommended', color: 'var(--accent-gold)', cls: 'doomsday-category-recommended' },
  optional:          { label: 'Optional',            color: 'var(--text-muted)', cls: 'doomsday-category-optional' },
  'multiverse-context': { label: 'Multiverse Context', color: 'var(--accent-blue)', cls: 'doomsday-category-multiverse-context' },
};

type CategoryKey = keyof typeof CATEGORY_CONFIG;

export default function Doomsday() {
  const { catalog } = useCatalog();
  const { progress } = useProgressStore();

  const catalogById = useMemo(() => {
    const map = new Map<string, Production>();
    for (const p of catalog) map.set(p.id, p as Production);
    return map;
  }, [catalog]);

  const grouped = useMemo(() => {
    const groups: Record<CategoryKey, typeof doomsdayData.recommendations> = {
      essential:          [],
      recommended:        [],
      optional:           [],
      'multiverse-context': [],
    };
    for (const rec of doomsdayData.recommendations) {
      const key = rec.category as CategoryKey;
      if (groups[key]) groups[key].push(rec);
    }
    return groups;
  }, []);

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      {/* Hero */}
      <div className="doomsday-hero">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-red)', fontWeight: 700, marginBottom: '0.5rem' }}>
              AVENGERS: DOOMSDAY
            </div>
            <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
              DOOMSDAY PREPARATION
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} />
                December 18, 2026
              </span>
              <span>Directors: Anthony &amp; Joe Russo</span>
              <span>Villain: Robert Downey Jr. as <strong style={{ color: 'var(--accent-red)' }}>Doctor Doom</strong></span>
            </div>

            {/* Confirmed cast */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={12} /> Confirmed Cast
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {doomsdayData.confirmedCast.map((c) => (
                  <span key={c.actor} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontSize: '0.75rem' }}>
                    {c.actor} <span style={{ color: 'var(--text-muted)' }}>as {c.role}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Unconfirmed */}
            {doomsdayData.unconfirmedCast.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--warning)', marginRight: '0.35rem' }}>Unconfirmed:</span>
                {doomsdayData.unconfirmedCast.map((c) => c.actor).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclosure */}
      <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
        <span>{doomsdayData.filmInfo.disclosureBanner}</span>
      </div>

      {/* Category sections */}
      {(Object.entries(grouped) as [CategoryKey, typeof doomsdayData.recommendations][]).map(([cat, recs]) => {
        if (recs.length === 0) return null;
        const config = CATEGORY_CONFIG[cat];
        return (
          <section key={cat} style={{ marginBottom: '2.5rem' }}>
            <div className="section-title" style={{ borderBottom: `2px solid ${config.color}`, paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: config.color }}>●</span> {config.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recs.map((rec) => {
                const p = catalogById.get(rec.productionId);
                const watchStatus = progress.watchProgress[rec.productionId]?.status ?? 'not_started';
                if (!p) return null;
                return (
                  <div
                    key={rec.productionId}
                    className={`card ${config.cls}`}
                    style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: '1rem', alignItems: 'start' }}
                  >
                    <Link to={`/title/${p.id}`}>
                      <div style={{ width: 56, height: 84, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                        <Poster url={p.posterUrl} title={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </Link>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <Link to={`/title/${p.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', textDecoration: 'none' }}>
                          {p.title}
                        </Link>
                        <TierBadge tier={p.tier} />
                        <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {rec.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.reason}</p>
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <WatchStatusSelect productionId={p.id} isUpcoming={p.isUpcoming} />
                        <Link to={`/title/${p.id}`} className="btn btn-ghost btn-sm">
                          Details <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: watchStatus === 'completed' ? 'var(--success)' : 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                      {watchStatus === 'completed' ? '✓ Done' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Sources */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Sources:</strong>{' '}
        {doomsdayData.filmInfo.sources.join(' · ')}
      </div>
    </div>
  );
}
