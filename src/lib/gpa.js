// ---------------------------------------------------------------------------
// Conversion notes belges (/20) -> GPA américain (/4.0) + lettre + mention.
//
// ⚠️ INDICATIF : il n'existe pas de table officielle unique. Les évaluateurs
// (WES, NCAA Eligibility Center, admissions) ont chacun leur barème. Ceci
// donne un ordre de grandeur fiable, à confirmer via l'organisme officiel.
// ---------------------------------------------------------------------------

// Bandes /20 -> GPA (points) + lettre US. Du plus haut au plus bas.
export const GPA_BANDS = [
  { min: 18, gpa: 4.0, letter: 'A' },
  { min: 16, gpa: 3.7, letter: 'A-' },
  { min: 15, gpa: 3.3, letter: 'B+' },
  { min: 14, gpa: 3.0, letter: 'B' },
  { min: 13, gpa: 2.7, letter: 'B-' },
  { min: 12, gpa: 2.3, letter: 'C+' },
  { min: 11, gpa: 2.0, letter: 'C' },
  { min: 10, gpa: 1.7, letter: 'C-' },
  { min: 0, gpa: 0.0, letter: 'F' },
]

export function bandFor20(g) {
  const x = Number(g)
  if (Number.isNaN(x)) return null
  return GPA_BANDS.find((b) => x >= b.min) || GPA_BANDS[GPA_BANDS.length - 1]
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

// Moyenne pondérée depuis [{grade, weight}] -> { avg20, gpa, count }.
export function computeGpa(subjects) {
  let sumW = 0, sumG20 = 0, sumGpa = 0, n = 0
  for (const s of subjects || []) {
    const g = Number(s.grade)
    if (s.grade === '' || Number.isNaN(g)) continue
    const w = Number(s.weight) > 0 ? Number(s.weight) : 1
    const band = bandFor20(g)
    if (!band) continue
    sumW += w
    sumG20 += g * w
    sumGpa += band.gpa * w
    n++
  }
  if (!n || sumW === 0) return null
  return { avg20: sumG20 / sumW, gpa: sumGpa / sumW, count: n }
}
