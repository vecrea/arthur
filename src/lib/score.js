// ---------------------------------------------------------------------------
// Moteur de compatibilite : pour chaque universite, un score de match 0-100
// pondere selon les priorites (sport / academique / lifestyle / cout),
// + une categorie de recrutement Realiste / Objectif / Ambitieux.
// ---------------------------------------------------------------------------

import { athleteLevel } from './convert.js'

const clamp = (x, a, b) => Math.max(a, Math.min(b, x))

const divisionAmbition = { D1: 1, D2: 0.8, D3: 0.62 }

// realisme d'admission (plus c'est selectif, plus c'est incertain)
function admissionRealism(adm) {
  return { 1: 1, 2: 1, 3: 0.85, 4: 0.65, 5: 0.45 }[adm] ?? 0.7
}

const FIT = {
  safety: { key: 'safety', label: 'Réaliste', labelEn: 'Safety', color: '#16a34a', emoji: '✅' },
  target: { key: 'target', label: 'Objectif', labelEn: 'Target', color: '#0ea5e9', emoji: '🎯' },
  reach: { key: 'reach', label: 'Ambitieux', labelEn: 'Reach', color: '#f59e0b', emoji: '🔥' },
}

function fitCategory(swimLevel, athLevel) {
  const gap = swimLevel - athLevel
  if (gap <= 0) return FIT.safety
  if (gap === 1) return FIT.target
  return FIT.reach
}

export function scoreUniversity(u, profile, fitLevel) {
  const w = profile.weights
  const p = profile.prefs

  const sport = 0.6 * (u.swim / 5) + 0.4 * (divisionAmbition[u.division] ?? 0.7)
  const academic = 0.65 * (u.econ / 5) + 0.35 * admissionRealism(u.admission)

  const sunW = p.sunshine ?? 3
  const athW = p.athleticsCulture ?? 3
  const lifestyle =
    (sunW * (u.sunshine / 5) + athW * (u.athletics / 5)) / (sunW + athW)

  const cost = clamp((95000 - u.costUSD) / (95000 - 33000), 0, 1)

  const total = w.sport * sport + w.academic * academic + w.lifestyle * lifestyle + w.cost * cost
  const match = Math.round(clamp(total, 0, 1) * 100)

  return {
    match,
    fit: fitCategory(u.swim, fitLevel),
    breakdown: {
      sport: Math.round(sport * 100),
      academic: Math.round(academic * 100),
      lifestyle: Math.round(lifestyle * 100),
      cost: Math.round(cost * 100),
    },
  }
}

// Calcule et trie toutes les universites pour un profil donne.
export function computeMatches(profile, universities) {
  const { level: athLevel } = athleteLevel(profile)
  // Niveau utilise pour le classement recrutement = niveau actuel + marge de progression.
  const fitLevel = clamp(athLevel + (profile.recruitHorizonBonus || 0), 1, 5)
  return universities
    .map((u) => ({ ...u, ...scoreUniversity(u, profile, fitLevel) }))
    .sort((a, b) => b.match - a.match)
}
