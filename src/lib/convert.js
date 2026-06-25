// ---------------------------------------------------------------------------
// Conversion des temps de natation (grand bassin 50 m / LCM) vers le standard
// universitaire americain (yards / SCY), + estimation du niveau de recrutement.
//
// IMPORTANT : les facteurs ci-dessous sont des APPROXIMATIONS pedagogiques,
// pas la table officielle USA Swimming. Ils donnent un ordre de grandeur fiable
// pour situer un nageur, mais le temps converti exact doit etre verifie.
// Ils sont volontairement isoles ici pour etre affines facilement plus tard.
// ---------------------------------------------------------------------------

// Facteur multiplicatif LCM -> SCY (temps_scy ≈ temps_lcm * facteur), par distance.
export const LCM_TO_SCY = {
  50: 0.885,
  100: 0.889,
  200: 0.895,
  400: 0.9,
  800: 0.905,
  1500: 0.91,
}

// Facteur SCM (petit bassin 25 m) -> SCY. Le nombre de virages est IDENTIQUE
// en 25 m et 25 yd : la conversion est donc quasiment le seul ratio
// metres->yards (~0,914) et varie peu avec la distance (contrairement au LCM).
export const SCM_TO_SCY = {
  50: 0.913,
  100: 0.913,
  200: 0.915,
  400: 0.917,
  800: 0.918,
  1500: 0.92,
}

// Definition des epreuves suivies : toutes les courses individuelles
// (nage libre, dos, brasse, papillon, 4 nages). Les temps d'Arthur ne
// concernent que quelques-unes ; les autres servent au suivi de chronos.
export const EVENTS = [
  { key: '50FR', label: '50 NL', labelEn: '50 Free', stroke: 'Nage libre', distance: 50 },
  { key: '100FR', label: '100 NL', labelEn: '100 Free', stroke: 'Nage libre', distance: 100 },
  { key: '200FR', label: '200 NL', labelEn: '200 Free', stroke: 'Nage libre', distance: 200 },
  { key: '400FR', label: '400 NL', labelEn: '400 Free', stroke: 'Nage libre', distance: 400 },
  { key: '800FR', label: '800 NL', labelEn: '800 Free', stroke: 'Nage libre', distance: 800 },
  { key: '1500FR', label: '1500 NL', labelEn: '1500 Free', stroke: 'Nage libre', distance: 1500 },
  { key: '50BK', label: '50 Dos', labelEn: '50 Back', stroke: 'Dos', distance: 50 },
  { key: '100BK', label: '100 Dos', labelEn: '100 Back', stroke: 'Dos', distance: 100 },
  { key: '200BK', label: '200 Dos', labelEn: '200 Back', stroke: 'Dos', distance: 200 },
  { key: '50BR', label: '50 Brasse', labelEn: '50 Breast', stroke: 'Brasse', distance: 50 },
  { key: '100BR', label: '100 Brasse', labelEn: '100 Breast', stroke: 'Brasse', distance: 100 },
  { key: '200BR', label: '200 Brasse', labelEn: '200 Breast', stroke: 'Brasse', distance: 200 },
  { key: '50FL', label: '50 Pap', labelEn: '50 Fly', stroke: 'Papillon', distance: 50 },
  { key: '100FL', label: '100 Pap', labelEn: '100 Fly', stroke: 'Papillon', distance: 100 },
  { key: '200FL', label: '200 Pap', labelEn: '200 Fly', stroke: 'Papillon', distance: 200 },
  { key: '200IM', label: '200 4N', labelEn: '200 IM', stroke: '4 nages', distance: 200 },
  { key: '400IM', label: '400 4N', labelEn: '400 IM', stroke: '4 nages', distance: 400 },
]

