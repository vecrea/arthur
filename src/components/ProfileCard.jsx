import { EVENTS, athleteLevel, lcmToScy, scyLevel, formatTime, LEVELS } from '../lib/convert.js'

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
  const { level, byEvent } = athleteLevel(profile)
  const lvl = LEVELS[level]

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-black">{profile.name}</h2>
              <p className="text-pool-100/80">{profile.sport} · {profile.specialty}</p>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wide text-pool-100/70">Niveau actuel (converti)</div>
              <div
                className="mt-1 inline-block rounded-full px-3 py-1 font-display text-sm font-extrabold text-white"
                style={{ background: lvl.color }}
              >
                {lvl.label}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
          <Info label="Nationalité" value={`🇧🇪 ${profile.nationality}`} />
          <Info label="Âge" value={`${ageFrom(profile.birthDate)} ans`} />
          <Info label="Entrée fac visée" value={`Automne ${profile.usEntryYear}`} />
          <Info label="Classe actuelle" value={profile.currentGrade} />
          <Info label="Études visées" value={`🎓 ${profile.major}`} />
          <Info label="Anglais" value={profile.englishTest} />
        </div>
        <div className="px-4 pb-4">
          <Info label="Club / entraînement" value={profile.club} />
        </div>
      </div>

      {/* Temps & conversion */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="font-display text-lg font-extrabold text-navy-900">⏱️ Tes temps</h3>
          <span className="text-xs text-slate-400">grand bassin → yards (US)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2 font-semibold">Épreuve</th>
                <th className="px-4 py-2 font-semibold">Temps (50 m)</th>
                <th className="px-4 py-2 font-semibold">≈ Yards (SCY)</th>
                <th className="px-4 py-2 font-semibold">Niveau US</th>
              </tr>
            </thead>
            <tbody>
              {EVENTS.filter((e) => byEvent[e.key]).map((e) => {
                const d = byEvent[e.key]
                const evLvl = LEVELS[scyLevel(d.scy, e.key)]
                return (
                  <tr key={e.key} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-semibold text-navy-900">{e.label}</td>
                    <td className="px-4 py-2 tabular-nums text-slate-700">{formatTime(d.lcm)}</td>
                    <td className="px-4 py-2 tabular-nums text-slate-500">{formatTime(d.scy)}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: evLvl.color }}>
                        {evLvl.short}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
          ⚠️ Conversion <strong>indicative</strong> (facteurs approchés, pas la table officielle USA Swimming).
          Elle situe ton niveau, mais le temps exact en yards doit être vérifié.
        </p>
      </div>

      {/* Roadmap */}
      <div className="rounded-2xl border border-pool-200 bg-pool-50/60 p-5">
        <h3 className="font-display text-lg font-extrabold text-navy-900">🛣️ Ta Road to D1</h3>
        <p className="mt-1 text-sm text-slate-600">
          Tes temps actuels te placent autour du niveau <strong>{lvl.label}</strong> côté US — un super point de
          départ à {ageFrom(profile.birthDate)} ans. Avec <strong>2 ans</strong> jusqu'à la rentrée {profile.usEntryYear}
          {' '}et ton entraînement au CNM, viser la <strong>D1</strong> est un objectif réaliste. Le classement te montre
          3 catégories : <span className="font-semibold text-emerald-600">Réaliste</span>,{' '}
          <span className="font-semibold text-pool-600">Objectif</span> et{' '}
          <span className="font-semibold text-spark-600">Ambitieux</span> 🔥.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          💡 À venir (Phases 2 & 3) : suivi des démarches (NCAA, SAT/TOEFL), carnet de contacts coachs,
          et recommandations IA + générateur d'emails aux coachs.
        </p>
      </div>
    </div>
  )
}
