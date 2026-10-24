import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Settings } from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog';
import { useProgressStore } from '../../store/progressStore';

const NAV_ITEMS = [
  { to: '/',           label: 'Dashboard' },
  { to: '/timeline',   label: 'Timeline' },
  { to: '/watchlist',  label: 'Watchlist' },
  { to: '/doomsday',   label: '⚡ Doomsday' },
  { to: '/franchises', label: 'Franchises' },
];

export function Header() {
  const navigate = useNavigate();
  const { catalog } = useCatalog();
  const { progress } = useProgressStore();

  const completionPercent = useMemo(() => {
    if (!catalog || catalog.length === 0) return 0;
    const completedCount = catalog.filter(
      (p) => progress.watchProgress[p.id]?.status === 'completed'
    ).length;
    return (completedCount / catalog.length) * 100;
  }, [catalog, progress.watchProgress]);

  return (
    <>
      {/* Top fixed red completion progress bar */}
      <div
        className="global-progress-bar"
        style={{ width: `${completionPercent}%` }}
        role="progressbar"
        aria-valuenow={Math.round(completionPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        title={`Overall Marvel Completion: ${Math.round(completionPercent)}%`}
      />
      <header className="header">
        <div className="header-inner">
          <NavLink to="/" className="header-logo">
            <span className="header-logo-mark">M</span>
            <span className="header-title">MARVEL WATCHLIST</span>
          </NavLink>

          <nav className="header-nav" aria-label="Main navigation">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button
              id="global-search-btn"
              className="icon-btn"
              aria-label="Search"
              title="Search"
              onClick={() => navigate('/search')}
            >
              <Search size={16} />
            </button>

            {/* Circular progress ring next to settings */}
            <div
              className="nav-progress-ring-wrapper"
              title={`Marvel Watchlist Progress: ${Math.round(completionPercent)}%`}
              onClick={() => navigate('/settings')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="34" height="34" viewBox="0 0 34 34" className="nav-progress-ring">
                <circle
                  cx="17"
                  cy="17"
                  r="13"
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="17"
                  cy="17"
                  r="13"
                  fill="transparent"
                  stroke="var(--accent-red)"
                  strokeWidth="2.5"
                  strokeDasharray={2 * Math.PI * 13}
                  strokeDashoffset={2 * Math.PI * 13 * (1 - completionPercent / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 17 17)"
                  style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                />
                <text
                  x="17"
                  y="20.5"
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                >
                  {Math.round(completionPercent)}%
                </text>
              </svg>
            </div>

            <button
              id="settings-btn"
              className="icon-btn"
              aria-label="Settings"
              title="Settings"
              onClick={() => navigate('/settings')}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
