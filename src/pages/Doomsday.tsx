import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import doomsdayData from '../../data/doomsday.json';
import { useCatalog } from '../hooks/useCatalog';
import { useProgressStore } from '../store/progressStore';
import { TierBadge } from '../components/shared/TierBadge';
import { Poster } from '../components/shared/Poster';
import { WatchStatusSelect } from '../components/shared/WatchStatus';
import { getReleaseYear } from '../utils/releaseOrder';
import { ChevronRight, Sparkles, Check } from 'lucide-react';
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
            ? '3px solid #2e8b57'
            : rec.status === 'official'
              ? '3px solid #c9a84c'
              : '3px solid #71826a',
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
                  className="doomsday-title-text"
                >
                  {p.title}
                </Link>
                <span className="doomsday-year-text">
                  ({getReleaseYear(p.releaseDate)})
                </span>
                <TierBadge tier={p.tier} />
              </div>

              {/* Source label */}
              <span
                className={rec.status === 'official' ? 'doomsday-badge-official' : 'doomsday-badge-editorial'}
              >
                {rec.status === 'official' ? 'Official Disney+' : 'Editorial'}
              </span>
            </div>

            {/* Reason text below title */}
            <p className="doomsday-reason-text">
              {rec.reason}
            </p>
          </div>

          {/* Watch Status button at the bottom right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.78rem' }}>
              {isCompleted ? (
                <span style={{ color: '#2e8b57', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                  <Check size={14} strokeWidth={3} /> Watched
                </span>
              ) : watchStatus === 'in_progress' ? (
                <span style={{ color: '#c9a84c', fontWeight: 600 }}>In Progress</span>
              ) : (
                <span style={{ color: '#8aab84' }}>Not Watched</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <WatchStatusSelect productionId={p.id} isUpcoming={p.isUpcoming} />
              <Link to={`/title/${p.id}`} className="doomsday-details-link">
                Details <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="doomsday-page">
      <div className="doomsday-container">
        {/* Disclaimer at the very top of the page */}
        <div className="doomsday-top-disclaimer" role="note" aria-label="Official Disclaimer">
          <span className="doomsday-disclaimer-icon" aria-hidden="true">⚠</span>
          <div>
            The Official Disney+ list is sourced from the &apos;Countdown to Avengers: Doomsday&apos; collection released August 2026. Editorial recommendations are based on confirmed character appearances. No plot details for Doomsday have been officially revealed.
          </div>
        </div>

        {/* Header Section with Doctor Doom Theme */}
        <header className="doomsday-header-section">
          <div className="doomsday-eyebrow">
            <span>AVENGERS: DOOMSDAY · DECEMBER 18, 2026</span>
          </div>

          <h1 className="doomsday-title">
            DOOMSDAY
          </h1>

          <div className="doomsday-subtitle">
            December 18, 2026
          </div>

          <p className="doomsday-tagline">
            All roads lead to Doom. Complete the essential timeline before the multiverse falls.
          </p>

          {/* Countdown Timer with Latverian treatment */}
          <div className="doomsday-countdown-timer">
            <div className="doomsday-timer-box">
              <div className="doomsday-timer-num">{countdown.days}</div>
              <div className="doomsday-timer-label">DAYS</div>
            </div>
            <div className="doomsday-timer-colon">:</div>
            <div className="doomsday-timer-box">
              <div className="doomsday-timer-num">{String(countdown.hours).padStart(2, '0')}</div>
              <div className="doomsday-timer-label">HOURS</div>
            </div>
            <div className="doomsday-timer-colon">:</div>
            <div className="doomsday-timer-box">
              <div className="doomsday-timer-num">{String(countdown.minutes).padStart(2, '0')}</div>
              <div className="doomsday-timer-label">MINUTES</div>
            </div>
            <div className="doomsday-timer-colon">:</div>
            <div className="doomsday-timer-box">
              <div className="doomsday-timer-num">{String(countdown.seconds).padStart(2, '0')}</div>
              <div className="doomsday-timer-label">SECONDS</div>
            </div>
          </div>

          <div className="doomsday-header-separator" />
        </header>

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
          <div className="doomsday-sub-recommended">
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
        <div className="doomsday-sources-box">
          <strong style={{ color: '#d4e8d0' }}>Sources:</strong>{' '}
          {doomsdayData.filmInfo.sources.join(' · ')}
        </div>
      </div>
    </div>
  );
}