// Seuils INDICATIFS de niveau en yards (SCY), hommes. Du plus rapide au plus lent.
// Index 0 => niveau 5 (Elite D1) ... index 4 => seuil du niveau 2.
// En dessous du dernier seuil => niveau 1 (Developpement / D3).
// [Elite D1, Solide D1, Bas D1 / Haut D2, D2 / Haut D3]
export const THRESHOLDS_SCY = {
  '50FR': [19.3, 20.2, 21.2, 22.5],
  '100FR': [42.5, 44.0, 46.0, 48.5],
  '200FR': [94.0, 97.0, 101.0, 106.0],
  '400FR': [203.0, 211.0, 221.0, 234.0],
  '800FR': [425.0, 443.0, 462.0, 489.0],
  '1500FR': [819.0, 855.0, 892.0, 946.0],
  '50BK': [21.5, 22.5, 23.5, 25.0],
  '100BK': [46.5, 48.5, 50.5, 53.0],
  '200BK': [101.0, 105.0, 109.0, 115.0],
  '50BR': [24.0, 25.2, 26.4, 28.0],
  '100BR': [52.5, 54.5, 56.5, 59.5],
  '200BR': [114.0, 118.0, 122.0, 128.0],
  '50FL': [20.8, 21.8, 22.8, 24.2],
  '100FL': [45.5, 47.0, 49.0, 52.0],
  '200FL': [102.0, 106.0, 110.0, 116.0],
  '200IM': [104.0, 108.0, 112.0, 118.0],
  '400IM': [222.0, 230.0, 239.0, 252.0],
}

// Cibles SCY nommees pour une epreuve : du plus rapide (elite) au plus lent.
export function eventTargets(eventKey) {
  const t = THRESHOLDS_SCY[eventKey]
  if (!t) return null
  return { eliteD1: t[0], solidD1: t[1], lowD1: t[2], d2d3: t[3] }
}

export const LEVELS = {
  5: { key: 5, short: 'Élite D1', label: 'Élite D1 (scoring NCAA)', color: '#7c3aed' },
  4: { key: 4, short: 'Solide D1', label: 'Solide Division 1', color: '#0284c7' },
  3: { key: 3, short: 'Bas D1 / D2', label: 'Bas D1 / Haut D2', color: '#0ea5e9' },
  2: { key: 2, short: 'D2 / D3', label: 'D2 / Haut D3', color: '#16a34a' },
  1: { key: 1, short: 'Développement', label: 'Développement / D3', color: '#64748b' },
}

// Convertit un temps LCM (en secondes) vers SCY (en secondes).
export function lcmToScy(seconds, distance) {
  const f = LCM_TO_SCY[distance] ?? 0.89
  return seconds * f
}

// Convertit un temps SCM (petit bassin 25 m) vers SCY (en secondes).
export function scmToScy(seconds, distance) {
  const f = SCM_TO_SCY[distance] ?? 0.914
  return seconds * f
}

// Convertit n'importe quel bassin ('LCM' | 'SCM' | 'SCY') vers SCY.
export function toScy(seconds, distance, course) {
  if (course === 'SCY') return seconds
  if (course === 'SCM') return scmToScy(seconds, distance)
  return lcmToScy(seconds, distance) // LCM par defaut
}

// Niveau (1..5) d'un temps SCY pour une epreuve donnee.
export function scyLevel(scySeconds, eventKey) {
  const t = THRESHOLDS_SCY[eventKey]
  if (!t) return 1
  if (scySeconds <= t[0]) return 5
  if (scySeconds <= t[1]) return 4
  if (scySeconds <= t[2]) return 3
  if (scySeconds <= t[3]) return 2
  return 1
}

// Niveau global de l'athlete = meilleur niveau atteint sur l'ensemble de ses epreuves.
export function athleteLevel(profile) {
  const byEvent = {}
  let best = 1
  for (const ev of EVENTS) {
    const lcm = profile.times?.[ev.key]
    if (lcm == null) continue
    const scy = lcmToScy(lcm, ev.distance)
    const lvl = scyLevel(scy, ev.key)
    byEvent[ev.key] = { lcm, scy, level: lvl }
    if (lvl > best) best = lvl
  }
  return { level: best, byEvent }
}

// secondes -> "mm:ss.xx" ou "ss.xx"
export function formatTime(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds - m * 60
  if (m > 0) return `${m}:${s.toFixed(2).padStart(5, '0')}`
  return s.toFixed(2)
}

// "1:07.39" | "67.39" | "27,46" -> secondes (ou null si invalide)
export function parseTime(str) {
  if (typeof str !== 'string') return null
  const s = str.trim().replace(',', '.')
  const m = s.match(/^(?:(\d+):)?(\d{1,2}(?:\.\d{1,2})?)$/)
  if (!m) return null
  const mins = m[1] ? parseInt(m[1], 10) : 0
  const secs = parseFloat(m[2])
  if (Number.isNaN(secs) || secs >= 60) return null
  return mins * 60 + secs
}
