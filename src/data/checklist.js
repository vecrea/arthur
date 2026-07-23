// ---------------------------------------------------------------------------
// Checklist des démarches pour un nageur international (belge) visant une
// entrée en fac US à l'automne 2028 (≈ recruiting class 2028).
// Faits vérifiés (juin 2026) ; ⚠️ dates/frais changent : confirme via les liens.
// tag 'D1/D2' = ne concerne pas la Division 3. Bilingue (FR + EN).
// ---------------------------------------------------------------------------

export const CHECKLIST_AS_OF = 'juin 2026'
export const CHECKLIST_AS_OF_EN = 'June 2026'

// Frise chronologique : grandes étapes datées jusqu'à la rentrée 2028,
// calées sur le calendrier NCAA / visa. `iso` sert à situer « tu es ici ».
export const ROADMAP = [
  { iso: '2026-06-15', date: '15 juin 2026', dateEn: 'June 15, 2026', emoji: '📣', title: 'Ouverture des contacts coachs (D1)', titleEn: 'D1 coach contact window opens', detail: 'Les coachs D1 peuvent te contacter directement. Toi, tu peux les contacter quand tu veux — lance tes premiers emails !', detailEn: 'D1 coaches can contact you directly. You can reach out whenever — start your first emails!' },
  { iso: '2026-09-01', date: 'Automne 2026', dateEn: 'Fall 2026', emoji: '🗂️', title: '5e secondaire — profils en ligne', titleEn: '5th secondary year — profiles online', detail: 'Profil NCSA/SwimCloud à jour, fiche athlète prête, compte NCAA Eligibility Center créé.', detailEn: 'NCSA/SwimCloud profile up to date, athlete sheet ready, NCAA Eligibility Center account created.' },
  { iso: '2027-01-01', date: 'Hiver 2026-27', dateEn: 'Winter 2026-27', emoji: '🗣️', title: 'Tests d’anglais', titleEn: 'English tests', detail: 'Passe le TOEFL / IELTS / Duolingo (exigé par l’admission). Vise tôt pour pouvoir repasser si besoin.', detailEn: 'Take the TOEFL / IELTS / Duolingo (required by admissions). Aim early so you can retake if needed.' },
  { iso: '2027-06-01', date: 'Été 2027', dateEn: 'Summer 2027', emoji: '🎯', title: 'Shortlist resserrée + relances', titleEn: 'Tighter shortlist + follow-ups', detail: 'Cible 8 à 12 facs réalistes/objectifs et relance les coachs avec tes nouveaux temps.', detailEn: 'Target 8 to 12 realistic/target schools and follow up with coaches with your new times.' },
  { iso: '2027-08-01', date: '1er août 2027', dateEn: 'August 1, 2027', emoji: '🏫', title: 'Visites de campus possibles', titleEn: 'Campus visits allowed', detail: 'Visites officielles et non officielles autorisées dès le 1er août avant ta dernière année.', detailEn: 'Official and unofficial visits allowed from August 1 before your final year.' },
  { iso: '2027-10-01', date: 'Automne 2027', dateEn: 'Fall 2027', emoji: '📝', title: '6e secondaire — candidatures', titleEn: 'Final year — applications', detail: 'Dépose tes candidatures (deadlines automne/hiver). SAT/ACT si utile pour l’admission et les bourses au mérite.', detailEn: 'Submit your applications (fall/winter deadlines). SAT/ACT if useful for admissions and merit scholarships.' },
  { iso: '2028-02-01', date: 'Hiver 2027-28', dateEn: 'Winter 2027-28', emoji: '💶', title: 'Offres & bourses', titleEn: 'Offers & scholarships', detail: 'Compare les offres : bourses sportives (souvent partielles) en D1/D2, aides au mérite en D3. Décide.', detailEn: 'Compare offers: athletic scholarships (often partial) in D1/D2, merit aid in D3. Decide.' },
  { iso: '2028-05-01', date: 'Printemps 2028', dateEn: 'Spring 2028', emoji: '🎓', title: 'Diplôme + dossier NCAA final', titleEn: 'Diploma + final NCAA file', detail: 'Relevés et diplôme finaux au Eligibility Center, certification d’amateurisme. Réception de ton I-20.', detailEn: 'Final transcripts and diploma to the Eligibility Center, amateurism certification. Receive your I-20.' },
  { iso: '2028-07-01', date: 'Été 2028', dateEn: 'Summer 2028', emoji: '🛂', title: 'Visa F-1', titleEn: 'F-1 visa', detail: 'Paie le SEVIS I-901 (~350 $), remplis le DS-160, entretien visa à l’ambassade US (Bruxelles).', detailEn: 'Pay the SEVIS I-901 (~$350), fill out the DS-160, visa interview at the US embassy (Brussels).' },
  { iso: '2028-08-15', date: 'Automne 2028', dateEn: 'Fall 2028', emoji: '🇺🇸', title: 'Rentrée & premiers entraînements NCAA', titleEn: 'Move-in & first NCAA practices', detail: 'Arrivée (jusqu’à 30 jours avant le début), installation, et c’est parti — Road to D1 accomplie !', detailEn: 'Arrival (up to 30 days before the start), settling in, and you’re off — Road to D1 complete!' },
]

