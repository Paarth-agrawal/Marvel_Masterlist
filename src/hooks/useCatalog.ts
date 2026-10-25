import { useState, useEffect, useMemo } from 'react';
import type { Production, EnrichedProduction, StreamingRecord } from '../types';
import catalogData from '../../data/catalog.json';
import streamingData from '../../data/streaming.json';
import { getCachedPosters, startBackgroundPosterFetch } from '../utils/omdb';
import { getCachedStreaming, isStreamingCacheValid, startBackgroundStreamingFetch } from '../utils/streamingApi';

// Initial maps loaded synchronously from cache / static JSON
const initialPosters = getCachedPosters();
const initialStreamingCache = getCachedStreaming();

function buildInitialStreamingMap(): Map<string, StreamingRecord | null> {
  const map = new Map<string, StreamingRecord | null>();
  // 1. Static fallback from data/streaming.json
  for (const record of streamingData as StreamingRecord[]) {
    map.set(record.productionId, record);
  }
  // 2. Override with valid cached RapidAPI data if available
  for (const [prodId, entry] of Object.entries(initialStreamingCache)) {
    if (isStreamingCacheValid(entry) && entry.record) {
      map.set(prodId, entry.record);
    }
  }
  return map;
}

let currentPosters: Record<string, string> = { ...initialPosters };
let currentStreamingMap: Map<string, StreamingRecord | null> = buildInitialStreamingMap();
const listeners = new Set<() => void>();
let backgroundTasksStarted = false;

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

function initBackgroundWorkers() {
  if (backgroundTasksStarted) return;
  backgroundTasksStarted = true;

  const catalog = catalogData as Production[];

  // 1. Start Multi-API poster background fetch (OMDB -> TVmaze -> Fanart.tv)
  startBackgroundPosterFetch(
    catalog.map((p) => ({
      id: p.id,
      title: p.title,
      imdbId: p.imdbId,
      tmdbId: p.tmdbId,
      contentType: p.contentType,
      parentSeriesId: p.parentSeriesId,
    })),
    (id, url) => {
      currentPosters = { ...currentPosters, [id]: url };
      notifyListeners();
    }
  );

  // 2. Start RapidAPI streaming availability fetch (200ms delay, cached 7 days in streaming-cache-v1)
  startBackgroundStreamingFetch(
    catalog.map((p) => ({ id: p.id, tmdbId: p.tmdbId, contentType: p.contentType })),
    (id, record) => {
      const nextMap = new Map(currentStreamingMap);
      nextMap.set(id, record);
      currentStreamingMap = nextMap;
      notifyListeners();
    }
  );
}

export function useCatalog() {
  const [version, setVersion] = useState(0);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    initBackgroundWorkers();
    const listener = () => setVersion((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const enrichedCatalog = useMemo(() => {
    return (catalogData as Production[]).map((p) => {
      const poster = currentPosters[p.id] || p.posterUrl;
      const streaming = currentStreamingMap.get(p.id) ?? null;
      return {
        ...p,
        posterUrl: poster,
        computedStreamingAvailability: streaming,
      } as EnrichedProduction;
    });
  }, [version]);

  const catalogById = useMemo(() => {
    const map = new Map<string, Production>();
    for (const p of enrichedCatalog) map.set(p.id, p);
    return map;
  }, [enrichedCatalog]);

  const knownIds = useMemo(() => new Set((catalogData as Production[]).map((p) => p.id)), []);

  return { catalog: enrichedCatalog, loading, error, catalogById, knownIds };
}
