import { loadProfileExtras } from '../../lib/storage.js'
import { useLang } from '../../lib/i18n.jsx'
import CoachMessageForm from './CoachMessageForm.jsx'

// FAQ recrutement pré-remplie (lecture seule) + « poser une autre question ».
export default function CoachFaq({ profile }) {
  const { t, lang } = useLang()
  const x = loadProfileExtras()
  const dash = t('à préciser', 'to be confirmed')

  const items = [
    { q: t('Année de diplôme / rentrée', 'Graduation / enrollment'), a: `${t('Rentrée automne', 'Fall')} ${profile.usEntryYear} (${t('promo', 'class of')} ${profile.usEntryYear})` },
    { q: t('Filière visée', 'Intended major'), a: lang === 'en' ? profile.majorEn : profile.major },
    { q: t('Niveau scolaire actuel', 'Current school year'), a: lang === 'en' ? profile.currentGradeEn : profile.currentGrade },
    { q: t('Moyenne / GPA', 'GPA / average'), a: x.average || profile.gpaNote || dash },
    { q: t("Test d'anglais", 'English test'), a: x.english || (lang === 'en' ? profile.englishTestEn : profile.englishTest) || dash },
    { q: t('SAT / ACT', 'SAT / ACT'), a: x.sat || dash },
    { q: t('Club & coach', 'Club & coach'), a: `${x.homeClub || profile.homeClub} — ${x.coachName || profile.coach}` },
    { q: t('Éligibilité NCAA', 'NCAA eligibility'), a: x.ncaaEligibility || t('Dossier NCAA Eligibility Center en cours.', 'NCAA Eligibility Center registration in progress.') },
    { q: t('Visa', 'Visa'), a: x.visaStatus || t('Visa étudiant F-1 prévu (I-20 à réception de l’offre).', 'F-1 student visa planned (I-20 upon offer).') },
    { q: t('Nationalité', 'Nationality'), a: profile.nationality },
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl surface-2 border border-hair p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-tertiary">{it.q}</div>
            <div className="mt-0.5 font-semibold text-heading">{it.a}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-hair pt-4">
        <p className="mb-3 text-sm font-semibold text-heading">{t('Une autre question ?', 'Another question?')}</p>
        <CoachMessageForm
          type="question"
          minimal
          messagePlaceholder={t('Ta question à Arthur…', 'Your question for Arthur…')}
          submitLabel={t('Envoyer la question', 'Send question')}
        />
      </div>
    </div>
  )
}
