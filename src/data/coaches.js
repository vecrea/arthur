// ---------------------------------------------------------------------------
// Coachs natation VÉRIFIÉS (recherche manuelle — juin 2026) pour la shortlist
// (meilleurs matchs). ⚠️ Les staffs changent souvent : à re-vérifier via le lien.
// Les emails directs des coachs D1 sont rarement publics : on contacte via le
// FORMULAIRE RECRUE / la page staff officielle (d'où le lien "staffUrl").
// ---------------------------------------------------------------------------

export const COACHES_AS_OF = 'juin 2026'

export const VERIFIED_COACHES = {
  florida: {
    staffUrl: 'https://floridagators.com/sports/mens-swimming-and-diving/coaches',
    staff: [
      { role: 'Head Coach', name: 'Anthony Nesty' },
      { role: 'Associate Head Coach', name: 'Kristin Walker' },
      { role: 'Assistant Coach', name: 'Mike Spiegler' },
    ],
  },
  asu: {
    staffUrl: 'https://thesundevils.com/sports/mens-swimming-diving/roster',
    staff: [
      { role: 'Head Coach', name: 'Herbie Behm' },
      { role: 'Head Diving Coach', name: 'Marc Briggs' },
    ],
  },
  texas: {
    staffUrl: 'https://texaslonghorns.com/sports/mens-swimming-and-diving/coaches',
    staff: [{ role: 'Director of Swimming & Diving / Head Coach', name: 'Bob Bowman' }],
  },
  georgia: {
    staffUrl: 'https://georgiadogs.com/sports/swimming-and-diving/coaches',
    staff: [
      { role: "Head Coach (Men's)", name: 'Neil Versfeld' },
      { role: 'Associate Head Coach', name: 'Mike Joyce' },
    ],
  },
  arizona: {
    staffUrl: 'https://arizonawildcats.com/sports/mens-swimming-and-diving/coaches',
    staff: [
      { role: 'Head Coach', name: 'Ben Loorz' },
      { role: 'Diving Coach', name: 'Dwight Dumais' },
    ],
  },
  tamu: {
    staffUrl: 'https://12thman.com/sports/swimdive/coaches',
    staff: [
      { role: 'Director of Swimming & Diving / Head Coach', name: 'Blaire Anderson' },
      { role: 'Associate Head Coach', name: 'Wes Foltz' },
      { role: 'Assistant Coach', name: 'Duncan Sherrard' },
      { role: 'Assistant Coach', name: 'Allyson Sweeney' },
      { role: 'Head Diving Coach', name: 'Jeff Bro' },
    ],
  },
}

// Lien vers le staff natation : page officielle si connue, sinon recherche Google
// (qui retombe toujours sur la page coachs à jour de la fac).
export function coachsStaffLink(u) {
  return (
    VERIFIED_COACHES[u.id]?.staffUrl ||
    'https://www.google.com/search?q=' +
      encodeURIComponent(`${u.name} men's swimming and diving coaches staff`)
  )
}
