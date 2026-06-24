// Profil de l'athlete. Temps en SECONDES, grand bassin (LCM / 50 m).
// (Modifiable : mets a jour tes temps quand tu progresses, le score se recalcule.)

export const profile = {
  name: 'Arthur',
  sport: 'Natation',
  specialty: 'Sprint nage libre & dos',
  nationality: 'Belge',
  birthDate: '2010-06-10',
  currentGrade: '5e secondaire (Belgique)',
  usEntryYear: 2028, // recruiting class : entree fac automne 2028
  major: 'Économie',
  club: 'Stage au CNM (Cercle des Nageurs de Marseille) — groupe sous-élites',
  englishTest: "Pas encore passé (bon niveau d'anglais)",
  gpaNote: 'À préciser (bulletin à venir)',

  // Temps records (LCM, en secondes)
  times: {
    '50FR': 27.46,
    '100FR': 57.8,
    '200FR': 131.44, // 2:11.44
    '50BK': 30.31,
    '100BK': 67.39, // 1:07.39
    '200BK': 147.49, // 2:27.49
  },

  // Priorites choisies (cf. questionnaire) -> ponderation du score de match.
  weights: {
    sport: 0.35, // niveau natation + force du programme
    academic: 0.3, // qualite eco + admission realiste
    lifestyle: 0.25, // soleil + ambiance sportive forte
    cost: 0.1, // coût / potentiel de bourse (priorite secondaire)
  },

  // Marge de progression : avec ~2 ans avant la rentree + entrainement au CNM,
  // un nageur de 16 ans gagne typiquement un palier. On l'utilise UNIQUEMENT
  // pour classer Realiste/Objectif/Ambitieux (le niveau "actuel" affiche dans
  // le profil reste, lui, base sur tes temps du moment).
  recruitHorizonBonus: 1,

  // Preferences lifestyle (1 = peu important, 5 = tres important)
  prefs: {
    sunshine: 5, // veut du soleil la plupart de l'annee
    athleticsCulture: 5, // veut un athletic department fort, bonne ambiance
    party: 1, // les fetes ne sont pas une priorite
    campusType: 'indifférent',
  },
}
