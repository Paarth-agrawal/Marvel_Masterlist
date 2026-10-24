/**
 * OMDB API client and poster caching utilities
 */

const POSTER_CACHE_KEY = 'poster-cache-v1';
const PURGE_FLAG_KEY = 'poster-cache-v1-purged-fix-2026';

// One-time auto-purge of old wrong title-queried cache so fresh IMDb-queried posters are fetched
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(PURGE_FLAG_KEY)) {
      localStorage.removeItem(POSTER_CACHE_KEY);
      localStorage.setItem(PURGE_FLAG_KEY, 'true');
      console.log('[OMDB] Cleared old poster-cache-v1 for fresh IMDb-ID based fetching.');
    }
  } catch (e) {
    console.warn('Failed to clear poster-cache-v1', e);
  }
}

export function getOmdbApiKey(): string {
  const raw = import.meta.env.VITE_OMDB_API_KEY || '';
  if (!raw) return '';
  if (raw.includes('apikey=')) {
    const match = raw.match(/apikey=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : raw.trim();
  }
  return raw.trim();
}

export function clearPosterCache(): void {
  try {
    localStorage.removeItem(POSTER_CACHE_KEY);
  } catch (e) {
    console.warn('Failed to clear poster cache from localStorage', e);
  }
}

export function getCachedPosters(): Record<string, string> {
  try {
    const raw = localStorage.getItem(POSTER_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCachedPosters(cache: Record<string, string>): void {
  try {
    localStorage.setItem(POSTER_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save poster cache to localStorage', e);
  }
}

/**
 * Validate that OMDB title corresponds to expected catalog title.
 * Case-insensitive, partial match or significant token overlap is fine.
 */
export function isTitleMatching(expectedTitle: string, omdbTitle: string): boolean {
  if (!expectedTitle || !omdbTitle) return false;

  const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const expClean = clean(expectedTitle);
  const omdbClean = clean(omdbTitle);

  // Exact or substring match
  if (expClean.includes(omdbClean) || omdbClean.includes(expClean)) {
    return true;
  }

  // Token / keyword overlap
  const stopWords = new Set([
    'the', 'and', 'for', 'part', 'season', 'series', 'movie', 'marvel',
    'marvels', 'of', 'in', 'an', 'to', 'all', 'a', 'or', 'by', 'vol', 'on'
  ]);

  const getKeywords = (str: string) =>
    str
      .toLowerCase()
      .split(/[\s:,\-–—()/*]+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ''))
      .filter((w) => w.length >= 3 && !stopWords.has(w));

  const expTokens = getKeywords(expectedTitle);
  const omdbTokens = getKeywords(omdbTitle);

  // If at least one significant keyword matches
  return expTokens.some((tok) => omdbTokens.includes(tok));
}

export async function fetchPosterByImdbId(
  imdbId: string,
  apiKey: string,
  expectedTitle?: string
): Promise<string | null> {
  try {
    const url = `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (data && data.Response !== 'False' && data.Poster && data.Poster !== 'N/A') {
      const omdbTitle = data.Title || '';
      if (expectedTitle && !isTitleMatching(expectedTitle, omdbTitle)) {
        console.warn(`Poster mismatch for ${expectedTitle}: got ${omdbTitle}`);
        return null; // Reject poster
      }
      return data.Poster;
    }
    return null;
  } catch {
    return null;
  }
}

let isFetchingPosters = false;

/**
 * Fetch poster URLs in the background for titles missing from cache.
 * Check cache first, batch requests smoothly, validate titles, update as they arrive.
 */
export async function startBackgroundPosterFetch(
  titles: { id: string; title: string; imdbId: string | null }[],
  onPosterLoaded: (id: string, url: string) => void
): Promise<void> {
  const apiKey = getOmdbApiKey();
  if (!apiKey || isFetchingPosters) return;

  isFetchingPosters = true;
  const cache = getCachedPosters();

  // Find titles with imdbId not yet in cache
  const missing = titles.filter(
    (t) => t.imdbId && typeof cache[t.id] === 'undefined'
  );

  if (missing.length === 0) {
    isFetchingPosters = false;
    return;
  }

  // Process in small batches with slight spacing to respect rate limits
  const BATCH_SIZE = 4;
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (t) => {
        if (!t.imdbId) return;
        const posterUrl = await fetchPosterByImdbId(t.imdbId, apiKey, t.title);
        if (posterUrl) {
          cache[t.id] = posterUrl;
          saveCachedPosters(cache);
          onPosterLoaded(t.id, posterUrl);
        } else {
          // Cache empty string so we don't re-query missing/rejected posters
          cache[t.id] = '';
          saveCachedPosters(cache);
        }
      })
    );
    // 50ms pause between batches
    await new Promise((r) => setTimeout(r, 50));
  }

  isFetchingPosters = false;
}
