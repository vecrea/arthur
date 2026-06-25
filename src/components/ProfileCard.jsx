import { EVENTS, athleteLevel, lcmToScy, scyLevel, formatTime, LEVELS } from '../lib/convert.js'
import { useLang } from '../lib/i18n.jsx'

function ageFrom(birthDate) {
  const b = new Date(birthDate)
  const now = new Date()
  let a = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--
  return a
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 font-semibold text-navy-900">{value}</div>
    </div>
  )
}

export default function ProfileCard({ profile }) {
  const { t } = useLang()
  const { level, byEvent } = athleteLevel(profile)
  const lvl = LEVELS[level]
  const age = ageFrom(profile.birthDate)

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-black">{profile.name}</h2>
              <p className="text-white/90">{t(profile.sport, 'Swimming')} · {t(profile.specialty, profile.specialtyEn)}</p>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wide text-white/80">{t('Niveau actuel (converti)', 'Current level (converted)')}</div>
              <div className="mt-1 inline-block rounded-full px-3 py-1 font-display text-sm font-extrabold text-white" style={{ background: lvl.color }}>
                {t(lvl.label, lvl.labelEn)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
          <Info label={t('Nationalité', 'Nationality')} value={`🇧🇪 ${profile.nationality}`} />
          <Info label={t('Âge', 'Age')} value={`${age} ${t('ans', 'yrs')}`} />
          <Info label={t('Entrée fac visée', 'Target college entry')} value={`${t('Automne', 'Fall')} ${profile.usEntryYear}`} />
          <Info label={t('Classe actuelle', 'Current grade')} value={t(profile.currentGrade, profile.currentGradeEn)} />
          <Info label={t('Études visées', 'Intended major')} value={`🎓 ${t(profile.major, profile.majorEn)}`} />
          <Info label={t('Anglais', 'English')} value={t(profile.englishTest, profile.englishTestEn)} />
        </div>
        <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2">
          <Info label={t('Club / coach', 'Club / coach')} value={`${profile.homeClub} — ${profile.coach}`} />
          <Info label={t('Stage', 'Training camp')} value={t(profile.trainingCampFr, profile.trainingCampEn)} />
        </div>
      </div>

      {/* Temps & conversion */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="font-display text-lg font-extrabold text-navy-900">{t('⏱️ Tes temps', '⏱️ Your times')}</h3>
          <span className="text-xs text-slate-400">{t('grand bassin → yards (US)', 'long course → yards (US)')}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2 font-semibold">{t('Épreuve', 'Event')}</th>
                <th className="px-4 py-2 font-semibold">{t('Temps (50 m)', 'Time (50 m)')}</th>
                <th className="px-4 py-2 font-semibold">≈ Yards (SCY)</th>
                <th className="px-4 py-2 font-semibold">{t('Niveau US', 'US level')}</th>
              </tr>
            </thead>
            <tbody>
              {EVENTS.filter((e) => byEvent[e.key]).map((e) => {
                const d = byEvent[e.key]
                const evLvl = LEVELS[scyLevel(d.scy, e.key)]
                return (
                  <tr key={e.key} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-semibold text-navy-900">{t(e.label, e.labelEn)}</td>
                    <td className="px-4 py-2 tabular-nums text-slate-700">{formatTime(d.lcm)}</td>
                    <td className="px-4 py-2 tabular-nums text-slate-500">{formatTime(d.scy)}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: evLvl.color }}>
                        {t(evLvl.short, evLvl.shortEn)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
          {t(
            '⚠️ Conversion indicative (facteurs approchés, pas la table officielle USA Swimming). Elle situe ton niveau, mais le temps exact en yards doit être vérifié.',
            '⚠️ Indicative conversion (approximate factors, not the official USA Swimming table). It places your level, but the exact yards time must be verified.',
          )}
        </p>
      </div>

      {/* Roadmap */}
      <div className="rounded-2xl border border-pool-200 bg-pool-50/60 p-5">
        <h3 className="font-display text-lg font-extrabold text-navy-900">{t('🛣️ Ta Road to D1', '🛣️ Your Road to D1')}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {t(
            <>
              Tes temps actuels te placent autour du niveau <strong>{lvl.label}</strong> côté US — un super point de départ à {age} ans.
              Avec <strong>2 ans</strong> jusqu'à la rentrée {profile.usEntryYear} et ton stage au CNM (Marseille), viser la{' '}
              <strong>D1</strong> est un objectif réaliste. Le classement te montre 3 catégories :{' '}
              <span className="font-semibold text-emerald-600">Réaliste</span>, <span className="font-semibold text-pool-600">Objectif</span> et{' '}
              <span className="font-semibold text-spark-600">Ambitieux</span> 🔥.
            </>,
            <>
              Your current times put you around the <strong>{lvl.labelEn}</strong> level on the US scale — a great starting point at {age}.
              With <strong>2 years</strong> until the {profile.usEntryYear} entry and your training camp at CNM (Marseille), aiming for{' '}
              <strong>D1</strong> is a realistic goal. The rankings show 3 categories:{' '}
              <span className="font-semibold text-emerald-600">Safety</span>, <span className="font-semibold text-pool-600">Target</span> and{' '}
              <span className="font-semibold text-spark-600">Reach</span> 🔥.
            </>,
          )}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {t(
            "💡 À venir (Phases 2 & 3) : suivi des démarches (NCAA, SAT/TOEFL), carnet de contacts coachs, et recommandations IA + générateur d'emails aux coachs.",
            '💡 Coming soon (Phases 2 & 3): steps tracking (NCAA, SAT/TOEFL), coach contact book, and AI recommendations + coach email generator.',
          )}
        </p>
      </div>
    </div>
  )
}
