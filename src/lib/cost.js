// ---------------------------------------------------------------------------
// Estimation du COÛT NET par fac, en tenant compte de la réalité des bourses
// de natation aux USA. La natation est un sport « equivalency » : une équipe
// se partage ~9,9 bourses (D1 hommes) / 8,1 (D2) sur tout l'effectif → les
// offres sont le plus souvent PARTIELLES. D3 et Ivy = pas de bourse sportive.
//
// ⚠️ Estimations indicatives à partir du coût « international » affiché.
// Le vrai net dépend de l'offre du coach + aide au mérite/besoin. À confirmer.
// Bilingue : netCost(u, lang) renvoie les libellés en FR ou EN.
// ---------------------------------------------------------------------------

const k = (n) => '$' + Math.round(n / 1000) + 'k'

export function netCost(u, lang = 'fr') {
  const en = lang === 'en'
  const conf = (u.conference || '').toLowerCase()
  const isIvy = conf.includes('ivy')
  // Académies militaires : gratuit mais engagement de service (cas particulier).
  const isService = /army|navy|air force/i.test(u.shortName || '')
  const perYr = en ? '/yr' : '/an'

  if (isService) {
    return {
      kind: 'service',
      label: en ? 'Service academy — tuition covered' : 'Académie militaire — scolarité couverte',
      note: en
        ? 'No tuition fees, but a military service commitment after graduation. Very specific case.'
        : 'Pas de frais de scolarité, mais engagement de service militaire après le diplôme. Cas très particulier.',
      range: en ? `≈ $0/yr (tuition)` : '≈ $0/an (scolarité)',
    }
  }
  if (u.division === 'D3') {
    return {
      kind: 'd3',
      label: en ? 'No athletic scholarship (D3 rule)' : 'Pas de bourse sportive (règle D3)',
      note: en
        ? 'D3 grants no athletic scholarships. But merit- and need-based aid are possible depending on your academic record.'
        : 'La D3 n’attribue aucune bourse sportive. Mais aides au mérite et au besoin possibles selon ton dossier scolaire.',
      range: en ? `${k(u.costUSD)}/yr (before aid)` : `${k(u.costUSD)}/an (avant aide)`,
    }
  }
  if (isIvy) {
    return {
      kind: 'ivy',
      label: en ? 'No athletic scholarship (Ivy League)' : 'Pas de bourse sportive (Ivy League)',
      note: en
        ? 'Ivy schools offer no athletic scholarships: only financial aid based on family income (need-based).'
        : 'Les facs Ivy n’offrent pas de bourse sportive : uniquement de l’aide financière selon les revenus familiaux (need-based).',
      range: en ? `${k(u.costUSD)}/yr (before aid)` : `${k(u.costUSD)}/an (avant aide)`,
    }
  }
  // D1 / D2 hors Ivy : bourse sportive « equivalency » possible, souvent partielle.
  const low = u.costUSD * 0.4 // scénario bourse généreuse (~60 %)
  const high = u.costUSD * 0.85 // scénario bourse modeste (~15 %)
  return {
    kind: 'athletic',
    label: en
      ? 'Athletic scholarship possible (swimming = “equivalency” sport)'
      : 'Bourse sportive possible (natation = sport « equivalency »)',
    note: en
      ? 'The team shares ~9.9 scholarships (D1) / 8.1 (D2) across the whole roster → usually partial. Can be combined with merit aid.'
      : 'L’équipe partage ~9,9 bourses (D1) / 8,1 (D2) sur tout l’effectif → le plus souvent partielles. Cumulables avec une aide au mérite.',
    range: en ? `≈ ${k(low)}–${k(high)}${perYr} net depending on scholarship` : `≈ ${k(low)}–${k(high)}/an net selon la bourse`,
  }
}
