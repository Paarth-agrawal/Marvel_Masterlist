import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import doomsdayData from '../../data/doomsday.json';
import { useCatalog } from '../hooks/useCatalog';
import { useProgressStore } from '../store/progressStore';
import { TierBadge } from '../components/shared/TierBadge';
import { Poster } from '../components/shared/Poster';
import { WatchStatusSelect } from '../components/shared/WatchStatus';
import { getReleaseYear } from '../utils/releaseOrder';
import { Calendar, ChevronRight, Clock, Flame, Info, Sparkles, Check } from 'lucide-react';
import type { Production } from '../types';

function getDoomsdayCountdown() {
  const target = new Date('2026-12-18T00:00:00+05:30').getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function Doomsday() {
  const { catalog } = useCatalog();
  const { progress } = useProgressStore();
  const [countdown, setCountdown] = useState(getDoomsdayCountdown);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getDoomsdayCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const catalogById = useMemo(() => {
    const map = new Map<string, Production>();
    for (const p of catalog) map.set(p.id, p as Production);
    return map;
  }, [catalog]);

  const officialEssential = useMemo(
    () => doomsdayData.recommendations.filter((r) => r.category === 'essential'),
    []
  );

  const stronglyRecommended = useMemo(
    () => doomsdayData.recommendations.filter((r) => r.category === 'recommended'),
    []
  );

  const optionalRecommendations = useMemo(
    () => doomsdayData.recommendations.filter((r) => r.category === 'optional'),
    []
  );

  const renderCard = (rec: (typeof doomsdayData.recommendations)[0]) => {
    const p = catalogById.get(rec.productionId);
    if (!p) return null;
    const watchStatus = progress.watchProgress[p.id]?.status ?? 'not_started';
    const isCompleted = watchStatus === 'completed';

    return (
      <div
        key={rec.productionId}
        className="doomsday-rec-card"
        style={{
          borderLeft: isCompleted
            ? '3px solid var(--success)'
            : rec.status === 'official'
              ? '3px solid var(--accent-gold)'
              : '3px solid var(--border)',
        }}
      >
        {/* Fixed 80x120px poster image on the LEFT */}
        <Link to={`/title/${p.id}`} className="doomsday-rec-poster-box">
          <Poster
            url={p.posterUrl}
            title={p.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Link>

        {/* Content on the RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minWidth: 0 }}>
          <div>
            {/* Title, Year, Tier badge & Source label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link
                  to={`/title/${p.id}`}
                  style={{
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontSize: '1.05rem',
                    textDecoration: 'none',
                    letterSpacing: '0.01em',
                  }}
                >
                  {p.title}
                </Link>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  ({getReleaseYear(p.releaseDate)})
                </span>
                <TierBadge tier={p.tier} />
              </div>

              {/* Source label */}
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '2px 8px',
                  borderRadius: 4,
                  background:
                    rec.status === 'official'
                      ? 'rgba(201, 168, 76, 0.16)'
                      : 'rgba(255, 255, 255, 0.08)',
                  color:
                    rec.status === 'official' ? 'var(--accent-gold)' : '#cbd5e1',
                  border:
                    rec.status === 'official'
                      ? '1px solid rgba(201, 168, 76, 0.4)'
                      : '1px solid var(--border)',
                }}
              >
                {rec.status === 'official' ? 'Official Disney+' : 'Editorial'}
              </span>
            </div>

            {/* Reason text below title */}
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0.35rem 0 0.5rem 0' }}>
              {rec.reason}
            </p>
          </div>

          {/* Watch Status button at the bottom right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.78rem' }}>
              {isCompleted ? (
                <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                  <Check size={14} strokeWidth={3} /> Watched
                </span>
              ) : watchStatus === 'in_progress' ? (
                <span style={{ color: 'var(--accent-gold)' }}>In Progress</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Not Watched</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <WatchStatusSelect productionId={p.id} isUpcoming={p.isUpcoming} />
              <Link to={`/title/${p.id}`} className="btn btn-ghost btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                Details <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ paddingTop: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
      {/* Disclaimer at the very top of the page */}
      <div className="doomsday-top-disclaimer" role="note" aria-label="Official Disclaimer">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <Info size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            The Official Disney+ list is sourced from the &apos;Countdown to Avengers: Doomsday&apos; collection released August 2026. Editorial recommendations are based on confirmed character appearances. No plot details for Doomsday have been officially revealed.
          </div>
        </div>
      </div>

      {/* Hero with live countdown */}
      <div className="doomsday-hero">
        <div className="doomsday-hero-inner">
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="doomsday-hero-badge">
              <Flame size={14} color="var(--accent-red)" />
              <span>MARVEL CINEMATIC UNIVERSE · EVENT RELEASE</span>
            </div>
            <h1 className="doomsday-hero-title">
              AVENGERS: DOOMSDAY
            </h1>
            <p className="doomsday-hero-subtitle">
              All roads lead to Doom. Complete the essential timeline before the multiverse falls.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} color="var(--accent-gold)" />
                18 December 2026
              </span>
              <span>Directors: Anthony &amp; Joe Russo</span>
              <span>Villain: <strong style={{ color: '#ff3b53', textShadow: '0 0 10px rgba(255,59,83,0.5)' }}>Doctor Doom</strong></span>
            </div>

            {/* Live Countdown Timer */}
            <div className="doomsday-countdown-section">
              <div className="doomsday-countdown-label">
                <Clock size={13} color="var(--accent-red)" />
                <span>COUNTDOWN TO DOOMSDAY</span>
              </div>
              <div className="doomsday-countdown-grid">
                <div className="doomsday-countdown-unit">
                  <div className="doomsday-countdown-value">{countdown.days}</div>
                  <div className="doomsday-countdown-sub">DAYS</div>
                </div>
                <div className="doomsday-countdown-colon">:</div>
                <div className="doomsday-countdown-unit">
                  <div className="doomsday-countdown-value">{String(countdown.hours).padStart(2, '0')}</div>
                  <div className="doomsday-countdown-sub">HOURS</div>
                </div>
                <div className="doomsday-countdown-colon">:</div>
                <div className="doomsday-countdown-unit">
                  <div className="doomsday-countdown-value">{String(countdown.minutes).padStart(2, '0')}</div>
                  <div className="doomsday-countdown-sub">MINS</div>
                </div>
                <div className="doomsday-countdown-colon">:</div>
                <div className="doomsday-countdown-unit">
                  <div className="doomsday-countdown-value">{String(countdown.seconds).padStart(2, '0')}</div>
                  <div className="doomsday-countdown-sub">SECS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. OFFICIAL DISNEY+ WATCHLIST (ESSENTIAL TIER) ───────── */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="doomsday-official-banner">
          <Sparkles size={18} />
          <span>Official Disney+ Recommendation — Countdown to Avengers: Doomsday</span>
        </div>

        <div className="section-title doomsday-header-official">
          ✓ Official Disney+ List — 15 titles
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {officialEssential.map((rec) => renderCard(rec))}
        </div>
      </section>

      {/* ── 2. STRONGLY RECOMMENDED (EDITORIAL) ────────────────── */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="section-title doomsday-header-recommended">
          Strongly Recommended
        </div>
        <div style={{ fontSize: '0.84rem', color: '#cbd5e1', paddingLeft: '0.85rem', marginBottom: '1.25rem', fontWeight: 500 }}>
          Editorial — Based on confirmed character appearances
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {stronglyRecommended.map((rec) => renderCard(rec))}
        </div>
      </section>

      {/* ── 3. OPTIONAL TIER (EDITORIAL) ───────────────────────── */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="section-title doomsday-header-optional">
          Optional
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {optionalRecommendations.map((rec) => renderCard(rec))}
        </div>
      </section>

      {/* Sources */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Sources:</strong>{' '}
        {doomsdayData.filmInfo.sources.join(' · ')}
      </div>
    </div>
  );
}
