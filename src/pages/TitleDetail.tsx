import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useProgressStore } from '../store/progressStore';
import { TierBadge } from '../components/shared/TierBadge';
import { Poster } from '../components/shared/Poster';
import { WatchStatusSelect } from '../components/shared/WatchStatus';
import { StreamingBadges } from '../components/shared/StreamingBadges';
import { formatReleaseDate, getReleaseYear, formatRuntime } from '../utils/releaseOrder';
import { ArrowLeft, Clock, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import type { Production } from '../types';

export default function TitleDetail() {
  const { id } = useParams<{ id: string }>();
  const { catalog } = useCatalog();
  const { progress } = useProgressStore();

  const production = useMemo(
    () => (catalog as any[]).find((p) => p.id === id) as (Production & { computedStreamingAvailability?: any }) | undefined,
    [catalog, id]
  );

  const relatedTitles = useMemo(() => {
    if (!production) return [];
    return (catalog as Production[])
      .filter((p) => p.franchise === production.franchise && p.id !== production.id)
      .sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? ''))
      .slice(0, 6);
  }, [catalog, production]);

  if (!production) {
    return (
      <div className="empty-state" style={{ paddingTop: '4rem' }}>
        <div className="empty-state-icon">🔍</div>
        <h3>Title Not Found</h3>
        <p>No title with ID: <code>{id}</code></p>
        <Link to="/timeline" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Timeline</Link>
      </div>
    );
  }

  const watchStatus = progress.watchProgress[production.id]?.status ?? 'not_started';
  const doomsdayCatLabels: Record<string, string> = {
    essential: 'Essential for Doomsday',
    recommended: 'Recommended for Doomsday',
    optional: 'Optional for Doomsday',
    'multiverse-context': 'Multiverse Context for Doomsday',
  };

  return (
    <div style={{ paddingTop: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Back */}
      <Link to="/timeline" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={14} /> Back to Timeline
      </Link>

      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '2rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ width: 140, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-elevated)', aspectRatio: '2/3', flexShrink: 0 }}>
          <Poster url={production.posterUrl} title={production.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <TierBadge tier={production.tier} />
            {production.isUpcoming && <span className="upcoming-badge" style={{ position: 'static' }}>Upcoming</span>}
            {production.doomsdayCategory && (
              <span style={{ background: 'rgba(192,25,44,0.15)', border: '1px solid rgba(192,25,44,0.35)', borderRadius: 4, padding: '2px 8px', fontSize: '0.7rem', color: '#e05060', fontWeight: 600 }}>
                ⚡ {doomsdayCatLabels[production.doomsdayCategory] ?? production.doomsdayCategory}
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', letterSpacing: '0.05em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
            {production.title}
          </h1>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} /> {formatReleaseDate(production.releaseDate)}
            </span>
            {production.runtimeMinutes && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} /> {formatRuntime(production.runtimeMinutes)}
              </span>
            )}
            {production.ageRating && <span style={{ border: '1px solid var(--border)', borderRadius: 3, padding: '0px 5px', fontSize: '0.72rem' }}>{production.ageRating}</span>}
            {production.seasonNumber !== null && <span>Season {production.seasonNumber}</span>}
            {production.episodeCount !== null && <span>{production.episodeCount} episodes</span>}
          </div>

          {/* Continuity note */}
          {production.continuityNote && (
            <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span><strong>Continuity note:</strong> {production.continuityNote}</span>
            </div>
          )}

          {/* Franchise */}
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Franchise: <strong style={{ color: 'var(--text-primary)' }}>{production.franchise}</strong>
            {' · '}Continuity: <strong style={{ color: 'var(--text-primary)' }}>{production.continuity}</strong>
          </div>

          {/* Watch status */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <WatchStatusSelect productionId={production.id} isUpcoming={production.isUpcoming} size="md" />
            {!production.releaseDateVerified && (
              <span style={{ fontSize: '0.72rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={12} /> Release date unverified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Synopsis */}
      <div className="card-elevated" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="section-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Synopsis</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{production.synopsis}</p>
      </div>

      {/* Streaming */}
      <div className="card-elevated" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="section-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Streaming (India)</div>
        <StreamingBadges record={production.computedStreamingAvailability ?? null} />
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          Availability data may be outdated. Last verified: {production.lastVerified ?? 'Unknown'}
        </p>
      </div>

      {/* External links */}
      {(production.imdbId || production.tmdbId) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {production.imdbId && (
            <a href={`https://www.imdb.com/title/${production.imdbId}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              IMDb <ExternalLink size={12} />
            </a>
          )}
          {production.tmdbId && (
            <a href={`https://www.themoviedb.org/${production.contentType === 'movie' ? 'movie' : 'tv'}/${production.tmdbId}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              TMDB <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      {/* Related titles */}
      {relatedTitles.length > 0 && (
        <div>
          <div className="section-title">More in {production.franchise}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
            {relatedTitles.map((r) => (
              <Link key={r.id} to={`/title/${r.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '2/3', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                    <Poster url={r.posterUrl} title={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '0.4rem', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {r.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Data references */}
      <div style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        ID: <code>{production.id}</code>
        {production.tmdbId && <> · TMDB: {production.tmdbId}</>}
        {production.imdbId && <> · IMDb: {production.imdbId}</>}
        {' · '}Last verified: {production.lastVerified}
      </div>
    </div>
  );
}
