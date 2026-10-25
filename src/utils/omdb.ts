/**
 * Multi-API Poster Waterfall System
 * Stage 1: OMDB API (IMDb ID)
 * Stage 2: TVmaze API (Free, TV series / animated shows)
 * Stage 3: Fanart.tv API (Movies: TMDB/IMDb, TV: TVDB/IMDb)
 */

export interface PosterCacheEntry {
  url: string;
  source: 'omdb' | 'tvmaze' | 'fanart' | 'none';
}

export interface PosterWaterfallItem {
  id: string;
  title: string;
  imdbId: string | null;
  tmdbId?: number | null;
  tvdbId?: string | number | null;
  contentType?: string;
  parentSeriesId?: string | null;
}

const POSTER_CACHE_KEY = 'poster-cache-v1';
const WATERFALL_PURGE_FLAG = 'poster-cache-v1-waterfall-purged-2026-v2';

// Clear old cache once on startup so all posters are re-fetched with new multi-API waterfall
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(WATERFALL_PURGE_FLAG)) {
      localStorage.removeItem(POSTER_CACHE_KEY);
      localStorage.setItem(WATERFALL_PURGE_FLAG, 'true');
    }
  } catch {
    // ignore
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

export function getFanartApiKey(): string {
  const raw = import.meta.env.VITE_FANART_API_KEY || '';
  return raw.trim();
}

export function clearPosterCache(): void {
  try {
    localStorage.removeItem(POSTER_CACHE_KEY);
  } catch (e) {
    console.warn('Failed to clear poster cache from localStorage', e);
  }
}

export function getCachedPosterEntries(): Record<string, PosterCacheEntry> {
  try {
    const raw = localStorage.getItem(POSTER_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const result: Record<string, PosterCacheEntry> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (typeof val === 'string') {
        if (val) {
          result[key] = { url: val, source: 'omdb' };
        } else {
          result[key] = { url: '', source: 'none' };
        }
      } else if (val && typeof val === 'object' && 'url' in val) {
        result[key] = val as PosterCacheEntry;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function getCachedPosters(): Record<string, string> {
  const entries = getCachedPosterEntries();
  const posters: Record<string, string> = {};
  for (const [key, entry] of Object.entries(entries)) {
    if (entry.url) {
      posters[key] = entry.url;
    }
  }
  return posters;
}

export function saveCachedPosterEntry(id: string, entry: PosterCacheEntry): void {
  try {
    const raw = localStorage.getItem(POSTER_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[id] = entry;
    localStorage.setItem(POSTER_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save poster cache entry to localStorage', e);
  }
}

export function saveCachedPosters(cache: Record<string, string>): void {
  try {
    const currentEntries = getCachedPosterEntries();
    for (const [id, url] of Object.entries(cache)) {
      currentEntries[id] = { url, source: currentEntries[id]?.source || 'omdb' };
    }
    localStorage.setItem(POSTER_CACHE_KEY, JSON.stringify(currentEntries));
  } catch (e) {
    console.warn('Failed to save poster cache to localStorage', e);
  }
}

/**
 * Clean series title to maximize TVmaze and search hits
 */
export function cleanShowTitle(title: string): string {
  return title
    .replace(/\s+S\d+(\s*-\s*S\d+)?$/i, '')
    .replace(/\s+Season\s+\d+$/i, '')
    .replace(/\s*\(Netflix\)$/i, '')
    .replace(/\s*\(1992 series\)$/i, '')
    .replace(/\s*\(animated\)$/i, '')
    .replace(/\s*\(2017 animated\)$/i, '')
    .replace(/\s*\(Raimi\)$/i, '')
    .replace(/\s*\(Ang Lee\)$/i, '')
    .replace(/\s*\(One-Shot\)$/i, '')
    .trim();
}

/**
 * Validate that OMDB title corresponds to expected catalog title.
 * Case-insensitive, partial match or significant token overlap is fine.
 */
export function isTitleMatching(expectedTitle: string, omdbTitle: string): boolean {
  if (!expectedTitle || !omdbTitle) return false;

  const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const expClean = clean(cleanShowTitle(expectedTitle));
  const omdbClean = clean(cleanShowTitle(omdbTitle));

  if (expClean.includes(omdbClean) || omdbClean.includes(expClean)) {
    return true;
  }

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

  return expTokens.some((tok) => omdbTokens.includes(tok));
}

let isOmdbQuotaBlocked = false;

export function isOmdbBlocked(): boolean {
  return isOmdbQuotaBlocked;
}

// ── STAGE 1: OMDB ─────────────────────────────────────────────
export async function fetchStage1Omdb(
  imdbId: string,
  apiKey: string,
  expectedTitle?: string
): Promise<string | null> {
  if (isOmdbQuotaBlocked || !imdbId || !apiKey) return null;

  const url = `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url);
    if (res.status === 401 || res.status === 429) {
      isOmdbQuotaBlocked = true;
      console.warn(`[OMDB] API key limit or authorization error (${res.status}). Skipping OMDB stage.`);
      return null;
    }

    if (!res.ok) return null;

    const data = await res.json();
    if (data && data.Response === 'False' && (data.Error?.includes('limit') || data.Error?.includes('Key'))) {
      isOmdbQuotaBlocked = true;
      console.warn(`[OMDB] API limit notice: ${data.Error}`);
      return null;
    }

    if (data && data.Response !== 'False' && data.Poster && data.Poster !== 'N/A') {
      const omdbTitle = data.Title || '';
      if (expectedTitle && !isTitleMatching(expectedTitle, omdbTitle)) {
        console.warn(`[OMDB] Poster mismatch for ${expectedTitle}: got ${omdbTitle}`);
        return null;
      }
      return data.Poster;
    }
    return null;
  } catch (e) {
    console.warn(`[OMDB] Failed request for ${imdbId}`, e);
    return null;
  }
}

// ── STAGE 2: TVmaze (Free, No Key, Series only) ───────────────
export async function fetchStage2Tvmaze(title: string): Promise<string | null> {
  if (!title) return null;

  const clean = cleanShowTitle(title);
  const searchQueries = [clean];

  // Specific aliases for tricky titles
  if (clean.toLowerCase().includes('freshman year')) {
    searchQueries.unshift('Your Friendly Neighborhood Spider-Man');
  } else if (clean.toLowerCase() === 'agents of shield') {
    searchQueries.unshift('Agents of S.H.I.E.L.D.');
  }

  // Fallback prefix for Marvel productions
  if (!clean.toLowerCase().includes('marvel')) {
    searchQueries.push(`Marvel's ${clean}`);
  }

  for (const q of searchQueries) {
    try {
      const endpoint = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`;
      const res = await fetch(endpoint);
      if (!res.ok) continue;

      const results = await res.json();
      if (!Array.isArray(results) || results.length === 0) continue;

      // Check results for image
      for (const item of results) {
        const img = item?.show?.image?.original || item?.show?.image?.medium;
        if (img) return img;
      }
    } catch (e) {
      console.warn(`[TVmaze] Failed search for "${q}"`, e);
    }
  }

  return null;
}

// ── STAGE 3: Fanart.tv ─────────────────────────────────────────
export async function fetchStage3Fanart(
  item: PosterWaterfallItem,
  apiKey: string
): Promise<string | null> {
  if (!apiKey) return null;

  const isSeries = item.contentType === 'series' || item.contentType === 'animated-series';

  try {
    if (isSeries) {
      const targetId = item.tvdbId || item.imdbId;
      if (!targetId) return null;
      const url = `https://webservice.fanart.tv/v3/tv/${encodeURIComponent(String(targetId))}?api_key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data.tvposter?.[0]?.url || data.seasonposter?.[0]?.url || null;
    } else {
      const targetId = item.tmdbId || item.imdbId;
      if (!targetId) return null;
      const url = `https://webservice.fanart.tv/v3/movies/${encodeURIComponent(String(targetId))}?api_key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data.movieposter?.[0]?.url || null;
    }
  } catch (e) {
    console.warn(`[Fanart.tv] Failed request for ${item.id}`, e);
    return null;
  }
}

/**
 * Executes the 3-stage waterfall:
 * 1. OMDB
 * 2. TVmaze (if series and OMDB had no poster)
 * 3. Fanart.tv
 */
export async function fetchPosterWaterfall(
  item: PosterWaterfallItem,
  omdbApiKey: string,
  fanartApiKey: string
): Promise<PosterCacheEntry | null> {
  // STAGE 1 — OMDB
  if (item.imdbId && omdbApiKey) {
    const omdbUrl = await fetchStage1Omdb(item.imdbId, omdbApiKey, item.title);
    if (omdbUrl) {
      return { url: omdbUrl, source: 'omdb' };
    }
  }

  // STAGE 2 — TVmaze (series / animated-series)
  const isSeries = item.contentType === 'series' || item.contentType === 'animated-series';
  if (isSeries) {
    const tvmazeUrl = await fetchStage2Tvmaze(item.title);
    if (tvmazeUrl) {
      return { url: tvmazeUrl, source: 'tvmaze' };
    }
  }

  // STAGE 3 — Fanart.tv
  if (fanartApiKey) {
    const fanartUrl = await fetchStage3Fanart(item, fanartApiKey);
    if (fanartUrl) {
      return { url: fanartUrl, source: 'fanart' };
    }
  }

  return null;
}

// Backward compatibility alias for single-item OMDB call
export async function fetchPosterByImdbId(
  imdbId: string,
  apiKey: string,
  expectedTitle?: string
): Promise<string | null> {
  return fetchStage1Omdb(imdbId, apiKey, expectedTitle);
}

let isFetchingPosters = false;

const PRIORITY_SERIES_KEYWORDS = [
  'daredevil',
  'jessica jones',
  'luke cage',
  'iron fist',
  'defenders',
  'punisher',
  'shield',
  'agent carter',
  'runaways',
  'cloak',
  'wandavision',
  'loki',
  'hawkeye',
  'moon knight',
  'she-hulk',
  'secret invasion',
  'echo',
  'agatha',
  'x-men',
  'avengers: earth'
];

/**
 * Background worker executing the 3-stage waterfall for all missing posters.
 * Uses 300ms delay between requests to avoid rate limits.
 */
export async function startBackgroundPosterFetch(
  titles: PosterWaterfallItem[],
  onPosterLoaded: (id: string, url: string) => void
): Promise<void> {
  if (isFetchingPosters) return;
  isFetchingPosters = true;

  const omdbApiKey = getOmdbApiKey();
  const fanartApiKey = getFanartApiKey();
  const cacheEntries = getCachedPosterEntries();

  // Find titles not yet cached with a valid url
  const missing = titles.filter((t) => {
    const entry = cacheEntries[t.id];
    return !entry || (!entry.url && entry.source !== 'none');
  });

  if (missing.length === 0) {
    isFetchingPosters = false;
    return;
  }

  // Sort priority series first as requested
  const sortedMissing = [...missing].sort((a, b) => {
    const aIsPriority = PRIORITY_SERIES_KEYWORDS.some((kw) =>
      a.title.toLowerCase().includes(kw)
    );
    const bIsPriority = PRIORITY_SERIES_KEYWORDS.some((kw) =>
      b.title.toLowerCase().includes(kw)
    );
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    return 0;
  });

  for (const item of sortedMissing) {
    // Re-check cache before calling
    const latestCache = getCachedPosterEntries();
    if (latestCache[item.id]?.url) {
      continue;
    }

    try {
      const result = await fetchPosterWaterfall(item, omdbApiKey, fanartApiKey);
      if (result && result.url) {
        saveCachedPosterEntry(item.id, result);
        onPosterLoaded(item.id, result.url);
      } else {
        // Cache none so we avoid spamming on reload
        saveCachedPosterEntry(item.id, { url: '', source: 'none' });
      }
    } catch (e) {
      console.warn(`[Waterfall] Error fetching poster for ${item.title}:`, e);
    }

    // 300ms delay between requests to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  isFetchingPosters = false;
}
