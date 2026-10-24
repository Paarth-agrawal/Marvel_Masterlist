import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { Production, ActiveFilters, Tier, ContentType, WatchStatus } from '../types';
import { useProgressStore } from '../store/progressStore';
import { getPreset, filterByPreset } from '../utils/presets';
import { sortByReleaseOrder, sortProductionsByMode } from '../utils/releaseOrder';

const DEFAULT_FILTERS: ActiveFilters = {
  tiers: [],
  contentTypes: [],
  statuses: [],
  franchises: [],
  decades: null,
  streamingPlatforms: [],
  doomsdayOnly: false,
  upcomingOnly: false,
  searchQuery: '',
};

export function useFilters(
  catalog: Production[],
  initialFilters?: Partial<ActiveFilters>
) {
  const { progress } = useProgressStore();
  const [filters, setFilters] = useState<ActiveFilters>(() => ({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  }));

  const preset = getPreset(progress.preferences.activePreset);

  const presetFiltered = useMemo(
    () => filterByPreset(catalog, preset) as Production[],
    [catalog, preset]
  );

  // Apply show/hide upcoming
  const upcomingFiltered = useMemo(() => {
    if (!progress.preferences.showUpcoming) {
      return presetFiltered.filter((p) => !p.isUpcoming);
    }
    return presetFiltered;
  }, [presetFiltered, progress.preferences.showUpcoming]);

  // Apply show/hide skipped
  const skippedFiltered = useMemo(() => {
    if (!progress.preferences.showSkipped) {
      return upcomingFiltered.filter((p) => {
        const status = progress.watchProgress[p.id]?.status;
        return status !== 'skipped';
      });
    }
    return upcomingFiltered;
  }, [upcomingFiltered, progress.preferences.showSkipped, progress.watchProgress]);

  // Apply active filters
  const filtered = useMemo(() => {
    let result = skippedFiltered;

    if (filters.tiers.length > 0) {
      result = result.filter((p) => filters.tiers.includes(p.tier as Tier));
    }

    if (filters.contentTypes.length > 0) {
      result = result.filter((p) =>
        filters.contentTypes.includes(p.contentType as ContentType)
      );
    }

    if (filters.statuses.length > 0) {
      result = result.filter((p) => {
        const status = (progress.watchProgress[p.id]?.status ?? 'not_started') as WatchStatus;
        return filters.statuses.includes(status);
      });
    }

    if (filters.franchises.length > 0) {
      result = result.filter((p) => filters.franchises.includes(p.franchise));
    }

    if (filters.decades) {
      const [startDecade, endDecade] = filters.decades;
      result = result.filter((p) => {
        if (!p.releaseDate) return false;
        const year = parseInt(p.releaseDate.substring(0, 4));
        const decade = Math.floor(year / 10) * 10;
        return decade >= startDecade && decade <= endDecade;
      });
    }

    if (filters.streamingPlatforms.length > 0) {
      result = result.filter((p) => {
        const availability = (p as any).computedStreamingAvailability;
        if (!availability || !availability.providers) return false;
        return availability.providers.some((pr: any) =>
          filters.streamingPlatforms.includes(pr.name)
        );
      });
    }

    if (filters.doomsdayOnly) {
      result = result.filter((p) => p.doomsdayCategory !== null);
    }

    if (filters.upcomingOnly) {
      result = result.filter((p) => p.isUpcoming);
    }

    return result;
  }, [skippedFiltered, filters, progress.watchProgress]);

  // Apply search
  const fuse = useMemo(
    () =>
      new Fuse(filtered, {
        keys: [
          { name: 'title', weight: 1.0 },
          { name: 'alternativeTitles', weight: 0.8 },
          { name: 'franchise', weight: 0.6 },
          { name: 'synopsis', weight: 0.3 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [filtered]
  );

  const searched = useMemo(() => {
    if (!filters.searchQuery.trim()) {
      return sortProductionsByMode(filtered, progress.preferences.orderMode);
    }
    const results = fuse.search(filters.searchQuery);
    return results.map((r) => r.item);
  }, [filtered, fuse, filters.searchQuery, progress.preferences.orderMode]);

  const updateFilter = useCallback(
    <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      filters.tiers.length > 0 ||
      filters.contentTypes.length > 0 ||
      filters.statuses.length > 0 ||
      filters.franchises.length > 0 ||
      filters.decades !== null ||
      filters.streamingPlatforms.length > 0 ||
      filters.doomsdayOnly ||
      filters.upcomingOnly ||
      filters.searchQuery.trim() !== '',
    [filters]
  );

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filtered: searched,
    presetFiltered: sortProductionsByMode(skippedFiltered, progress.preferences.orderMode),
  };
}
