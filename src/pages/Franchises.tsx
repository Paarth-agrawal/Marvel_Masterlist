import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useProgressStore } from '../store/progressStore';
import { TierBadge } from '../components/shared/TierBadge';
import { ProgressBar } from '../components/shared/ProgressBar';
import type { Production, Tier } from '../types';

const TIERS: { id: Tier; label: string; desc: string }[] = [
  { id: 'mcu',         label: 'MCU',                desc: 'Marvel Cinematic Universe — Phase 1–6' },
  { id: 'x-men',      label: 'X-Men Universe',      desc: 'Fox X-Men, Wolverine, pre-MCU Deadpool' },
  { id: 'spider-man', label: 'Spider-Man Franchises',desc: 'Raimi, Webb, Sony Spider-Verse' },
  { id: 'legacy',     label: 'Legacy Marvel',        desc: 'Pre-MCU theatrical: Blade, Fantastic Four, etc.' },
  { id: 'sony',       label: 'Sony Marvel Universe', desc: 'Venom, Morbius, Madame Web, Kraven the Hunter' },
  { id: 'tv',         label: 'Marvel Television',    desc: 'Netflix Defenders-verse, ABC, Hulu, Freeform' },
  { id: 'animation',  label: 'Marvel Animation',     desc: 'Animated series outside MCU/Sony' },
];

export default function Franchises() {
  const { catalog } = useCatalog();
  const { progress } = useProgressStore();

  const tierData = useMemo(() => {
    return TIERS.map((tier) => {
      const titles = (catalog as Production[]).filter((p) => p.tier === tier.id && !p.isUpcoming);
      const completed = titles.filter((p) => progress.watchProgress[p.id]?.status === 'completed').length;
      const percent = titles.length > 0 ? Math.round((completed / titles.length) * 100) : 0;

      // Unique franchises in this tier
      const franchises = [...new Set(titles.map((p) => p.franchise))].sort();

      return { ...tier, titles, completed, percent, franchises };
    });
  }, [catalog, progress.watchProgress]);

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <div className="page-header">
        <h1 className="page-title">Franchise Browser</h1>
        <p className="page-subtitle">Browse Marvel content by universe and franchise</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {tierData.map((tier) => (
          <div key={tier.id} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <TierBadge tier={tier.id} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {tier.completed}/{tier.titles.length}
                  </span>
                </div>
                <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.3rem', letterSpacing: '0.05em' }}>{tier.label}</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{tier.desc}</p>
              </div>
            </div>

            <ProgressBar value={tier.percent} showLabel label="" height={6} />

            {/* Franchise list */}
            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {tier.franchises.slice(0, 12).map((f) => (
                <Link
                  key={f}
                  to={`/timeline?franchise=${encodeURIComponent(f)}`}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontSize: '0.72rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {f}
                </Link>
              ))}
              {tier.franchises.length > 12 && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '2px 4px' }}>
                  +{tier.franchises.length - 12} more
                </span>
              )}
            </div>

            <Link
              to={`/timeline`}
              onClick={() => localStorage.setItem('__timeline_tier_filter__', tier.id)}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
            >
              Browse {tier.label} titles
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
