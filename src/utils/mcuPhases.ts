/**
 * MCU Phase definitions and progress calculation
 */

export interface PhaseInfo {
  phase: number;
  name: string;
  saga: string;
  years: string;
  titleIds: string[];
}

export const MCU_PHASES: PhaseInfo[] = [
  {
    phase: 1,
    name: 'Phase 1',
    saga: 'The Infinity Saga',
    years: '2008–2012',
    titleIds: [
      'mcu-iron-man-2008',
      'mcu-incredible-hulk-2008',
      'mcu-iron-man-2-2010',
      'mcu-thor-2011',
      'mcu-captain-america-first-avenger-2011',
      'mcu-avengers-2012',
    ],
  },
  {
    phase: 2,
    name: 'Phase 2',
    saga: 'The Infinity Saga',
    years: '2013–2015',
    titleIds: [
      'mcu-iron-man-3-2013',
      'mcu-thor-dark-world-2013',
      'mcu-captain-america-winter-soldier-2014',
      'mcu-guardians-galaxy-2014',
      'mcu-avengers-age-of-ultron-2015',
      'mcu-ant-man-2015',
    ],
  },
  {
    phase: 3,
    name: 'Phase 3',
    saga: 'The Infinity Saga',
    years: '2016–2019',
    titleIds: [
      'mcu-captain-america-civil-war-2016',
      'mcu-doctor-strange-2016',
      'mcu-guardians-galaxy-vol-2-2017',
      'mcu-spider-man-homecoming-2017',
      'mcu-thor-ragnarok-2017',
      'mcu-black-panther-2018',
      'mcu-avengers-infinity-war-2018',
      'mcu-ant-man-wasp-2018',
      'mcu-captain-marvel-2019',
      'mcu-avengers-endgame-2019',
      'mcu-spider-man-far-from-home-2019',
    ],
  },
  {
    phase: 4,
    name: 'Phase 4',
    saga: 'The Multiverse Saga',
    years: '2021–2022',
    titleIds: [
      'mcu-wandavision-2021',
      'mcu-falcon-winter-soldier-2021',
      'mcu-loki-s1-2021',
      'mcu-black-widow-2021',
      'mcu-what-if-s1-2021',
      'mcu-shang-chi-2021',
      'mcu-eternals-2021',
      'mcu-hawkeye-2021',
      'mcu-spider-man-no-way-home-2021',
      'mcu-moon-knight-2022',
      'mcu-doctor-strange-m\u043em-2022',
      'mcu-ms-marvel-2022',
      'mcu-thor-love-thunder-2022',
      'mcu-i-am-groot-s1-2022',
      'mcu-she-hulk-2022',
      'mcu-werewolf-by-night-2022',
      'mcu-black-panther-wakanda-forever-2022',
      'mcu-guardians-holiday-special-2022',
    ],
  },
  {
    phase: 5,
    name: 'Phase 5',
    saga: 'The Multiverse Saga',
    years: '2023–2025',
    titleIds: [
      'mcu-ant-man-quantumania-2023',
      'mcu-guardians-galaxy-vol-3-2023',
      'mcu-secret-invasion-2023',
      'mcu-loki-s2-2023',
      'mcu-the-marvels-2023',
      'mcu-what-if-s2-2023',
      'mcu-echo-2024',
      'mcu-deadpool-wolverine-2024',
      'mcu-agatha-all-along-2024',
      'mcu-what-if-s3-2024',
      'mcu-captain-america-brave-new-world-2025',
      'mcu-daredevil-born-again-2025',
      'mcu-thunderbolts-2025',
      'mcu-ironheart-2025',
    ],
  },
  {
    phase: 6,
    name: 'Phase 6',
    saga: 'The Multiverse Saga',
    years: '2025–2027',
    titleIds: [
      'mcu-fantastic-four-first-steps-2025',
      'mcu-avengers-doomsday-2026',
      'mcu-spider-man-4-2026',
      'mcu-avengers-secret-wars-2027',
    ],
  },
];

export interface PhaseProgress {
  phase: number;
  name: string;
  saga: string;
  years: string;
  total: number;
  completed: number;
  percent: number;
}

export function calculatePhaseProgress(
  watchProgress: Record<string, { status: string }>
): PhaseProgress[] {
  return MCU_PHASES.map((p) => {
    const total = p.titleIds.length;
    const completed = p.titleIds.filter(
      (id) => watchProgress[id]?.status === 'completed'
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      phase: p.phase,
      name: p.name,
      saga: p.saga,
      years: p.years,
      total,
      completed,
      percent,
    };
  });
}