export const CHECKLIST = [
  {
    title: '1. Fondations — maintenant (2026)',
    titleEn: '1. Foundations — now (2026)',
    items: [
      { id: 'profile-times', title: 'Profil & temps à jour', titleEn: 'Profile & times up to date', detail: 'Garde tes meilleurs temps à jour et crée un profil de recrutement.', detailEn: 'Keep your best times up to date and create a recruiting profile.', link: { label: 'SwimCloud RecruitMe', url: 'https://www.swimcloud.com/swimmers/recruitme/' } },
      { id: 'ncsa', title: 'Créer ton profil NCSA', titleEn: 'Create your NCSA profile', detail: 'Inscris-toi pour être visible et suivre le recrutement.', detailEn: 'Sign up to be visible and track recruiting.', link: { label: 'NCSA', url: 'https://www.ncsasports.org' } },
      { id: 'shortlist', title: 'Shortlist + fiche athlète', titleEn: 'Shortlist + athlete sheet', detail: 'Mets tes facs en favoris et complète l’onglet « Ma fiche » (à envoyer aux coachs).', detailEn: 'Favorite your schools and complete the “My sheet” tab (to send to coaches).' },
      { id: 'eligibility-account', title: 'Créer ton compte NCAA Eligibility Center', titleEn: 'Create your NCAA Eligibility Center account', detail: 'Obligatoire pour D1/D2 (pas la D3). Compte certification ≈ 160 $ (international) ; sinon « Profile Page » gratuite si ta division n’est pas décidée.', detailEn: 'Required for D1/D2 (not D3). Certification account ≈ $160 (international); otherwise a free “Profile Page” if your division isn’t decided yet.', tag: 'D1/D2', link: { label: 'NCAA Eligibility Center', url: 'https://www.eligibilitycenter.org' } },
      { id: 'amateurism', title: 'Comprendre l’amateurisme', titleEn: 'Understand amateurism', detail: 'Déclare honnêtement tous tes clubs/compétitions (clé pour les Européens : primes, nager avec des pros…).', detailEn: 'Honestly declare all your clubs/competitions (key for Europeans: prize money, swimming with pros…).', tag: 'D1/D2' },
    ],
  },
  {
    title: '2. Préparer & contacter — dès ~juin 2026 (5e secondaire)',
    titleEn: '2. Prepare & reach out — from ~June 2026 (5th secondary year)',
    items: [
      { id: 'contact-window', title: 'Fenêtre de contact NCAA (D1)', titleEn: 'NCAA contact window (D1)', detail: 'Les coachs D1 peuvent te contacter directement à partir du 15 juin après ta 2e année de lycée (~15 juin 2026 pour la promo 2028). Mais TOI, tu peux les contacter quand tu veux.', detailEn: 'D1 coaches can contact you directly from June 15 after your sophomore year (~June 15, 2026 for the class of 2028). But YOU can contact them whenever you want.', tag: 'D1', link: { label: 'Calendrier recrutement (NCSA)', labelEn: 'Recruiting calendar (NCSA)', url: 'https://www.ncsasports.org/mens-swimming/recruiting-rules-calendar' } },
      { id: 'email-coaches', title: 'Contacter les coachs', titleEn: 'Contact the coaches', detail: 'Email perso + ta fiche + tes temps + une vidéo. Suis chaque échange dans l’onglet « Coachs ».', detailEn: 'Personal email + your sheet + your times + a video. Track each exchange in the “Coaches” tab.' },
      { id: 'questionnaires', title: 'Remplir les questionnaires recrue', titleEn: 'Fill out recruit questionnaires', detail: 'Sur le site de chaque fac (bouton « Coachs natation » dans les cartes).', detailEn: 'On each school’s website (the “Swim coaches” button on the cards).' },
      { id: 'english-test', title: 'Test d’anglais', titleEn: 'English test', detail: 'TOEFL / IELTS / Duolingo — exigé par l’admission (pas la NCAA). Nouveau barème TOEFL dès janvier 2026.', detailEn: 'TOEFL / IELTS / Duolingo — required by admissions (not the NCAA). New TOEFL scoring from January 2026.', link: { label: 'Duolingo English Test', url: 'https://englishtest.duolingo.com' } },
      { id: 'sat', title: 'SAT / ACT (optionnel mais utile)', titleEn: 'SAT / ACT (optional but useful)', detail: 'Pas requis par la NCAA (test-optional depuis 2023), mais souvent utile pour l’admission et les bourses au mérite.', detailEn: 'Not required by the NCAA (test-optional since 2023), but often useful for admissions and merit scholarships.', link: { label: 'SAT (College Board)', url: 'https://satsuite.collegeboard.org/sat' } },
      { id: 'transcripts', title: 'Envoyer tes relevés au Eligibility Center', titleEn: 'Send your transcripts to the Eligibility Center', detail: 'Relevés depuis la 9e année, en langue d’origine (FR/NL) + traduction anglaise certifiée.', detailEn: 'Transcripts from 9th grade on, in the original language (FR/NL) + certified English translation.', tag: 'D1/D2' },
    ],
  },
  {
    title: '3. Finaliser & candidater — 2027–28 (6e secondaire)',
    titleEn: '3. Finalize & apply — 2027–28 (final secondary year)',
    items: [
      { id: 'visits', title: 'Visites de campus', titleEn: 'Campus visits', detail: 'Visites (officielles/non officielles) possibles dès le 1er août avant ta dernière année.', detailEn: 'Visits (official/unofficial) possible from August 1 before your final year.' },
      { id: 'apply', title: 'Candidater aux universités', titleEn: 'Apply to universities', detail: 'Respecte les deadlines (souvent automne/hiver de ta dernière année).', detailEn: 'Meet the deadlines (often fall/winter of your final year).' },
      { id: 'offers', title: 'Offres & bourses', titleEn: 'Offers & scholarships', detail: 'Compare : D1/D2 = bourses sportives (souvent partielles en natation) ; D3 = aides au mérite.', detailEn: 'Compare: D1/D2 = athletic scholarships (often partial in swimming); D3 = merit aid.' },
      { id: 'final-eligibility', title: 'Finaliser le dossier NCAA', titleEn: 'Finalize your NCAA file', detail: 'Relevés/diplôme finaux + certification d’amateurisme finale après le diplôme.', detailEn: 'Final transcripts/diploma + final amateurism certification after graduation.', tag: 'D1/D2', link: { label: 'NCAA Eligibility Center', url: 'https://www.eligibilitycenter.org' } },
    ],
  },
  {
    title: '4. Après admission — 2028 : visa F-1',
    titleEn: '4. After admission — 2028: F-1 visa',
    items: [
      { id: 'i20', title: 'Recevoir ton I-20', titleEn: 'Receive your I-20', detail: 'Émis par l’université (établissement SEVP) une fois admis.', detailEn: 'Issued by the university (SEVP-certified school) once admitted.', link: { label: 'Study in the States (I-20)', url: 'https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20' } },
      { id: 'sevis', title: 'Payer le SEVIS I-901 (≈ 350 $)', titleEn: 'Pay the SEVIS I-901 (≈ $350)', detail: 'À régler avant l’entretien visa (prévois quelques jours de traitement).', detailEn: 'Pay before the visa interview (allow a few days of processing).', link: { label: 'Paiement SEVIS I-901', labelEn: 'SEVIS I-901 payment', url: 'https://www.fmjfee.com' } },
      { id: 'ds160', title: 'DS-160 + frais de visa', titleEn: 'DS-160 + visa fee', detail: 'Formulaire de demande de visa non-immigrant + paiement des frais.', detailEn: 'Nonimmigrant visa application form + fee payment.' },
      { id: 'visa-interview', title: 'Entretien visa F-1', titleEn: 'F-1 visa interview', detail: 'À l’ambassade US (Bruxelles). Apporte I-20, passeport, DS-160, preuve SEVIS, justificatifs financiers.', detailEn: 'At the US embassy (Brussels). Bring I-20, passport, DS-160, SEVIS receipt, financial documents.', link: { label: 'Visa étudiant (Dept. of State)', labelEn: 'Student visa (Dept. of State)', url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html' } },
      { id: 'arrival', title: 'Logistique & arrivée', titleEn: 'Logistics & arrival', detail: 'Entrée aux US possible jusqu’à 30 jours avant le début. Logement, assurance, vol, équipement.', detailEn: 'US entry allowed up to 30 days before the start. Housing, insurance, flight, gear.' },
    ],
  },
]
