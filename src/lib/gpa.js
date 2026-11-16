// ---------------------------------------------------------------------------
// Conversion notes belges (/20) -> GPA américain (/4.0) + lettre + mention.
//
// ⚠️ INDICATIF : il n'existe pas de table officielle unique. Les évaluateurs
// (WES, NCAA Eligibility Center, admissions) ont chacun leur barème. Ceci
// donne un ordre de grandeur fiable, à confirmer via l'organisme officiel.
// ---------------------------------------------------------------------------

// Bandes /20 -> GPA (points) + lettre US. Du plus haut au plus bas.
// Valeurs en points calées sur la table officielle NCAA (Grade-Point Values).
export const GPA_BANDS = [
  { min: 18, gpa: 4.0, letter: 'A' },
  { min: 16, gpa: 3.667, letter: 'A-' },
  { min: 15, gpa: 3.333, letter: 'B+' },
  { min: 14, gpa: 3.0, letter: 'B' },
  { min: 13, gpa: 2.667, letter: 'B-' },
  { min: 12, gpa: 2.333, letter: 'C+' },
  { min: 11, gpa: 2.0, letter: 'C' },
  { min: 10, gpa: 1.667, letter: 'C-' },
  { min: 0, gpa: 0.0, letter: 'F' },
]

// Table officielle NCAA « Grade-Point Values » (International Student-Athlete
// Handbook) — référence affichée telle quelle, regroupée par palier et couleur.
export const NCAA_GRADE_POINTS = [
  { letter: 'A', gpa: 4.0, tier: 'superior', color: '#1d7a4d' },
  { letter: 'A-', gpa: 3.667, tier: 'superior', color: '#5cb85c' },
  { letter: 'B+', gpa: 3.333, tier: 'above', color: '#3a3f7a' },
  { letter: 'B', gpa: 3.0, tier: 'above', color: '#6f63a0' },
  { letter: 'B-', gpa: 2.667, tier: 'above', color: '#9aa2cf' },
  { letter: 'C+', gpa: 2.333, tier: 'average', color: '#0e2b52' },
  { letter: 'C', gpa: 2.0, tier: 'average', color: '#1273b8' },
  { letter: 'C-', gpa: 1.667, tier: 'average', color: '#5fc3ef' },
  { letter: 'D', gpa: 1.0, tier: 'below', color: '#e8882a' },
  { letter: 'F', gpa: 0.0, tier: 'failing', color: '#9e2b25' },
]

export const NCAA_TIERS = {
  superior: { fr: 'Supérieur', en: 'Superior' },
  above: { fr: 'Au-dessus de la moyenne', en: 'Above average' },
  average: { fr: 'Moyen', en: 'Average' },
  below: { fr: 'En dessous de la moyenne', en: 'Below average' },
  failing: { fr: 'Échec', en: 'Failing' },
}

export function bandFor20(g) {
  const x = Number(g)
  if (Number.isNaN(x)) return null
  return GPA_BANDS.find((b) => x >= b.min) || GPA_BANDS[GPA_BANDS.length - 1]
}

// Ramène une note à l'échelle /20 selon l'échelle de saisie ('20' ou '100' = %).
export function norm20(grade, scale) {
  const x = Number(grade)
  if (Number.isNaN(x)) return NaN
  return scale === '100' ? x / 5 : x
}

// Une note saisie est-elle dans le barème (0..20 ou 0..100) ?
export function gradeInRange(grade, scale) {
  const max = scale === '100' ? 100 : 20
  const x = Number(grade)
  return !(grade === '' || Number.isNaN(x) || x < 0 || x > max)
}

// Bande de conversion pour une note dans son échelle native.
export function bandFor(grade, scale) {
  const g20 = norm20(grade, scale)
  if (Number.isNaN(g20)) return null
  return GPA_BANDS.find((b) => g20 >= b.min) || GPA_BANDS[GPA_BANDS.length - 1]
}

const LETTER_BY_GPA = [
  [3.85, 'A'], [3.5, 'A-'], [3.15, 'B+'], [2.85, 'B'], [2.5, 'B-'], [2.15, 'C+'], [1.85, 'C'], [1.5, 'C-'], [0, 'F'],
]
export function gpaToLetter(g) {
  for (const [m, l] of LETTER_BY_GPA) if (g >= m) return l
  return 'F'
}

// Mention belge (clé) à partir de la moyenne /20.
export function mentionKey(avg20) {
  const x = Number(avg20)
  if (x >= 18) return 'summa'
  if (x >= 16) return 'magna'
  if (x >= 14) return 'cum'
  if (x >= 12) return 'satis'
  if (x >= 10) return 'pass'
  return 'fail'
}

// Moyenne pondérée depuis [{grade, weight}] et l'échelle de saisie.
// -> { avgNative (dans l'échelle saisie), avg20, gpa, count }.
export function computeGpa(subjects, scale = '20') {
  const max = scale === '100' ? 100 : 20
  let sumW = 0, sumNative = 0, sum20 = 0, sumGpa = 0, n = 0
  for (const s of subjects || []) {
    const raw = Number(s.grade)
    // Ignore les notes vides ou hors barème (une faute de frappe ne doit pas fausser la moyenne).
    if (s.grade === '' || Number.isNaN(raw) || raw < 0 || raw > max) continue
    const w = Number(s.weight) > 0 ? Number(s.weight) : 1
    const g20 = norm20(raw, scale)
    const band = GPA_BANDS.find((b) => g20 >= b.min) || GPA_BANDS[GPA_BANDS.length - 1]
    sumW += w
    sumNative += raw * w
    sum20 += g20 * w
    sumGpa += band.gpa * w
    n++
  }
  if (!n || sumW === 0) return null
  return { avgNative: sumNative / sumW, avg20: sum20 / sumW, gpa: sumGpa / sumW, count: n }
}
