/**
 * Streaming Availability API client (RapidAPI) and caching utilities
 */

import type { StreamingRecord, StreamingProvider, StreamingProviderType } from '../types';

const STREAMING_CACHE_KEY = 'streaming-cache-v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface CachedStreamingEntry {
  timestamp: number;
  record: StreamingRecord | null;
}

export type StreamingCache = Record<string, CachedStreamingEntry>;

export function getRapidApiCredentials(): { host: string; key: string } | null {
  const host = import.meta.env.VITE_RAPIDAPI_HOST || '';
  const key = import.meta.env.VITE_RAPIDAPI_KEY || '';
  if (!host || !key) return null;
  return { host: host.trim(), key: key.trim() };
}

export function getCachedStreaming(): StreamingCache {
  try {
    const raw = localStorage.getItem(STREAMING_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCachedStreaming(cache: StreamingCache): void {
  try {
    localStorage.setItem(STREAMING_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save streaming cache to localStorage', e);
  }
}

export function isStreamingCacheValid(entry: CachedStreamingEntry | undefined): boolean {
  if (!entry || typeof entry.timestamp !== 'number') return false;
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}

function normalizeProviderType(rawType: string): StreamingProviderType {
  const t = (rawType || '').toLowerCase();
  if (t === 'subscription' || t === 'addon') return 'subscription';
  if (t === 'rent' || t === 'rental') return 'rental';
  if (t === 'buy' || t === 'purchase') return 'purchase';
  if (t === 'free') return 'free';
  return 'unknown';
}

function normalizeServiceName(rawName: string): string {
  const name = rawName || '';
  if (name.toLowerCase() === 'prime video') return 'Prime Video';
  return name;
}

export async function fetchStreamingAvailability(
  tmdbId: number,
  productionId: string,
  contentType: string,
  host: string,
  key: string
): Promise<StreamingRecord | null> {
  try {
    const isSeries = contentType === 'series' || contentType === 'animated-series';
    const typePath = isSeries ? 'tv' : 'movie';

    // Try /shows/{typePath}/{tmdbId}?country=in first
    let res = await fetch(`https://${host}/shows/${typePath}/${tmdbId}?country=in`, {
      headers: {
        'x-rapidapi-host': host,
        'x-rapidapi-key': key,
      },
    });

    // If 404, fallback to /shows/{tmdbId}?country=in
    if (res.status === 404) {
      res = await fetch(`https://${host}/shows/${tmdbId}?country=in`, {
        headers: {
          'x-rapidapi-host': host,
          'x-rapidapi-key': key,
        },
      });
    }

    if (!res.ok) return null;

    const data = await res.json();
    const inOptions = data?.streamingOptions?.in;

    if (!Array.isArray(inOptions) || inOptions.length === 0) {
      return {
        productionId,
        region: 'IN',
        providers: [],
      };
    }

    const seen = new Set<string>();
    const providers: StreamingProvider[] = [];

    for (const opt of inOptions) {
      const name = normalizeServiceName(opt?.service?.name || opt?.service?.id || '');
      if (!name) continue;

      const pType = normalizeProviderType(opt?.type || '');
      const dedupKey = `${name.toLowerCase()}::${pType}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      providers.push({
        name,
        type: pType,
        url: opt?.link || opt?.videoLink || opt?.service?.homePage || '',
        verified: true,
        lastVerified: new Date().toISOString().split('T')[0],
      });
    }

    return {
      productionId,
      region: 'IN',
      providers,
    };
  } catch (err) {
    console.warn(`Failed to fetch streaming for tmdbId ${tmdbId}`, err);
    return null;
  }
}

let isFetchingStreaming = false;

/**
 * Background worker to fetch streaming availability for titles with tmdbId
 * that are missing or expired in the cache.
 * Adds a 200ms delay between requests to respect RapidAPI free tier rate limits.
 */
export async function startBackgroundStreamingFetch(
  titles: { id: string; tmdbId: number | null; contentType: string }[],
  onStreamingLoaded: (id: string, record: StreamingRecord | null) => void
): Promise<void> {
  const credentials = getRapidApiCredentials();
  if (!credentials || isFetchingStreaming) return;

  isFetchingStreaming = true;
  const cache = getCachedStreaming();

  // Find titles with tmdbId needing fetch (missing or expired)
  const needingFetch = titles.filter(
    (t) => t.tmdbId && !isStreamingCacheValid(cache[t.id])
  );

  for (const item of needingFetch) {
    if (!item.tmdbId) continue;

    const record = await fetchStreamingAvailability(
      item.tmdbId,
      item.id,
      item.contentType,
      credentials.host,
      credentials.key
    );

    // Save to cache with timestamp even if empty so we don't query repeatedly
    cache[item.id] = {
      timestamp: Date.now(),
      record,
    };
    saveCachedStreaming(cache);
    onStreamingLoaded(item.id, record);

    // 200ms delay between requests to respect RapidAPI rate limits
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  isFetchingStreaming = false;
}
