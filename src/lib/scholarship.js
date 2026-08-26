// ---------------------------------------------------------------------------
// Potentiel de bourse « complète » par université.
//
// Rappel : la natation est un sport « à équivalence » (~9,9 bourses en D1,
// ~8,1 en D2, partagées sur tout l'effectif). Une bourse complète est donc
// RARE et réservée aux profils vraiment recrutés. En D3, aucune bourse
// sportive — mais le mérite peut couvrir l'essentiel dans les facs cotées.
//
// On DÉDUIT le potentiel des données existantes (division, force du programme
// et du département sportif, prestige académique) pour rester honnête, plutôt
// que de saisir une valeur à la main sur chaque fiche.
// ---------------------------------------------------------------------------

// Majuscule sur la 1re lettre uniquement (évite « Complète Possible » du CSS capitalize).
export const capFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

const HIGH = { key: 'high', color: '#16a34a' }
const PARTIAL = { key: 'partial', color: '#f59e0b' }
const MERIT = { key: 'merit', color: '#94a3b8' }

export function scholarshipPotential(u) {
  // ---- Division 3 : pas de bourse sportive, tout passe par le mérite ----
  if (u.division === 'D3') {
    // Facs sélectives / cotées → aides au mérite fortes, financement quasi complet possible.
    if (u.curated && (u.econ >= 4 || u.admission >= 4)) {
      return {
        ...HIGH,
        label: 'quasi complète (mérite)',
        labelEn: 'near-full (merit)',
        note: 'Pas de bourse sportive (D3), mais de fortes aides au mérite/besoin : un excellent dossier scolaire peut couvrir l’essentiel du coût.',
        noteEn: 'No athletic scholarship (D3), but strong merit/need-based aid: an excellent academic record can cover most of the cost.',
      }
    }
    return {
      ...MERIT,
      label: 'mérite uniquement',
      labelEn: 'merit aid only',
      note: 'Pas de bourse sportive (D3) : le financement passe uniquement par les aides au mérite (souvent partielles pour un international).',
      noteEn: 'No athletic scholarship (D3): funding comes only from merit aid (often partial for an international).',
    }
  }

  // ---- Division 1 : gros programme financé → bourse complète atteignable ----
  if (u.curated && u.division === 'D1' && (u.athletics >= 4 || u.swim >= 4)) {
    return {
      ...HIGH,
      label: 'complète possible',
      labelEn: 'full ride possible',
      note: 'Programme D1 financé : une bourse complète est atteignable pour un profil vraiment recruté (le plus souvent partielle sinon), et cumulable avec des aides au mérite.',
      noteEn: 'Funded D1 program: a full ride is reachable for a genuinely recruited profile (otherwise usually partial), and can be stacked with merit aid.',
    }
  }

  // ---- Reste (D1 mid-major, D2, fiches annuaire) : surtout partiel ----
  return {
    ...PARTIAL,
    label: 'partielle probable',
    labelEn: 'usually partial',
    note: 'Natation = sport à équivalence : les bourses sportives sont surtout partielles, le complet étant réservé aux profils d’élite. Un bon dossier scolaire aide à compléter.',
    noteEn: 'Swimming is an equivalency sport: athletic scholarships are mostly partial, with full rides reserved for elite profiles. A strong academic record helps top it up.',
  }
}
