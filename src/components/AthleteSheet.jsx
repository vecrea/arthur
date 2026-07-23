import { useEffect, useState } from 'react'
import { EVENTS, lcmToScy, formatTime } from '../lib/convert.js'
import { loadProfileExtras, saveProfileExtras } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

const L = {
  en: {
    classOf: 'Class of', swimmer: 'Swimmer', from: 'from',
    contact: 'Contact', academics: 'Academics', school: 'School',
    grade: 'Current year', major: 'Intended major', gpa: 'GPA / average',
    sat: 'SAT / ACT', english: 'English test', about: 'About me',
    swimming: 'Swimming', clubs: 'Club(s)', coach: 'Coach / reference',
    specialty: 'Specialty', camp: 'Training camp', bestTimes: 'Best times', course: 'long course (50m) → yards (SCY)',
    event: 'Event', lcm: 'LCM (50m)', scy: 'Yards (SCY)', video: 'Race video',
    footer: 'Recruiting profile', notSet: '—',
  },
  fr: {
    classOf: 'Promo', swimmer: 'Nageur', from: 'de',
    contact: 'Contact', academics: 'Académique', school: 'Établissement',
    grade: 'Classe actuelle', major: 'Filière visée', gpa: 'Moyenne / GPA',
    sat: 'SAT / ACT', english: "Test d'anglais", about: 'À propos',
    swimming: 'Natation', clubs: 'Club(s)', coach: 'Coach / référence',
    specialty: 'Spécialité', camp: 'Stage', bestTimes: 'Meilleurs temps', course: 'grand bassin (50m) → yards (SCY)',
    event: 'Épreuve', lcm: 'Bassin 50m', scy: 'Yards (SCY)', video: 'Vidéo de course',
    footer: 'Fiche de recrutement', notSet: '—',
  },
}

const DEFAULT_BIO_EN =
  "16-year-old Belgian swimmer specializing in sprint freestyle and backstroke. National-level competitor (Belgian Championships), training at LSC under coach Mathieu Huberty. Recently completed a training camp at the Cercle des Nageurs de Marseille (sub-elite group) under coach Brian. Targeting Fall 2028 enrollment with a major in Economics — motivated, coachable, and committed to combining academic and athletic excellence in the US."

const DEFAULT_BIO_FR =
  "Nageur belge de 16 ans, spécialisé en sprint (nage libre & dos). Compétiteur de niveau national (Championnats de Belgique), je m'entraîne au LSC avec le coach Mathieu Huberty. J'ai récemment participé à un stage au Cercle des Nageurs de Marseille (groupe sous-élites) avec le coach Brian. Objectif : intégrer une université américaine (NCAA) à la rentrée 2028 en filière Économie — motivé, à l'écoute et déterminé à allier excellence scolaire et sportive aux États-Unis."

const FIELDS = [
  { key: 'email', label: { en: 'Email', fr: 'Email' }, ph: { en: 'arthur@email.com', fr: 'arthur@email.com' } },
  { key: 'phone', label: { en: 'Phone', fr: 'Téléphone' }, ph: { en: '+32 ...', fr: '+32 ...' } },
  { key: 'city', label: { en: 'City (Belgium)', fr: 'Ville (Belgique)' }, ph: { en: 'Brussels', fr: 'Bruxelles' } },
  { key: 'homeClub', label: { en: 'Home club', fr: 'Club principal' }, ph: { en: 'Your Belgian club', fr: 'Ton club belge' } },
  { key: 'coachName', label: { en: 'Coach', fr: 'Coach' }, ph: { en: 'Coach name', fr: 'Nom du coach' } },
  { key: 'average', label: { en: 'GPA / average', fr: 'Moyenne' }, ph: { en: 'e.g. 15/20', fr: 'ex. 15/20' } },
  { key: 'sat', label: { en: 'SAT / ACT', fr: 'SAT / ACT' }, ph: { en: 'coming soon', fr: 'à venir' } },
  { key: 'english', label: { en: 'English test', fr: "Test d'anglais" }, ph: { en: 'TOEFL/Duolingo coming', fr: 'TOEFL/Duolingo à venir' } },
  { key: 'videoUrl', label: { en: 'Race video (URL)', fr: 'Vidéo (lien)' }, ph: { en: 'https://youtube.com/...', fr: 'https://youtube.com/...' } },
]

