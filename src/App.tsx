import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { MilestoneToast } from './components/shared/MilestoneToast';

const Home       = lazy(() => import('./pages/Home'));
const Timeline   = lazy(() => import('./pages/Timeline'));
const Watchlist  = lazy(() => import('./pages/Watchlist'));
const Doomsday   = lazy(() => import('./pages/Doomsday'));
const Franchises = lazy(() => import('./pages/Franchises'));
const Search     = lazy(() => import('./pages/Search'));
const TitleDetail = lazy(() => import('./pages/TitleDetail'));
const Settings   = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent-red)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <span style={{ fontSize: '0.85rem' }}>Loading…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <Header />
      <MilestoneToast />
      <main className="main-content">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"           element={<Home />} />
              <Route path="/timeline"   element={<Timeline />} />
              <Route path="/watchlist"  element={<Watchlist />} />
              <Route path="/doomsday"   element={<Doomsday />} />
              <Route path="/franchises" element={<Franchises />} />
              <Route path="/search"     element={<Search />} />
              <Route path="/title/:id"  element={<TitleDetail />} />
              <Route path="/settings"   element={<Settings />} />
              <Route path="*"           element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="empty-state" style={{ paddingTop: '6rem' }}>
      <div className="empty-state-icon">404</div>
      <h3>Page Not Found</h3>
      <p>This page doesn't exist in any known universe.</p>
      <br />
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  );
}
