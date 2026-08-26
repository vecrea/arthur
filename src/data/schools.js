// ---------------------------------------------------------------------------
// Liste complète des facs = 28 facs CURÉES (notes détaillées, coachs vérifiés)
// + un large ANNUAIRE (directory.json) de programmes de natation masculine
// D1/D2/D3. Les fiches annuaire ont des notes de base (soleil déduit de l'état,
// niveau natation déduit de la division) — clairement marquées curated:false.
// ---------------------------------------------------------------------------

import { universities as CURATED } from './universities.js'
import directory from './directory.json'

// Ensoleillement indicatif par état (1 = peu, 5 = beaucoup).
const SUN = {
  HI: 5, FL: 5, AZ: 5, CA: 5, NM: 5, NV: 5, TX: 4, LA: 4, GA: 4, AL: 4, MS: 4,
  SC: 4, OK: 4, NC: 4, TN: 3, AR: 4, KS: 3, MO: 3, KY: 3, VA: 3, MD: 3, DC: 3,
  CO: 4, UT: 4, DE: 3, NJ: 3, WV: 3, OR: 3, WA: 2, ID: 3, MT: 3, WY: 3, NE: 3,
  IA: 2, IL: 2, IN: 2, OH: 2, PA: 2, NY: 2, CT: 2, RI: 2, MA: 2, NH: 2, VT: 2,
  ME: 2, MI: 2, WI: 2, MN: 2, ND: 2, SD: 2, AK: 1,
}
const SWIM_BY_DIV = { D1: 4, D2: 3, D3: 2 }

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
const slug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const curatedKeys = new Set(CURATED.flatMap((c) => [norm(c.name), norm(c.shortName)]))

function normalize(d) {
  const div = d.division || 'D3'
  return {
    id: 'dir-' + slug(d.shortName || d.name),
    name: d.name,
    shortName: d.shortName || d.name,
    city: d.city || '',
    state: d.state || '',
    division: div,
    conference: d.conference || '—',
    type: d.type || '',
    enrollment: 0,
    sizeLabel: '',
    sunshine: SUN[d.state] ?? 3,
    econ: 3,
    finance: 3,
    athletics: 3,
    swim: SWIM_BY_DIV[div] ?? 2,
    admission: 3,
    costUSD: d.type === 'Privée' ? 70000 : 45000,
    scholarshipNote:
      div === 'D3' ? 'Pas de bourse sportive (D3) ; aides au mérite possibles' : 'Bourses sportives possibles (à vérifier)',
    swimNote: 'Fiche annuaire — infos de base, à vérifier via les liens (staff, site).',
    highlights: [],
    curated: false,
  }
}

const seen = new Set()
const dirNormalized = []
for (const d of directory) {
  const key = norm(d.name)
  if (!key || curatedKeys.has(key) || curatedKeys.has(norm(d.shortName)) || seen.has(key)) continue
  seen.add(key)
  dirNormalized.push(normalize(d))
}

export const universities = [...CURATED.map((u) => ({ ...u, curated: true })), ...dirNormalized]
export const DIRECTORY_COUNT = dirNormalized.length
export const CURATED_COUNT = CURATED.length
