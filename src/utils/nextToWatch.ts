import type { Production, WatchStatus } from '../types';

/**
 * Implements the Next-to-Watch algorithm from Section 7.
 *
 * 1. Get all titles matching the active preset and filters.
 * 2. Sort by release date (ascending), applying tiebreaker rules.
 * 3. Filter out: completed titles, skipped titles.
 * 4. If a series is "in progress", its next incomplete season takes priority.
 * 5. Return the first remaining title as "Next to Watch."
 * 6. If all titles are complete or skipped, return null (celebration state).
 */
export function getNextToWatch(
  sortedProductions: Production[],
  watchProgress: Record<string, { status: WatchStatus }>
): Production | null {
  // Find any in-progress series
  const inProgressSeries = sortedProductions.filter((p) => {
    const progress = watchProgress[p.id];
    return progress?.status === 'in_progress' && p.seasonNumber !== null;
  });

  // If there are in-progress series, prioritize their next season
  for (const series of inProgressSeries) {
    const parentId = series.parentSeriesId || series.id;
    // Find all seasons of this series
    const seasons = sortedProductions
      .filter((p) => p.parentSeriesId === parentId || p.id === parentId)
      .sort((a, b) => (a.seasonNumber ?? 0) - (b.seasonNumber ?? 0));

    // Find first incomplete season
    for (const season of seasons) {
      const status = watchProgress[season.id]?.status;
      if (!status || status === 'not_started' || status === 'in_progress') {
        return season;
      }
    }
  }

  // Standard: find first not-started or in-progress title
  for (const p of sortedProductions) {
    const status = watchProgress[p.id]?.status;
    if (!status || status === 'not_started' || status === 'in_progress') {
      return p;
    }
  }

  return null; // All complete or skipped
}

/**
 * Calculate progress statistics
 */
export interface ProgressStats {
  total: number;
  completed: number;
  inProgress: number;
  skipped: number;
  notStarted: number;
  completionPercent: number;
  moviesTotal: number;
  moviesCompleted: number;
  seriesTotal: number;
  seriesCompleted: number;
  estimatedHoursRemaining: number;
}

export function calculateProgressStats(
  productions: Production[],
  watchProgress: Record<string, { status: WatchStatus }>
): ProgressStats {
  const nonUpcoming = productions.filter((p) => !p.isUpcoming);

  let completed = 0;
  let inProgress = 0;
  let skipped = 0;
  let moviesCompleted = 0;
  let seriesCompleted = 0;
  let minutesRemaining = 0;

  for (const p of nonUpcoming) {
    const status = watchProgress[p.id]?.status ?? 'not_started';
    if (status === 'completed') {
      completed++;
      if (p.contentType === 'movie') moviesCompleted++;
      if (p.contentType === 'series' || p.contentType === 'animated-series') seriesCompleted++;
    } else if (status === 'in_progress') {
      inProgress++;
    } else if (status === 'skipped') {
      skipped++;
    } else {
      // not started — add to estimated remaining
      if (p.runtimeMinutes) minutesRemaining += p.runtimeMinutes;
    }
  }

  const total = nonUpcoming.length;
  const notStarted = total - completed - inProgress - skipped;
  // Skipped titles excluded from completion percentage
  const countable = total - skipped;
  const completionPercent = countable > 0 ? Math.round((completed / countable) * 100) : 0;

  const moviesTotal = nonUpcoming.filter((p) => p.contentType === 'movie').length;
  const seriesTotal = nonUpcoming.filter(
    (p) => p.contentType === 'series' || p.contentType === 'animated-series'
  ).length;

  return {
    total,
    completed,
    inProgress,
    skipped,
    notStarted,
    completionPercent,
    moviesTotal,
    moviesCompleted,
    seriesTotal,
    seriesCompleted,
    estimatedHoursRemaining: Math.round(minutesRemaining / 60),
  };
}
