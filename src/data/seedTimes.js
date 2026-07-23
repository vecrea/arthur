// Temps « gravés » dans l'app — records successifs d'Arthur, saisis à la main.
// On ne garde QUE les améliorations : chaque temps est plus rapide que le
// précédent (les courses invalides « X » / non-records sont écartées).
// Ces temps sont toujours présents (baked) ; les ajouts via l'onglet
// « Chronos » viennent s'ajouter par-dessus (cf. loadTimes dans storage.js).

export const SEED_TIMES = [
  // 50 dos — petit bassin (25 m / SCM)
  { id: 'seed-50BK-2023-04-07', eventKey: '50BK', course: 'SCM', seconds: 36.63, date: '2023-04-07', meet: 'Funky Spring Race' },
  { id: 'seed-50BK-2024-03-29', eventKey: '50BK', course: 'SCM', seconds: 34.5, date: '2024-03-29', meet: 'Funky Spring Race — Braine-l’Alleud' },
  { id: 'seed-50BK-2024-11-23', eventKey: '50BK', course: 'SCM', seconds: 34.35, date: '2024-11-23', meet: 'Meeting de fin d’année' },
  { id: 'seed-50BK-2025-04-18', eventKey: '50BK', course: 'SCM', seconds: 33.4, date: '2025-04-18', meet: 'Arena Spring Race — Braine-l’Alleud' },
  { id: 'seed-50BK-2025-04-20', eventKey: '50BK', course: 'SCM', seconds: 32.62, date: '2025-04-20', meet: 'Arena Spring Race — Braine-l’Alleud' },
  { id: 'seed-50BK-2026-04-03', eventKey: '50BK', course: 'SCM', seconds: 30.39, date: '2026-04-03', meet: 'Arena Spring Race — Braine-l’Alleud' },

  // 100 dos — petit bassin (25 m / SCM)
  { id: 'seed-100BK-2023-04-08', eventKey: '100BK', course: 'SCM', seconds: 81.49, date: '2023-04-08', meet: 'Funky Spring Race' },
  { id: 'seed-100BK-2024-03-30', eventKey: '100BK', course: 'SCM', seconds: 74.4, date: '2024-03-30', meet: 'Funky Spring Race — Braine-l’Alleud' },
  { id: 'seed-100BK-2024-11-23', eventKey: '100BK', course: 'SCM', seconds: 74.29, date: '2024-11-23', meet: 'Meeting de fin d’année' },
  { id: 'seed-100BK-2025-04-19', eventKey: '100BK', course: 'SCM', seconds: 70.76, date: '2025-04-19', meet: 'Arena Spring Race — Braine-l’Alleud' },
  { id: 'seed-100BK-2026-04-04', eventKey: '100BK', course: 'SCM', seconds: 66.2, date: '2026-04-04', meet: 'Arena Spring Race — Braine-l’Alleud' },

  // 200 nage libre (crawl) — petit bassin (25 m / SCM)
  { id: 'seed-200FR-2024-03-31', eventKey: '200FR', course: 'SCM', seconds: 145.83, date: '2024-03-31', meet: 'Funky Spring Race — Braine-l’Alleud' },
  { id: 'seed-200FR-2024-11-22', eventKey: '200FR', course: 'SCM', seconds: 141.08, date: '2024-11-22', meet: 'Meeting de fin d’année' },
  { id: 'seed-200FR-2025-04-20', eventKey: '200FR', course: 'SCM', seconds: 136.94, date: '2025-04-20', meet: 'Arena Spring Race — Braine-l’Alleud' },
  { id: 'seed-200FR-2026-04-05', eventKey: '200FR', course: 'SCM', seconds: 131.27, date: '2026-04-05', meet: 'Arena Spring Race — Braine-l’Alleud' },

  // 200 nage libre (crawl) — grand bassin (50 m / LCM)
  { id: 'seed-200FR-lcm-2023-02-11', eventKey: '200FR', course: 'LCM', seconds: 172.03, date: '2023-02-11', meet: 'Championnat FFBN Jeunes' },
  { id: 'seed-200FR-lcm-2024-01-28', eventKey: '200FR', course: 'LCM', seconds: 158.47, date: '2024-01-28', meet: 'Meeting de Janus' },
  { id: 'seed-200FR-lcm-2025-02-16', eventKey: '200FR', course: 'LCM', seconds: 142.87, date: '2025-02-16', meet: 'Championnats FFBN Open' },
  { id: 'seed-200FR-lcm-2026-06-07', eventKey: '200FR', course: 'LCM', seconds: 131.44, date: '2026-06-07', meet: 'Meeting International de la Ville d’Ottignies' },

  // 200 dos — petit bassin (25 m / SCM)
  { id: 'seed-200BK-2024-11-23', eventKey: '200BK', course: 'SCM', seconds: 157.02, date: '2024-11-23', meet: 'Meeting de fin d’année' },
  { id: 'seed-200BK-2025-04-20', eventKey: '200BK', course: 'SCM', seconds: 154.17, date: '2025-04-20', meet: 'Arena Spring Race — Braine-l’Alleud' },
  { id: 'seed-200BK-2026-04-05', eventKey: '200BK', course: 'SCM', seconds: 143.68, date: '2026-04-05', meet: 'Arena Spring Race — Braine-l’Alleud' },
]
