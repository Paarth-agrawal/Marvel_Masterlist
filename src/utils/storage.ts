import type { UserProgress } from '../types';

const STORAGE_KEY = 'marvel-watchlist-v2';
const DEBOUNCE_MS = 300;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const DEFAULT_PROGRESS: UserProgress = {
  version: 2,
  lastUpdated: new Date().toISOString(),
  userId: 'local',
  watchProgress: {},
  preferences: {
    region: import.meta.env.VITE_APP_REGION || 'IN',
    activePreset: 'complete-mcu',
    orderMode: 'release',
    showSkipped: true,
    showUpcoming: true,
  },
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as UserProgress;
    // Merge with defaults to handle schema evolution; Release Order is ALWAYS default on first load
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      preferences: {
        ...DEFAULT_PROGRESS.preferences,
        ...(parsed.preferences ?? {}),
        orderMode: 'release',
      },
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: UserProgress): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      const updated = {
        ...progress,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage unavailable. Progress not saved.', e);
    }
  }, DEBOUNCE_MS);
}

export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__marvel_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