export default function AthleteSheet({ profile }) {
  const { lang, t: tr } = useLang()
  const [extras, setExtras] = useState(() => {
    const s = loadProfileExtras()
    return {
      email: '', phone: '', city: '', homeClub: 'LSC', coachName: 'Mathieu Huberty',
      average: '', sat: '', english: '', videoUrl: '',
      ...s,
      // Message « à propos » distinct par langue (migration de l'ancien champ `bio` -> version anglaise).
      bioFr: s.bioFr ?? DEFAULT_BIO_FR,
      bioEn: s.bioEn ?? s.bio ?? DEFAULT_BIO_EN,
    }
  })

  useEffect(() => saveProfileExtras(extras), [extras])
  const set = (k, v) => setExtras((e) => ({ ...e, [k]: v }))
  const t = L[lang]
  const v = (x) => (x && String(x).trim() ? x : t.notSet)

  const times = EVENTS.map((e) => {
    const lcm = profile.times?.[e.key]
    if (lcm == null) return null
    return { ...e, lcm, scy: lcmToScy(lcm, e.distance) }
  }).filter(Boolean)

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden print-sheet mx-auto max-w-3xl">
        {/* Barre d'actions (non imprimee) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <h2 className="font-display text-xl font-extrabold text-heading">{tr('Ta fiche athlète', 'Your athlete sheet')}</h2>
            <p className="text-sm text-secondary">
              {tr(
                'À envoyer aux coachs US. Remplis les champs, puis exporte en PDF. (Suit la langue du site — passe en EN pour les coachs.)',
                'To send to US coaches. Fill in the fields, then export to PDF. (Follows the site language — switch to EN for coaches.)',
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-full bg-flag-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-flag-600"
            >
              {tr('Exporter / Imprimer (PDF)', 'Export / Print (PDF)')}
            </button>
          </div>
        </div>

        {/* Panneau d'edition (non imprime) */}
        <div className="no-print border-t border-hair p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-tertiary">{tr('Compléter ta fiche', 'Complete your sheet')}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="text-xs font-medium text-secondary">{f.label[lang]}</span>
                <input
                  value={extras[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.ph[lang]}
                  className="field mt-1"
                />
              </label>
            ))}
          </div>
          <label className="mt-3 block">
            <span className="text-xs font-medium text-secondary">{t.about} — {tr('version française', 'English version')}</span>
            <textarea
              value={lang === 'en' ? extras.bioEn : extras.bioFr}
              onChange={(e) => set(lang === 'en' ? 'bioEn' : 'bioFr', e.target.value)}
              rows={3}
              className="field mt-1"
            />
          </label>
        </div>

        {/* ---------- LA FICHE (bandeau navy imprimable) ---------- */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6 text-white print:bg-navy-900">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-black leading-none">{profile.name}</h1>
              <p className="mt-1 text-white">
                {t.classOf} {profile.usEntryYear} · {t.swimmer} · {t.from} {v(extras.city)}, Belgium
              </p>
            </div>
            <div className="text-right text-sm text-white">
              <div>{v(extras.email)}</div>
              <div>{v(extras.phone)}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {/* Academics + about */}
          <section>
            <h3 className="mb-2 font-display text-sm font-extrabold uppercase tracking-wide text-flag-600 dark:text-flag-400">{t.academics}</h3>
            <dl className="space-y-1 text-sm">
              <Row k={t.school} val={lang === 'en' ? profile.currentGradeEn : profile.currentGrade} />
              <Row k={t.major} val={lang === 'en' ? profile.majorEn : profile.major} />
              <Row k={t.gpa} val={v(extras.average)} />
              <Row k={t.sat} val={v(extras.sat)} />
              <Row k={t.english} val={extras.english?.trim() ? extras.english : lang === 'en' ? profile.englishTestEn : profile.englishTest} />
            </dl>

            <h3 className="mb-2 mt-5 font-display text-sm font-extrabold uppercase tracking-wide text-flag-600 dark:text-flag-400">{t.about}</h3>
            <p className="text-sm leading-relaxed text-primary">{lang === 'en' ? extras.bioEn : extras.bioFr}</p>
          </section>

          {/* Swimming */}
          <section>
            <h3 className="mb-2 font-display text-sm font-extrabold uppercase tracking-wide text-accent">{t.swimming}</h3>
            <dl className="space-y-1 text-sm">
              <Row k={t.specialty} val={lang === 'en' ? profile.specialtyEn : profile.specialty} />
              <Row k={t.clubs} val={v(extras.homeClub)} />
              <Row k={t.coach} val={v(extras.coachName)} />
              <Row k={t.camp} val={lang === 'en' ? profile.trainingCampEn : profile.trainingCampFr} />
            </dl>

            <h3 className="mb-1 mt-5 font-display text-sm font-extrabold uppercase tracking-wide text-accent">{t.bestTimes}</h3>
            <p className="mb-2 text-[11px] text-tertiary">{t.course}</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-tertiary">
                  <th className="py-1 font-semibold">{t.event}</th>
                  <th className="py-1 font-semibold">{t.lcm}</th>
                  <th className="py-1 font-semibold">{t.scy}</th>
                </tr>
              </thead>
              <tbody>
                {times.map((e) => (
                  <tr key={e.key} className="border-t border-hair">
                    <td className="py-1 font-semibold text-heading">{lang === 'en' ? e.labelEn : e.label}</td>
                    <td className="py-1 tabular-nums text-primary">{formatTime(e.lcm)}</td>
                    <td className="py-1 tabular-nums text-secondary">≈ {formatTime(e.scy)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-hair px-6 py-3 text-xs text-tertiary">
          <span>{t.video}: {v(extras.videoUrl)}</span>
          <span>Road to NCAA · {t.footer}</span>
        </div>
      </div>

      <p className="no-print text-center text-xs text-tertiary">
        {tr(
          "Astuce : « Exporter » ouvre l'impression — choisis « Enregistrer en PDF » comme destination. Les temps en yards sont indicatifs (à confirmer).",
          'Tip: “Export” opens the print dialog — choose “Save as PDF” as the destination. Yards times are indicative (to confirm).',
        )}
      </p>
    </div>
  )
}

function Row({ k, val }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-tertiary">{k}</dt>
      <dd className="text-right font-medium text-heading">{val}</dd>
    </div>
  )
}
