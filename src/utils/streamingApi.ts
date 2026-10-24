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

const US_ONLY_PLATFORMS = [
  'hulu',
  'hbo',
  'hbo max',
  'max',
  'peacock',
  'paramount',
  'paramount+',
  'paramount plus',
  'vudu',
  'fubo',
  'fubotv',
  'sling',
  'showtime',
  'starz',
  'criterion',
  'the roku channel',
  'tubi',
  'pluto tv',
  'the cw',
];

export function isUsOnlyPlatform(rawName: string): boolean {
  const n = (rawName || '').toLowerCase().trim();
  return US_ONLY_PLATFORMS.some((us) => n === us || n.includes(us));
}

export function normalizeServiceName(rawName: string): string {
  const name = (rawName || '').trim();
  const n = name.toLowerCase();

  // Indian platform correct branding
  if (n.includes('hotstar') || n.includes('disney')) {
    return 'JioHotstar';
  }
  if (n.includes('prime') || n.includes('amazon')) {
    return 'Amazon Prime Video';
  }
  if (n.includes('netflix')) {
    return 'Netflix';
  }
  if (n.includes('apple')) {
    return 'Apple TV';
  }
  if (n.includes('youtube')) {
    return 'YouTube';
  }
  if (n.includes('google')) {
    return 'Google Play';
  }
  return name;
}

export function getProviderPriority(name: string): number {
  const n = name.toLowerCase();
  if (n.includes('jiohotstar') || n.includes('hotstar')) return 1;
  if (n.includes('netflix')) return 2;
  if (n.includes('prime') || n.includes('amazon')) return 3;
  return 4;
}

export function sortAndFilterProviders(providers: StreamingProvider[]): StreamingProvider[] {
  return providers
    .filter((p) => !isUsOnlyPlatform(p.name))
    .map((p) => ({
      ...p,
      name: normalizeServiceName(p.name),
    }))
    .sort((a, b) => {
      const prioA = getProviderPriority(a.name);
      const prioB = getProviderPriority(b.name);
      if (prioA !== prioB) return prioA - prioB;
      return a.name.localeCompare(b.name);
    });
}

function normalizeProviderType(rawType: string): StreamingProviderType {
  const t = (rawType || '').toLowerCase();
  if (t === 'subscription' || t === 'addon') return 'subscription';
  if (t === 'rent' || t === 'rental') return 'rental';
  if (t === 'buy' || t === 'purchase') return 'purchase';
  if (t === 'free') return 'free';
  return 'unknown';
}

// Track if RapidAPI quota limit is hit to stop retrying immediately
let isRapidApiQuotaBlocked = false;

export function isRapidApiBlocked(): boolean {
  return isRapidApiQuotaBlocked;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response | null> {
  const backoffDelays = [1000, 2000, 4000];

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (isRapidApiQuotaBlocked) return null;

    try {
      const res = await fetch(url, options);

      // Public-safe handling: stop immediately on 401 (unauthorized) or 429 (rate limited)
      if (res.status === 401 || res.status === 429) {
        isRapidApiQuotaBlocked = true;
        console.warn(`[RapidAPI] Quota or authorization limit reached (${res.status}). Stopping further streaming requests.`);
        return null;
      }

      // If successful or 404, return
      if (res.ok || res.status === 404) {
        return res;
      }

      // 5xx server error, retry with exponential backoff
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoffDelays[attempt] || 1000));
      }
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoffDelays[attempt] || 1000));
      } else {
        return null;
      }
    }
  }
  return null;
}

export async function fetchStreamingAvailability(
  tmdbId: number,
  productionId: string,
  contentType: string,
  host: string,
  key: string
): Promise<StreamingRecord | null> {
  if (isRapidApiQuotaBlocked) return null;

  try {
    const isSeries = contentType === 'series' || contentType === 'animated-series';
    const typePath = isSeries ? 'tv' : 'movie';
    const headers = {
      'x-rapidapi-host': host,
      'x-rapidapi-key': key,
    };

    // Try /shows/{typePath}/{tmdbId}?country=in first
    let res = await fetchWithRetry(`https://${host}/shows/${typePath}/${tmdbId}?country=in`, { headers });

    // If 404, fallback to /shows/{tmdbId}?country=in
    if (res && res.status === 404) {
      res = await fetchWithRetry(`https://${host}/shows/${tmdbId}?country=in`, { headers });
    }

    if (!res || !res.ok) return null;

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
    const rawProviders: StreamingProvider[] = [];

    for (const opt of inOptions) {
      const rawName = opt?.service?.name || opt?.service?.id || '';
      if (!rawName || isUsOnlyPlatform(rawName)) continue;

      const name = normalizeServiceName(rawName);
      const pType = normalizeProviderType(opt?.type || '');
      const dedupKey = `${name.toLowerCase()}::${pType}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      rawProviders.push({
        name,
        type: pType,
        url: opt?.link || opt?.videoLink || opt?.service?.homePage || '',
        verified: true,
        lastVerified: new Date().toISOString().split('T')[0],
      });
    }

    const providers = sortAndFilterProviders(rawProviders);

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

// Queue for on-demand viewport streaming fetching
type QueueItem = {
  id: string;
  tmdbId: number;
  contentType: string;
};

const streamingQueue: QueueItem[] = [];
const queuedIds = new Set<string>();
let isQueueProcessing = false;
let streamingCallback: ((id: string, record: StreamingRecord | null) => void) | null = null;

export function registerStreamingCallback(cb: (id: string, record: StreamingRecord | null) => void): void {
  streamingCallback = cb;
}

export function requestStreamingForViewport(
  production: { id: string; tmdbId: number | null; contentType: string }
): void {
  if (!production.tmdbId || isRapidApiQuotaBlocked) return;
  const cache = getCachedStreaming();
  if (isStreamingCacheValid(cache[production.id])) return;
  if (queuedIds.has(production.id)) return;

  queuedIds.add(production.id);
  streamingQueue.push({
    id: production.id,
    tmdbId: production.tmdbId,
    contentType: production.contentType,
  });

  processStreamingQueue();
}

async function processStreamingQueue(): Promise<void> {
  if (isQueueProcessing || streamingQueue.length === 0 || isRapidApiQuotaBlocked) return;
  const credentials = getRapidApiCredentials();
  if (!credentials) return;

  isQueueProcessing = true;
  const cache = getCachedStreaming();

  while (streamingQueue.length > 0 && !isRapidApiQuotaBlocked) {
    const item = streamingQueue.shift();
    if (!item) break;

    if (!isStreamingCacheValid(cache[item.id])) {
      const record = await fetchStreamingAvailability(
        item.tmdbId,
        item.id,
        item.contentType,
        credentials.host,
        credentials.key
      );

      cache[item.id] = {
        timestamp: Date.now(),
        record,
      };
      saveCachedStreaming(cache);

      if (streamingCallback) {
        streamingCallback(item.id, record);
      }

      // 200ms delay between calls to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  isQueueProcessing = false;
}

let isFetchingStreaming = false;

/**
 * Background worker to fetch streaming availability for titles with tmdbId
 * (now prioritized for viewport on-demand loading).
 */
export async function startBackgroundStreamingFetch(
  titles: { id: string; tmdbId: number | null; contentType: string }[],
  onStreamingLoaded: (id: string, record: StreamingRecord | null) => void
): Promise<void> {
  registerStreamingCallback(onStreamingLoaded);
  // Viewport observer now feeds the queue dynamically!
}
