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
}

// Definition des epreuves suivies.
export const EVENTS = [
  { key: '50FR', label: '50 NL', labelEn: '50 Free', stroke: 'Nage libre', distance: 50 },
  { key: '100FR', label: '100 NL', labelEn: '100 Free', stroke: 'Nage libre', distance: 100 },
  { key: '200FR', label: '200 NL', labelEn: '200 Free', stroke: 'Nage libre', distance: 200 },
  { key: '50BK', label: '50 Dos', labelEn: '50 Back', stroke: 'Dos', distance: 50 },
  { key: '100BK', label: '100 Dos', labelEn: '100 Back', stroke: 'Dos', distance: 100 },
  { key: '200BK', label: '200 Dos', labelEn: '200 Back', stroke: 'Dos', distance: 200 },
]

// Seuils INDICATIFS de niveau en yards (SCY), hommes. Du plus rapide au plus lent.
// Index 0 => niveau 5 (Elite D1) ... index 4 => seuil du niveau 2.
// En dessous du dernier seuil => niveau 1 (Developpement / D3).
// [Elite D1, Solide D1, Bas D1 / Haut D2, D2 / Haut D3]
const THRESHOLDS_SCY = {
  '50FR': [19.3, 20.2, 21.2, 22.5],
  '100FR': [42.5, 44.0, 46.0, 48.5],
  '200FR': [94.0, 97.0, 101.0, 106.0],
  '50BK': [21.5, 22.5, 23.5, 25.0],
  '100BK': [46.5, 48.5, 50.5, 53.0],
  '200BK': [101.0, 105.0, 109.0, 115.0],
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
