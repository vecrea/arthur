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
]
