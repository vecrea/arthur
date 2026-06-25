// ---------------------------------------------------------------------------
// Import « copier-coller » depuis SwimCloud (ou autre tableau de résultats).
// SwimCloud n'expose pas d'API publique et l'app n'a pas de serveur : on ne
// peut pas lire le profil en direct (CORS). On analyse donc le texte collé
// depuis la page « Best Times » : on en extrait épreuve + temps + bassin.
//
// Tolérant : gère les libellés EN (50 Free, 100 Back, 200 IM…) et FR, les
// temps « 23.45 » ou « 1:07.39 », et le bassin SCY / LCM / SCM (ou Y/L/S).
// Les épreuves non suivies (ex. 500 Free yards, 100 IM) sont ignorées.
// ---------------------------------------------------------------------------
import { EVENTS, parseTime } from './convert.js'

const KEYS = new Set(EVENTS.map((e) => e.key))

const STROKES = [
  [/butterfly|\bfly\b|papillon|\bpap\b/i, 'FL'],
  [/breast|brasse/i, 'BR'],
  [/back|\bdos\b/i, 'BK'],
  [/free|nage\s?libre|\bnl\b/i, 'FR'],
  [/medley|\bim\b|4\s?nages|quatre\s?nages/i, 'IM'],
]

function courseFromToken(tok) {
  const u = (tok || '').toUpperCase()
  if (u === 'SCY' || u === 'Y') return 'SCY'
  if (u === 'LCM' || u === 'L') return 'LCM'
  if (u === 'SCM' || u === 'S') return 'SCM'
  return null
}

function detectCourse(line, fallback) {
  if (/\bSCY\b|yards?/i.test(line)) return 'SCY'
  if (/\bLCM\b|long\s?course/i.test(line)) return 'LCM'
  if (/\bSCM\b|short\s?course\s?met/i.test(line)) return 'SCM'
  return fallback
}

// Analyse un texte collé (SwimCloud, SwimRankings, CSV…).
// Renvoie { matched: [{eventKey, course, seconds}], skipped: n }
export function parseSwimcloud(text, fallbackCourse = 'LCM') {
  const matched = []
  let skipped = 0
  for (const raw of (text || '').split(/[\n\r]+/)) {
    const line = raw.trim()
    if (!line) continue
    // distance + unité optionnelle (m/yd) + bassin optionnel + nage
    const dm = line.match(
      /(\d{2,4})\s*(m|meters?|metres?|yd|yards?|y)?\s*(?:(SCY|LCM|SCM)\s+)?(butterfly|fly|papillon|pap|breaststroke|breast|brasse|backstroke|back|dos|freestyle|free|nage\s?libre|nl|medley|im|4\s?nages)/i,
    )
    if (!dm) continue
    const dist = parseInt(dm[1], 10)
    let st = null
    for (const [re, code] of STROKES) {
      if (re.test(dm[4])) { st = code; break }
    }
    if (!st) continue
    const key = `${dist}${st}`
    // premier temps de la ligne (ss.xx ou m:ss.xx)
    const tm = line.match(/(?:(\d{1,2}):)?(\d{1,2}\.\d{2})/)
    if (!tm) continue
    const secs = parseTime(tm[0])
    if (secs == null) continue
    if (!KEYS.has(key)) { skipped++; continue }
    // bassin : token explicite > unité yards > détection sur la ligne > défaut
    let course
    if (dm[3]) course = courseFromToken(dm[3]) || fallbackCourse
    else if ((dm[2] || '').toLowerCase().startsWith('y')) course = 'SCY'
    else course = detectCourse(line, fallbackCourse)
    matched.push({ eventKey: key, course, seconds: secs })
  }
  return { matched, skipped }
}
