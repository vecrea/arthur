// ---------------------------------------------------------------------------
// Couche IA : appelle l'API Claude (côté navigateur, avec TA clé stockée
// localement). Sert à : (1) expliquer pourquoi une fac te correspond,
// (2) générer un email de recrutement à un coach.
// La clé reste dans ton navigateur (localStorage) — rien n'est envoyé ailleurs
// qu'à l'API Claude au moment où tu cliques.
// ---------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk'
import { EVENTS, athleteLevel, lcmToScy, formatTime, LEVELS } from './convert.js'

const KEY_STORE = 'pitusa.ai.key.v1'
const MODEL_STORE = 'pitusa.ai.model.v1'
const WHY_STORE = 'pitusa.ai.why.v1'

export const MODELS = [
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 — le moins cher', cost: '~1–2 ¢ / usage' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6 — recommandé', cost: '~5 ¢ / usage' },
  { id: 'claude-opus-4-8', label: 'Opus 4.8 — le plus fort', cost: '~10 ¢ / usage' },
]
const DEFAULT_MODEL = 'claude-sonnet-4-6'

const safeGet = (k) => {
  try {
    return localStorage.getItem(k) || ''
  } catch {
    return ''
  }
}

export const getApiKey = () => safeGet(KEY_STORE)
export const setApiKey = (k) => {
  try {
    k ? localStorage.setItem(KEY_STORE, k.trim()) : localStorage.removeItem(KEY_STORE)
  } catch {
    /* ignore */
  }
}
export const hasApiKey = () => !!getApiKey()

export const getModel = () => safeGet(MODEL_STORE) || DEFAULT_MODEL
export const setModel = (m) => {
  try {
    localStorage.setItem(MODEL_STORE, m)
  } catch {
    /* ignore */
  }
}

// Cache des explications "Pourquoi cette fac" (par id de fac) pour ne pas re-payer.
export function loadWhyCache() {
  try {
    return JSON.parse(localStorage.getItem(WHY_STORE) || '{}')
  } catch {
    return {}
  }
}
export function saveWhy(id, text) {
  try {
    const c = loadWhyCache()
    c[id] = text
    localStorage.setItem(WHY_STORE, JSON.stringify(c))
  } catch {
    /* ignore */
  }
}

// Résumé des temps (FR ou EN) à partir du profil.
function timesSummary(profile, lang) {
  const lines = []
  for (const e of EVENTS) {
    const lcm = profile.times?.[e.key]
    if (lcm == null) continue
    const label = lang === 'en' ? e.labelEn : e.label
    lines.push(`${label}: ${formatTime(lcm)} (LCM 50m) ≈ ${formatTime(lcmToScy(lcm, e.distance))} SCY`)
  }
  return lines.join('; ')
}

// --- Appel générique ---
export async function callClaude({ system, prompt, maxTokens = 700 }) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('NO_KEY')
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const resp = await client.messages.create({
    model: getModel(),
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  })
  return resp.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
}

// --- (1) Pourquoi cette fac me correspond (français) ---
export function explainFit(profile, u) {
  const lvl = LEVELS[athleteLevel(profile).level].label
  const system =
    "Tu es un conseiller en recrutement universitaire américain (NCAA), spécialiste de la natation. Tu réponds en FRANÇAIS, en 3 à 4 phrases, de façon concrète, honnête et motivante. Tu ne survends pas : tu tiens compte du niveau réel de l'athlète et de la catégorie (Réaliste/Objectif/Ambitieux). Termine par un conseil actionnable."
  const prompt = `Profil de l'athlète :
- Nageur belge, 16 ans, entrée fac visée automne ${profile.usEntryYear}, spé sprint nage libre & dos.
- Niveau actuel converti : ${lvl}.
- Temps : ${timesSummary(profile, 'fr')}.
- Objectif d'études : ${profile.major}. Veut du soleil et une bonne ambiance sportive.

Université à évaluer : ${u.name} (${u.shortName}) — Division ${u.division}, conférence ${u.conference}, ${u.city} (${u.state}).
Notes /5 : natation ${u.swim}, économie ${u.econ}, finance ${u.finance}, ambiance sportive ${u.athletics}, soleil ${u.sunshine}. Coût ~${Math.round(u.costUSD / 1000)}k$/an. Score de compatibilité : ${u.match}/100. Catégorie de recrutement : ${u.fit?.label}.

Explique pourquoi cette fac correspond (ou pas) à Arthur, et donne un conseil.`
  return callClaude({ system, prompt, maxTokens: 500 })
}

// --- (2) Email de recrutement à un coach (anglais) ---
export function draftCoachEmail(profile, contact) {
  const system =
    "You help a 16-year-old Belgian swimmer write a recruiting email to a US college swimming coach. Write in ENGLISH, ~150-180 words, authentic and specific (not generic). Be polite and confident. Include: a short intro (who he is, grad/entry year), his BEST TIMES with units, his academic interest, why this program, and a clear ask (interest + how to proceed / questionnaire). Output a SUBJECT line then the email body. Keep it ready to send."
  const coach = contact.coachName ? `Coach ${contact.coachName}` : 'the coaching staff'
  const prompt = `Swimmer:
- Name: ${profile.name}. Nationality: Belgian. Target US enrollment: Fall ${profile.usEntryYear}.
- Specialty: sprint freestyle & backstroke. Trains at ${profile.homeClub} (coach ${profile.coach}); recent training camp at Cercle des Nageurs de Marseille.
- Best times: ${timesSummary(profile, 'en')}.
- Intended major: Economics.

Write the email TO ${coach} at ${contact.school || 'the university'}.`
  return callClaude({ system, prompt, maxTokens: 700 })
}
