import { EVENTS, lcmToScy, scyLevel, formatTime, LEVELS, eventTargets, athleteLevel } from '../lib/convert.js'

// Barre visuelle : positionne le temps SCY sur l'échelle Développement → Élite D1,
// avec les zones de niveau colorées et un marqueur à la position du nageur.
function LevelBar({ scy, eventKey }) {
  const t = eventTargets(eventKey)
  if (!t) return null
  const slow = t.d2d3 * 1.08 // borne lente (0 %)
  const fast = t.eliteD1 // borne rapide (100 %)
  const pos = (x) => Math.max(0, Math.min(100, ((slow - x) / (slow - fast)) * 100))
  const p = [pos(t.d2d3), pos(t.lowD1), pos(t.solidD1), pos(t.eliteD1)]
  const segs = [
    { w: p[0], c: LEVELS[1].color },
    { w: p[1] - p[0], c: LEVELS[2].color },
    { w: p[2] - p[1], c: LEVELS[3].color },
    { w: p[3] - p[2], c: LEVELS[4].color },
    { w: 100 - p[3], c: LEVELS[5].color },
  ]
  const marker = pos(scy)
  return (
    <div className="mt-3">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full">
        <div className="flex h-full w-full">
          {segs.map((s, i) => (
            <div key={i} style={{ width: `${s.w}%`, background: s.c }} />
          ))}
        </div>
      </div>
      <div className="relative h-0">
        <div
          className="absolute -top-[18px] -translate-x-1/2"
          style={{ left: `${marker}%` }}
          title="Ta position"
        >
          <div className="mx-auto h-0 w-0 border-x-4 border-t-[6px] border-x-transparent border-t-navy-900" />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        <span>Dév.</span>
        <span>D2/D3</span>
        <span>D1</span>
        <span>Élite</span>
      </div>
    </div>
  )
}

export default function Recruitable({ profile }) {
  const { level } = athleteLevel(profile)
  const bonus = profile.recruitHorizonBonus || 0
  const projected = Math.min(5, level + bonus)

  const rows = EVENTS.map((ev) => {
    const lcm = profile.times?.[ev.key]
    if (lcm == null) return null
    const scy = lcmToScy(lcm, ev.distance)
    const lvl = scyLevel(scy, ev.key)
    const t = eventTargets(ev.key)
    const gapLowD1 = scy - t.lowD1 // >0 => il reste à descendre pour entrer en D1
    const gapSolid = scy - t.solidD1
    return { ev, lcm, scy, lvl, t, gapLowD1, gapSolid }
  }).filter(Boolean)

  return (
    <div className="space-y-5">
      {/* Verdict global */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="bg-gradient-to-br from-navy-950 to-navy-800 p-5 text-white">
          <h2 className="font-display text-xl font-extrabold">🎯 Suis-je recrutable ?</h2>
          <p className="mt-1 text-sm text-white/80">
            Tes meilleurs temps (grand bassin) convertis en yards (SCY, le standard universitaire US),
            comparés aux repères de recrutement masculin.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/10 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Niveau actuel (meilleure épreuve)</div>
              <div className="mt-1 font-display text-2xl font-black" style={{ color: LEVELS[level].color }}>
                {LEVELS[level].label}
              </div>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Projection 2028 (+1 palier de marge)</div>
              <div className="mt-1 font-display text-2xl font-black" style={{ color: LEVELS[projected].color }}>
                {LEVELS[projected].label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Détail par épreuve */}
      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map(({ ev, lcm, scy, lvl, t, gapLowD1, gapSolid }) => (
          <div key={ev.key} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-extrabold text-navy-900">{ev.label}</h3>
                <p className="text-xs text-slate-500">{ev.stroke}</p>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                style={{ background: LEVELS[lvl].color }}
              >
                {LEVELS[lvl].short}
              </span>
            </div>

            <div className="mt-3 flex items-end gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ton temps (50 m)</div>
                <div className="font-display text-xl font-black text-navy-900">{formatTime(lcm)}</div>
              </div>
              <div className="text-slate-300">→</div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Converti (yards)</div>
                <div className="font-display text-xl font-black text-pool-600">{formatTime(scy)}</div>
              </div>
            </div>

            <LevelBar scy={scy} eventKey={ev.key} />

            <div className="mt-3 space-y-1 text-sm">
              {gapLowD1 <= 0 ? (
                <p className="font-semibold text-emerald-700">✅ Déjà au niveau D1 sur cette épreuve.</p>
              ) : (
                <p className="text-slate-700">
                  <span className="font-semibold text-navy-900">−{gapLowD1.toFixed(2)} s</span> pour atteindre la porte D1
                  <span className="text-slate-400"> (≈ {formatTime(t.lowD1)} SCY)</span>
                </p>
              )}
              {gapSolid > 0 ? (
                <p className="text-slate-500">
                  −{gapSolid.toFixed(2)} s pour une D1 solide <span className="text-slate-400">(≈ {formatTime(t.solidD1)} SCY)</span>
                </p>
              ) : (
                <p className="text-slate-500">D1 solide atteinte 🔥</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-200">
        ⚠️ Repères <strong>indicatifs</strong> (hommes, temps SCY) pour situer ton niveau — ce ne sont pas des minima officiels.
        La conversion 50 m → yards est une approximation. Les coachs regardent aussi ta progression, ta marge et ton attitude :
        garde tes chronos à jour dans l’onglet <strong>« Mes chronos »</strong> 📈.
      </p>
    </div>
  )
}
