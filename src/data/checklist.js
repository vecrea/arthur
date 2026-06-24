// ---------------------------------------------------------------------------
// Checklist des démarches pour un nageur international (belge) visant une
// entrée en fac US à l'automne 2028 (≈ recruiting class 2028).
// Faits vérifiés (juin 2026) ; ⚠️ dates/frais changent : confirme via les liens.
// tag 'D1/D2' = ne concerne pas la Division 3.
// ---------------------------------------------------------------------------

export const CHECKLIST_AS_OF = 'juin 2026'

export const CHECKLIST = [
  {
    title: '1. Fondations — maintenant (2026)',
    items: [
      { id: 'profile-times', title: 'Profil & temps à jour', detail: 'Garde tes meilleurs temps à jour et crée un profil de recrutement.', link: { label: 'SwimCloud RecruitMe', url: 'https://www.swimcloud.com/swimmers/recruitme/' } },
      { id: 'ncsa', title: 'Créer ton profil NCSA', detail: 'Inscris-toi pour être visible et suivre le recrutement.', link: { label: 'NCSA', url: 'https://www.ncsasports.org' } },
      { id: 'shortlist', title: 'Shortlist + fiche athlète', detail: 'Mets tes facs en favoris et complète l’onglet « Ma fiche » (à envoyer aux coachs).' },
      { id: 'eligibility-account', title: 'Créer ton compte NCAA Eligibility Center', detail: 'Obligatoire pour D1/D2 (pas la D3). Compte certification ≈ 160 $ (international) ; sinon « Profile Page » gratuite si ta division n’est pas décidée.', tag: 'D1/D2', link: { label: 'NCAA Eligibility Center', url: 'https://www.eligibilitycenter.org' } },
      { id: 'amateurism', title: 'Comprendre l’amateurisme', detail: 'Déclare honnêtement tous tes clubs/compétitions (clé pour les Européens : primes, nager avec des pros…).', tag: 'D1/D2' },
    ],
  },
  {
    title: '2. Préparer & contacter — dès ~juin 2026 (5e secondaire)',
    items: [
      { id: 'contact-window', title: 'Fenêtre de contact NCAA (D1)', detail: 'Les coachs D1 peuvent te contacter directement à partir du 15 juin après ta 2e année de lycée (~15 juin 2026 pour la promo 2028). Mais TOI, tu peux les contacter quand tu veux.', tag: 'D1', link: { label: 'Calendrier recrutement (NCSA)', url: 'https://www.ncsasports.org/mens-swimming/recruiting-rules-calendar' } },
      { id: 'email-coaches', title: 'Contacter les coachs', detail: 'Email perso + ta fiche + tes temps + une vidéo. Suis chaque échange dans l’onglet « Coachs ».' },
      { id: 'questionnaires', title: 'Remplir les questionnaires recrue', detail: 'Sur le site de chaque fac (bouton « Coachs natation » dans les cartes).' },
      { id: 'english-test', title: 'Test d’anglais', detail: 'TOEFL / IELTS / Duolingo — exigé par l’admission (pas la NCAA). Nouveau barème TOEFL dès janvier 2026.', link: { label: 'Duolingo English Test', url: 'https://englishtest.duolingo.com' } },
      { id: 'sat', title: 'SAT / ACT (optionnel mais utile)', detail: 'Pas requis par la NCAA (test-optional depuis 2023), mais souvent utile pour l’admission et les bourses au mérite.', link: { label: 'SAT (College Board)', url: 'https://satsuite.collegeboard.org/sat' } },
      { id: 'transcripts', title: 'Envoyer tes relevés au Eligibility Center', detail: 'Relevés depuis la 9e année, en langue d’origine (FR/NL) + traduction anglaise certifiée.', tag: 'D1/D2' },
    ],
  },
  {
    title: '3. Finaliser & candidater — 2027–28 (6e secondaire)',
    items: [
      { id: 'visits', title: 'Visites de campus', detail: 'Visites (officielles/non officielles) possibles dès le 1er août avant ta dernière année.' },
      { id: 'apply', title: 'Candidater aux universités', detail: 'Respecte les deadlines (souvent automne/hiver de ta dernière année).' },
      { id: 'offers', title: 'Offres & bourses', detail: 'Compare : D1/D2 = bourses sportives (souvent partielles en natation) ; D3 = aides au mérite.' },
      { id: 'final-eligibility', title: 'Finaliser le dossier NCAA', detail: 'Relevés/diplôme finaux + certification d’amateurisme finale après le diplôme.', tag: 'D1/D2', link: { label: 'NCAA Eligibility Center', url: 'https://www.eligibilitycenter.org' } },
    ],
  },
  {
    title: '4. Après admission — 2028 : visa F-1',
    items: [
      { id: 'i20', title: 'Recevoir ton I-20', detail: 'Émis par l’université (établissement SEVP) une fois admis.', link: { label: 'Study in the States (I-20)', url: 'https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20' } },
      { id: 'sevis', title: 'Payer le SEVIS I-901 (≈ 350 $)', detail: 'À régler avant l’entretien visa (prévois quelques jours de traitement).', link: { label: 'Paiement SEVIS I-901', url: 'https://www.fmjfee.com' } },
      { id: 'ds160', title: 'DS-160 + frais de visa', detail: 'Formulaire de demande de visa non-immigrant + paiement des frais.' },
      { id: 'visa-interview', title: 'Entretien visa F-1', detail: 'À l’ambassade US (Bruxelles). Apporte I-20, passeport, DS-160, preuve SEVIS, justificatifs financiers.', link: { label: 'Visa étudiant (Dept. of State)', url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html' } },
      { id: 'arrival', title: 'Logistique & arrivée', detail: 'Entrée aux US possible jusqu’à 30 jours avant le début. Logement, assurance, vol, équipement.' },
    ],
  },
]
