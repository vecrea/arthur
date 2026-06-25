// ---------------------------------------------------------------------------
// Contenu ANGLAIS des 28 facs curées (highlights / notes), + helper de
// localisation. Permet de basculer toute l'appli en anglais sans toucher aux
// composants : on remplace les champs FR par leur version EN au moment de
// l'affichage. Les fiches annuaire (curated:false) ont des notes templatées.
// ---------------------------------------------------------------------------

const TYPE_EN = { Publique: 'Public', Privée: 'Private' }
const SIZE_EN = { 'Très grande': 'Very large', Grande: 'Large', Moyenne: 'Medium', Petite: 'Small' }

export const UNI_EN = {
  florida: { scholarshipNote: 'Athletic scholarships possible (well-funded program)', swimNote: 'Top-10 NCAA program, very strong sprint & mid-distance.', highlights: ['Top US public university', 'Ranked economics', 'Sun + huge sports atmosphere'] },
  georgia: { scholarshipNote: 'Athletic scholarships possible', swimNote: 'Historically one of the best NCAA teams.', highlights: ['Terry College of Business', 'SEC football', 'Lively campus'] },
  texas: { scholarshipNote: 'Athletic scholarships (well-funded program)', swimNote: 'One of the most decorated programs in NCAA history.', highlights: ['Austin = great city', 'Elite econ/business', 'Sports are king'] },
  asu: { scholarshipNote: 'Athletic scholarships + academically accessible', swimNote: 'Elite sprint program (renowned coaching).', highlights: ['Near-constant sun ☀️', 'W. P. Carey (business)', 'Accessible admission'] },
  arizona: { scholarshipNote: 'Athletic scholarships possible', swimNote: 'Strong swimming tradition, solid D1 level.', highlights: ['Sunny desert', 'Big campus atmosphere', 'Accessible'] },
  auburn: { scholarshipNote: 'Athletic scholarships possible', swimNote: 'Historically an NCAA champion program.', highlights: ['Intense SEC culture', 'Mild climate', 'Strong campus spirit'] },
  tamu: { scholarshipNote: 'Athletic scholarships possible', swimNote: 'Solid SEC program, good for mid-distance.', highlights: ['Huge sports culture', 'Mays Business', 'Texas sun'] },
  alabama: { scholarshipNote: 'Athletic scholarships + generous international aid', swimNote: 'Good, improving SEC program.', highlights: ['Legendary football atmosphere', 'International aid', 'Mild climate'] },
  lsu: { scholarshipNote: 'Athletic scholarships possible', swimNote: 'Developing SEC D1 program.', highlights: ['Electric sports atmosphere', 'Hot and sunny', 'Reasonable cost'] },
  tennessee: { scholarshipNote: 'Athletic scholarships possible', swimNote: 'Solid SEC program, good sprinters.', highlights: ['Big SEC atmosphere', 'Dynamic campus', 'Nature all around'] },
  fsu: { scholarshipNote: 'Athletic scholarships possible', swimNote: 'Decent ACC program, ACC atmosphere.', highlights: ['Sunny Florida', 'Moderate cost', 'ACC sports'] },
  gatech: { scholarshipNote: 'Athletic scholarships possible (academically demanding)', swimNote: 'ACC program, high academic demands.', highlights: ['Highly regarded degree', 'Atlanta (big city)', 'Quantitative economics'] },
  usc: { scholarshipNote: 'Athletic scholarships possible, but high cost', swimNote: 'Elite program, but spots are highly coveted.', highlights: ['Los Angeles + sun', 'Marshall (business)', 'Athletic prestige'] },
  stanford: { scholarshipNote: 'Huge aid if admitted, but extremely selective', swimNote: 'One of the best teams in the world — very ambitious target.', highlights: ['World elite', 'Top-tier economics', 'Mild climate'] },
  cal: { scholarshipNote: 'Athletic scholarships possible, very selective admission', swimNote: 'NCAA champion program — ambitious target.', highlights: ['World-ranked economics', 'San Francisco Bay', 'Elite swimming'] },
  smu: { scholarshipNote: 'Athletic scholarships + strong merit aid', swimNote: 'Swimming tradition, welcoming to international athletes.', highlights: ['Cox School of Business', 'Sunny Dallas', 'Polished campus'] },
  hawaii: { scholarshipNote: 'Athletic scholarships possible', swimNote: 'D1 program in a unique tropical setting.', highlights: ['Year-round sun 🌴', 'Moderate cost', 'Incredible setting'] },
  ucsd: { scholarshipNote: 'Athletic scholarships possible (recently moved to D1)', swimNote: 'Program on the rise since moving to D1.', highlights: ['Sunny seaside', 'Solid economics', 'Renowned academics'] },
  ucsb: { scholarshipNote: 'Athletic scholarships possible', swimNote: 'Good Big West program, beachside setting.', highlights: ['Beach + sun', 'Well-regarded economics', 'Pleasant student life'] },
  gcu: { scholarshipNote: 'Athletic scholarships + contained cost', swimNote: 'Mid-major D1 program, easier access.', highlights: ['Arizona sun', 'Affordable cost', 'Accessible D1'] },
  uiw: { scholarshipNote: 'Athletic scholarships + merit aid', swimNote: 'Accessible D1 program, good stepping stone.', highlights: ['Accessible D1', 'Sunny San Antonio', 'Small campus'] },
  tampa: { scholarshipNote: 'D2 athletic scholarships (often partial)', swimNote: 'One of the best D2 swim programs, multiple titles.', highlights: ['Florida + beaches', 'Title-winning D2 swimming', 'Strong in business'] },
  nova: { scholarshipNote: 'D2 athletic scholarships (partial)', swimNote: 'Solid D2 program in South Florida.', highlights: ['Florida sun', 'Moderate cost', 'Tropical setting'] },
  lynn: { scholarshipNote: 'D2 athletic scholarships, very welcoming to international athletes', swimNote: 'D2 program with a high share of international athletes.', highlights: ['Very international 🌍', 'Sunny Boca Raton', 'Small & well-supported'] },
  emory: { scholarshipNote: 'No athletic scholarship (D3) but strong merit/need-based aid', swimNote: 'D3 benchmark (often national champion).', highlights: ['Elite academics', 'Dominant D3 swimming', 'Highly regarded degree'] },
  cms: { scholarshipNote: 'No athletic scholarship (D3), merit aid possible', swimNote: 'Good SCIAC D3 program, California setting.', highlights: ['California sun', 'Top academics', 'Small class sizes'] },
  trinity: { scholarshipNote: 'No athletic scholarship (D3) but strong merit aid', swimNote: 'Competitive D3 program, excellent coaching.', highlights: ['Generous merit aid', 'Sunny Texas', 'Polished econ/business'] },
  chapman: { scholarshipNote: 'No athletic scholarship (D3), merit aid possible', swimNote: 'D3 program in sunny Southern California.', highlights: ['Orange County ☀️', 'Modern campus', 'Close to LA'] },
}

// Renvoie une copie de la fac avec les champs traduits si lang === 'en'.
export function localizeUni(u, lang) {
  if (lang !== 'en') return u
  const out = { ...u }
  if (TYPE_EN[u.type]) out.type = TYPE_EN[u.type]
  if (SIZE_EN[u.sizeLabel]) out.sizeLabel = SIZE_EN[u.sizeLabel]
  const en = UNI_EN[u.id]
  if (en) {
    out.highlights = en.highlights
    out.swimNote = en.swimNote
    out.scholarshipNote = en.scholarshipNote
  } else if (u.curated === false) {
    out.scholarshipNote =
      u.division === 'D3' ? 'No athletic scholarship (D3); merit aid possible' : 'Athletic scholarships possible (to be confirmed)'
    out.swimNote = 'Directory entry — basic info, verify via the links (staff, site).'
  }
  return out
}
