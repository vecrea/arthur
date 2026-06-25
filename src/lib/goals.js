// ---------------------------------------------------------------------------
// Logique des objectifs de chronos. Le "meilleur temps actuel" d'une épreuve
// combine les chronos enregistrés ET les records du profil (le plus rapide),
// tout converti en yards (SCY) pour être comparable à la cible.
// ---------------------------------------------------------------------------
import { EVENTS, toScy, lcmToScy } from './convert.js'

const EV = Object.fromEntries(EVENTS.map((e) => [e.key, e]))

// Meilleur temps connu (SCY) pour une épreuve, ou null si aucun.
export function bestScyForEvent(eventKey, times, profile) {
  const ev = EV[eventKey]
  if (!ev) return null
  let best = null
  for (const t of times || []) {
    if (t.eventKey !== eventKey) continue
    const s = toScy(t.seconds, ev.distance, t.course)
    if (best == null || s < best) best = s
  }
  const lcm = profile?.times?.[eventKey]
  if (lcm != null) {
    const s = lcmToScy(lcm, ev.distance)
    if (best == null || s < best) best = s
  }
  return best
}

// État d'un objectif : cible, actuel, écart, atteint ?, progression %.
export function goalStatus(goal, times, profile) {
  const ev = EV[goal.eventKey]
  const targetScy = toScy(goal.seconds, ev.distance, goal.course)
  const currentScy = bestScyForEvent(goal.eventKey, times, profile)
  const achieved = currentScy != null && currentScy <= targetScy + 1e-6
  const gap = currentScy != null ? currentScy - targetScy : null
  let pct = 0
  if (currentScy != null) {
    if (achieved) pct = 100
    else if (goal.startScy != null && goal.startScy > targetScy) {
      pct = Math.max(0, Math.min(100, ((goal.startScy - currentScy) / (goal.startScy - targetScy)) * 100))
    }
  }
  return { ev, targetScy, currentScy, achieved, gap, pct }
}
