import { create } from 'zustand';
import type { UserProgress, WatchStatus, PresetId, OrderMode, UserPreferences } from '../types';
import { loadProgress, saveProgress, isLocalStorageAvailable } from '../utils/storage';

interface ProgressStore {
  progress: UserProgress;
  storageAvailable: boolean;

  // Actions
  setWatchStatus: (id: string, status: WatchStatus) => void;
  setPreset: (preset: PresetId) => void;
  setOrderMode: (mode: OrderMode) => void;
  setShowSkipped: (show: boolean) => void;
  setShowUpcoming: (show: boolean) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  replaceProgress: (progress: UserProgress) => void;
  clearProgress: () => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: loadProgress(),
  storageAvailable: isLocalStorageAvailable(),

  setWatchStatus: (id: string, status: WatchStatus) => {
    const current = get().progress;
    const updated: UserProgress = {
      ...current,
      watchProgress: {
        ...current.watchProgress,
        [id]: {
          status,
          updatedAt: new Date().toISOString(),
          notes: current.watchProgress[id]?.notes ?? '',
        },
      },
    };
    set({ progress: updated });
    saveProgress(updated);
  },

  setPreset: (preset: PresetId) => {
    const current = get().progress;
    const updated: UserProgress = {
      ...current,
      preferences: { ...current.preferences, activePreset: preset },
    };
    set({ progress: updated });
    saveProgress(updated);
  },

  setOrderMode: (mode: OrderMode) => {
    const current = get().progress;
    const updated: UserProgress = {
      ...current,
      preferences: { ...current.preferences, orderMode: mode },
    };
    set({ progress: updated });
    saveProgress(updated);
  },

  setShowSkipped: (show: boolean) => {
    const current = get().progress;
    const updated: UserProgress = {
      ...current,
      preferences: { ...current.preferences, showSkipped: show },
    };
    set({ progress: updated });
    saveProgress(updated);
  },

  setShowUpcoming: (show: boolean) => {
    const current = get().progress;
    const updated: UserProgress = {
      ...current,
      preferences: { ...current.preferences, showUpcoming: show },
    };
    set({ progress: updated });
    saveProgress(updated);
  },

  setPreferences: (prefs: Partial<UserPreferences>) => {
    const current = get().progress;
    const updated: UserProgress = {
      ...current,
      preferences: { ...current.preferences, ...prefs },
    };
    set({ progress: updated });
    saveProgress(updated);
  },

  replaceProgress: (progress: UserProgress) => {
    set({ progress });
    saveProgress(progress);
  },

  clearProgress: () => {
    const current = get().progress;
    const cleared: UserProgress = {
      ...current,
      watchProgress: {},
      lastUpdated: new Date().toISOString(),
    };
    set({ progress: cleared });
    saveProgress(cleared);
  },
}));
