import { EVENTS, lcmToScy, scyLevel, formatTime, LEVELS, eventTargets, athleteLevel, STROKE_EN } from '../lib/convert.js'
import { useLang } from '../lib/i18n.jsx'

// Barre visuelle : positionne le temps SCY sur l'échelle Développement → Élite D1,
// avec les zones de niveau colorées et un marqueur à la position du nageur.
function LevelBar({ scy, eventKey }) {
  const { t } = useLang()
  const tg = eventTargets(eventKey)
  if (!tg) return null
  const slow = tg.d2d3 * 1.08 // borne lente (0 %)
  const fast = tg.eliteD1 // borne rapide (100 %)
  const pos = (x) => Math.max(0, Math.min(100, ((slow - x) / (slow - fast)) * 100))
  const p = [pos(tg.d2d3), pos(tg.lowD1), pos(tg.solidD1), pos(tg.eliteD1)]
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
        <div className="absolute -top-[18px] -translate-x-1/2" style={{ left: `${marker}%` }} title={t('Ta position', 'Your position')}>
          <div className="mx-auto h-0 w-0 border-x-4 border-t-[6px] border-x-transparent border-t-navy-900" />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        <span>{t('Dév.', 'Dev.')}</span>
        <span>D2/D3</span>
        <span>D1</span>
        <span>{t('Élite', 'Elite')}</span>
      </div>
    </div>
  )
}

export default function Recruitable({ profile }) {
  const { t } = useLang()
  const { level } = athleteLevel(profile)
  const bonus = profile.recruitHorizonBonus || 0
  const projected = Math.min(5, level + bonus)

  const rows = EVENTS.map((ev) => {
    const lcm = profile.times?.[ev.key]
    if (lcm == null) return null
    const scy = lcmToScy(lcm, ev.distance)
    const lvl = scyLevel(scy, ev.key)
    const tg = eventTargets(ev.key)
    const gapLowD1 = scy - tg.lowD1 // >0 => il reste à descendre pour entrer en D1
    const gapSolid = scy - tg.solidD1
    return { ev, lcm, scy, lvl, tg, gapLowD1, gapSolid }
  }).filter(Boolean)

  return (
    <div className="space-y-5">
      {/* Verdict global */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-900/5">
        <div className="panel-dark p-5 text-white">
          <h2 className="font-display text-xl font-extrabold">{t('Suis-je recrutable ?', 'Am I recruitable?')}</h2>
          <p className="mt-1 text-sm text-white/80">
            {t(
              'Tes meilleurs temps (grand bassin) convertis en yards (SCY, le standard universitaire US), comparés aux repères de recrutement masculin.',
              'Your best long-course times converted to yards (SCY, the US college standard), compared to men’s recruiting benchmarks.',
            )}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Niveau actuel (meilleure épreuve)', 'Current level (best event)')}</div>
              <div className="mt-1 font-display text-2xl font-black" style={{ color: LEVELS[level].color }}>
                {t(LEVELS[level].label, LEVELS[level].labelEn)}
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Projection 2028 (+1 palier de marge)', '2028 projection (+1 level of margin)')}</div>
              <div className="mt-1 font-display text-2xl font-black" style={{ color: LEVELS[projected].color }}>
                {t(LEVELS[projected].label, LEVELS[projected].labelEn)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Détail par épreuve */}
      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map(({ ev, lcm, scy, lvl, tg, gapLowD1, gapSolid }) => (
          <div key={ev.key} className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-900/5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-extrabold text-navy-900">{t(ev.label, ev.labelEn)}</h3>
                <p className="text-xs text-slate-500">{t(ev.stroke, STROKE_EN[ev.stroke])}</p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: LEVELS[lvl].color }}>
                {t(LEVELS[lvl].short, LEVELS[lvl].shortEn)}
              </span>
            </div>

            <div className="mt-3 flex items-end gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t('Ton temps (50 m)', 'Your time (50 m)')}</div>
                <div className="font-display text-xl font-black text-navy-900">{formatTime(lcm)}</div>
              </div>
              <div className="text-slate-300">→</div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t('Converti (yards)', 'Converted (yards)')}</div>
                <div className="font-display text-xl font-black text-pool-600">{formatTime(scy)}</div>
              </div>
            </div>

            <LevelBar scy={scy} eventKey={ev.key} />

            <div className="mt-3 space-y-1 text-sm">
              {gapLowD1 <= 0 ? (
                <p className="font-semibold text-emerald-700">{t('Déjà au niveau D1 sur cette épreuve.', 'Already at D1 level in this event.')}</p>
              ) : (
                <p className="text-slate-700">
                  <span className="font-semibold text-navy-900">−{gapLowD1.toFixed(2)} s</span> {t('pour atteindre la porte D1', 'to reach the D1 door')}
                  <span className="text-slate-400"> (≈ {formatTime(tg.lowD1)} SCY)</span>
                </p>
              )}
              {gapSolid > 0 ? (
                <p className="text-slate-500">
                  −{gapSolid.toFixed(2)} s {t('pour une D1 solide', 'for a solid D1')} <span className="text-slate-400">(≈ {formatTime(tg.solidD1)} SCY)</span>
                </p>
              ) : (
                <p className="text-slate-500">{t('D1 solide atteinte', 'Solid D1 reached')}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-900/5">
        {t(
          'Repères indicatifs (hommes, temps SCY) pour situer ton niveau — ce ne sont pas des minima officiels. La conversion 50 m → yards est une approximation. Les coachs regardent aussi ta progression, ta marge et ton attitude : garde tes chronos à jour dans l’onglet « Mes chronos ».',
          'Indicative benchmarks (men, SCY times) to gauge your level — not official cut-offs. The 50 m → yards conversion is an approximation. Coaches also look at your progression, your margin and your attitude: keep your times up to date in the “My times” tab.',
        )}
      </p>
    </div>
  )
}
