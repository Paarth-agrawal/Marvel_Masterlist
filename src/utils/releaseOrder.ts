import type { Production } from '../types';

/**
 * Tiebreaker priority order for same-date releases (Section 3.2)
 * Returns a numeric sort key (lower = earlier in list)
 */
function getContentTypePriority(p: Production): number {
  // 1. Theatrical movie before streaming release
  if (p.contentType === 'movie' && p.releaseStatus === 'released') return 0;
  // 2. Live action before animated
  if (p.contentType === 'series') return 1;
  if (p.contentType === 'special') return 2;
  if (p.contentType === 'animated-series') return 3;
  if (p.contentType === 'short') return 4;
  return 5;
}

/**
 * Sort productions by release date (ascending), applying tiebreaker rules.
 * Upcoming titles with no date go to the end.
 */
export function sortByReleaseOrder(productions: Production[]): Production[] {
  return [...productions].sort((a, b) => {
    const dateA = a.releaseDate;
    const dateB = b.releaseDate;

    // Titles without dates go to end
    if (!dateA && !dateB) return a.title.localeCompare(b.title);
    if (!dateA) return 1;
    if (!dateB) return -1;

    // Primary: release date comparison
    const cmp = dateA.localeCompare(dateB);
    if (cmp !== 0) return cmp;

    // Tiebreaker 1: content type priority
    const prioA = getContentTypePriority(a);
    const prioB = getContentTypePriority(b);
    if (prioA !== prioB) return prioA - prioB;

    // Tiebreaker 2: alphabetical by title (final fallback)
    return a.title.localeCompare(b.title);
  });
}

/**
 * Canonical MCU in-universe chronological story order mapping.
 */
export const MCU_CHRONOLOGICAL_ORDER: string[] = [
  'mcu-captain-america-first-avenger-2011', // 1942-1945
  'mcu-captain-marvel-2019',                // 1995
  'mcu-iron-man-2008',                      // 2008
  'mcu-iron-man-2-2010',                    // 2010
  'mcu-incredible-hulk-2008',               // 2010
  'mcu-thor-2011',                          // 2011
  'mcu-avengers-2012',                      // 2012
  'mcu-thor-dark-world-2013',               // 2013
  'mcu-iron-man-3-2013',                    // 2012/2013
  'mcu-captain-america-winter-soldier-2014',// 2014
  'mcu-guardians-galaxy-2014',              // 2014
  'mcu-guardians-galaxy-vol-2-2017',        // 2014
  'mcu-i-am-groot-s1-2022',                 // 2014
  'mcu-avengers-age-of-ultron-2015',        // 2015
  'mcu-ant-man-2015',                       // 2015
  'mcu-captain-america-civil-war-2016',     // 2016
  'mcu-black-widow-2021',                   // 2016
  'mcu-black-panther-2018',                 // 2016
  'mcu-spider-man-homecoming-2017',         // 2016
  'mcu-doctor-strange-2016',                // 2016-2017
  'mcu-thor-ragnarok-2017',                 // 2017
  'mcu-ant-man-wasp-2018',                  // 2018
  'mcu-avengers-infinity-war-2018',         // 2018
  'mcu-avengers-endgame-2019',              // 2018-2023
  'mcu-loki-s1-2021',                       // Time Variance Authority
  'mcu-what-if-s1-2021',                    // Multiverse
  'mcu-wandavision-2021',                   // 2023
  'mcu-falcon-winter-soldier-2021',         // 2024
  'mcu-spider-man-far-from-home-2019',      // 2024
  'mcu-shang-chi-2021',                     // 2024
  'mcu-eternals-2021',                      // 2024
  'mcu-spider-man-no-way-home-2021',        // 2024
  'mcu-doctor-strange-m\u043em-2022',       // 2024
  'mcu-hawkeye-2021',                       // December 2024
  'mcu-moon-knight-2022',                   // 2025
  'mcu-black-panther-wakanda-forever-2022', // 2025
  'mcu-echo-2024',                          // 2025
  'mcu-she-hulk-2022',                      // 2025
  'mcu-ms-marvel-2022',                     // 2025
  'mcu-thor-love-thunder-2022',             // 2025
  'mcu-werewolf-by-night-2022',             // 2025
  'mcu-guardians-holiday-special-2022',     // December 2025
  'mcu-ant-man-quantumania-2023',           // 2026
  'mcu-guardians-galaxy-vol-3-2023',        // 2026
  'mcu-secret-invasion-2023',               // 2026
  'mcu-the-marvels-2023',                   // 2026
  'mcu-loki-s2-2023',                       // Outside time
  'mcu-deadpool-wolverine-2024',            // 2024/2026 / TVA
  'mcu-agatha-all-along-2024',              // 2026
  'mcu-captain-america-brave-new-world-2025',// 2026
  'mcu-daredevil-born-again-2025',          // 2026
  'mcu-thunderbolts-2025',                  // 2026
  'mcu-ironheart-2025',                     // 2026
  'mcu-fantastic-four-first-steps-2025',    // Alternate Earth-1960s
  'mcu-avengers-doomsday-2026',             // 2026
];

const CHRONO_MAP = new Map<string, number>(
  MCU_CHRONOLOGICAL_ORDER.map((id, index) => [id, index])
);

/**
 * Sort productions by chronological in-universe story order.
 * MCU titles with known story placement are sorted by story chronology.
 * Titles without story placement fallback to release order.
 */
export function sortByChronologicalOrder(productions: Production[]): Production[] {
  return [...productions].sort((a, b) => {
    const idxA = CHRONO_MAP.has(a.id) ? CHRONO_MAP.get(a.id)! : 9999;
    const idxB = CHRONO_MAP.has(b.id) ? CHRONO_MAP.get(b.id)! : 9999;

    if (idxA !== idxB) {
      return idxA - idxB;
    }

    // Tiebreaker for titles outside the explicit list: release order
    const dateA = a.releaseDate;
    const dateB = b.releaseDate;
    if (!dateA && !dateB) return a.title.localeCompare(b.title);
    if (!dateA) return 1;
    if (!dateB) return -1;
    const cmp = dateA.localeCompare(dateB);
    if (cmp !== 0) return cmp;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Sort productions according to the user's selected OrderMode ('release' | 'chronology')
 */
export function sortProductionsByMode(
  productions: Production[],
  orderMode: 'release' | 'chronology'
): Production[] {
  return orderMode === 'chronology'
    ? sortByChronologicalOrder(productions)
    : sortByReleaseOrder(productions);
}

/**
 * Format a release date string (YYYY-MM-DD) for display
 */
export function formatReleaseDate(date: string | null): string {
  if (!date) return 'TBA';
  try {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}

/**
 * Get the release year from a date string
 */
export function getReleaseYear(date: string | null): string {
  if (!date) return 'TBA';
  return date.substring(0, 4);
}
