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
