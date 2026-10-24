import type { Preset, PresetId, Tier } from '../types';

export const PRESETS: Preset[] = [
  {
    id: 'complete-mcu',
    label: 'Complete MCU',
    description: 'All MCU Tier 1 content',
    includes: ['mcu'],
  },
  {
    id: 'mcu-movies-only',
    label: 'MCU Movies Only',
    description: 'MCU theatrical films only',
    includes: ['mcu'],
    contentTypeFilter: ['movie'],
  },
  {
    id: 'mcu-phase-1-3',
    label: 'MCU Infinity Saga',
    description: 'MCU movies and series through Endgame (pre-2020)',
    includes: ['mcu'],
  },
  {
    id: 'marvel-multiverse',
    label: 'Marvel Multiverse',
    description: 'MCU + X-Men + Spider-Man franchises',
    includes: ['mcu', 'x-men', 'spider-man'],
  },
  {
    id: 'all-major',
    label: 'All Major Marvel',
    description: 'All tiers, excluding obscure legacy titles',
    includes: ['mcu', 'x-men', 'spider-man', 'tv'],
  },
  {
    id: 'complete-catalog',
    label: 'Complete Marvel Screen',
    description: 'All six tiers, including legacy and animation',
    includes: ['mcu', 'x-men', 'spider-man', 'legacy', 'tv', 'animation'],
  },
  {
    id: 'doomsday-prep',
    label: 'Doomsday Preparation',
    description: 'Titles recommended for Avengers: Doomsday',
    includes: ['mcu', 'x-men', 'spider-man', 'legacy', 'tv', 'animation'],
    doomsdayOnly: true,
  },
];

export function getPreset(id: PresetId): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

export function filterByPreset(
  productions: { tier: Tier; contentType: string; releaseDate: string | null; doomsdayCategory: string | null }[],
  preset: Preset
): typeof productions {
  let filtered = productions.filter((p) => preset.includes.includes(p.tier));

  if (preset.contentTypeFilter) {
    filtered = filtered.filter((p) =>
      preset.contentTypeFilter!.includes(p.contentType as never)
    );
  }

  if (preset.id === 'mcu-phase-1-3') {
    // Infinity Saga = released on or before Endgame (2019-04-26)
    filtered = filtered.filter((p) => {
      if (!p.releaseDate) return false;
      return p.releaseDate <= '2019-04-26';
    });
  }

  if (preset.doomsdayOnly) {
    filtered = filtered.filter((p) => p.doomsdayCategory !== null);
  }

  return filtered;
}
