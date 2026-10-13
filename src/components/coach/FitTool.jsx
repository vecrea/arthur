import { useMemo, useState } from 'react'
import { EVENTS, lcmToScy, formatTime, parseTime, eventTargets, STROKE_EN } from '../../lib/convert.js'
import { useLang } from '../../lib/i18n.jsx'

const TIERS = [
  { key: 'elite', field: 'eliteD1', fr: 'Élite NCAA', en: 'Elite NCAA' },
  { key: 'solid', field: 'solidD1', fr: 'NCAA solide', en: 'Solid NCAA' },
  { key: 'low', field: 'lowD1', fr: 'NCAA intermédiaire', en: 'Mid NCAA' },
  { key: 'dev', field: 'd2d3', fr: 'NCAA accessible', en: 'Entry NCAA' },
]

// Verdict couleur selon l'écart (en secondes) à la référence.
function verdict(gap, benchmark, t) {
  if (gap <= 0) return { label: t('Au niveau', 'Meets it'), color: '#16a34a', bg: 'rgba(22,163,74,0.12)' }
  if (benchmark && gap / benchmark < 0.03) return { label: t('Tout proche', 'Very close'), color: '#0ea5e9', bg: 'rgba(14,136,211,0.12)' }
  return { label: `−${gap.toFixed(2)} s`, color: '#d1971f', bg: 'rgba(209,151,31,0.14)' }
}

export default function FitTool({ profile }) {
  const { t, lang } = useLang()
  const [mode, setMode] = useState('preset') // preset | custom
  const [tier, setTier] = useState('low')
  const [custom, setCustom] = useState({}) // eventKey -> saisie SCY (string)

  // Temps d'Arthur convertis en yards (SCY), par épreuve.
  const athlete = useMemo(() => {
    const out = {}
    for (const ev of EVENTS) {
      const lcm = profile.times?.[ev.key]
      if (lcm != null) out[ev.key] = lcmToScy(lcm, ev.distance)
    }
    return out
  }, [profile])

  const tierObj = TIERS.find((x) => x.key === tier) || TIERS[1]

  const rows = EVENTS.filter((ev) => athlete[ev.key] != null).map((ev) => {
    const scy = athlete[ev.key]
    let benchmark = null
    if (mode === 'preset') {
      const tg = eventTargets(ev.key)
      benchmark = tg ? tg[tierObj.field] : null
    } else {
      const parsed = parseTime(custom[ev.key] || '')
      benchmark = parsed != null ? parsed : null
    }
    const gap = benchmark != null ? scy - benchmark : null
    return { ev, scy, benchmark, gap }
  })

  const compared = rows.filter((r) => r.benchmark != null)
  const meets = compared.filter((r) => r.gap <= 0).length

  return (
    <div className="space-y-4">
      {/* Choix du mode */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full surface-2 border border-hair p-1 text-xs font-semibold">
          <button onClick={() => setMode('preset')} className={'rounded-full px-3 py-1 transition ' + (mode === 'preset' ? 'pill-active' : 'text-secondary hover:text-heading')}>{t('Niveaux types', 'Preset levels')}</button>
          <button onClick={() => setMode('custom')} className={'rounded-full px-3 py-1 transition ' + (mode === 'custom' ? 'pill-active' : 'text-secondary hover:text-heading')}>{t('Vos temps', 'Your times')}</button>
        </div>
        {mode === 'preset' && (
          <div className="inline-flex flex-wrap rounded-full surface-2 border border-hair p-1 text-xs font-semibold">
            {TIERS.map((x) => (
              <button key={x.key} onClick={() => setTier(x.key)} className={'rounded-full px-3 py-1 transition ' + (tier === x.key ? 'pill-active' : 'text-secondary hover:text-heading')}>{t(x.fr, x.en)}</button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-tertiary">
        {mode === 'preset'
          ? t('Repères masculins indicatifs (temps SCY). Choisissez le niveau de votre programme.', 'Indicative men’s benchmarks (SCY times). Pick your program’s level.')
          : t('Entrez vos temps de recrutement en yards (SCY) — ex : 20.50 ou 1:45.00.', 'Enter your recruiting cut times in yards (SCY) — e.g. 20.50 or 1:45.00.')}
      </p>

      {/* Tableau de comparaison (défilable horizontalement sur mobile) */}
      <div className="overflow-x-auto rounded-xl border border-hair">
        <table className="w-full min-w-[540px] text-sm">
          <thead>
            <tr className="surface-2 text-left text-[11px] uppercase tracking-wide text-tertiary">
              <th className="p-3 font-semibold">{t('Épreuve', 'Event')}</th>
              <th className="p-3 font-semibold">{t('Arthur (yards)', 'Arthur (yards)')}</th>
              <th className="p-3 font-semibold">{mode === 'preset' ? t(tierObj.fr, tierObj.en) : t('Votre temps', 'Your cut')}</th>
              <th className="p-3 text-right font-semibold">{t('Verdict', 'Verdict')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ ev, scy, benchmark, gap }) => {
              const v = gap != null ? verdict(gap, benchmark, t) : null
              return (
                <tr key={ev.key} className="border-t border-hair">
                  <td className="p-3">
                    <div className="font-semibold text-heading">{t(ev.label, ev.labelEn)}</div>
                    <div className="text-[11px] text-tertiary">{t(ev.stroke, STROKE_EN[ev.stroke])}</div>
                  </td>
                  <td className="p-3 font-display font-black tabular-nums text-accent">{formatTime(scy)}</td>
                  <td className="p-3">
                    {mode === 'preset' ? (
                      <span className="tabular-nums text-secondary">{benchmark != null ? formatTime(benchmark) : '—'}</span>
                    ) : (
                      <input
                        value={custom[ev.key] || ''}
                        onChange={(e) => setCustom((c) => ({ ...c, [ev.key]: e.target.value }))}
                        placeholder={t('ex : 45.0', 'e.g. 45.0')}
                        inputMode="decimal"
                        className="field max-w-[8rem] py-1"
                      />
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {v ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold" style={{ color: v.color, background: v.bg }}>{v.label}</span>
                    ) : (
                      <span className="text-tertiary">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {compared.length > 0 && (
        <p className="text-sm text-primary">
          {t('Sur', 'Out of')} <span className="font-bold text-heading">{compared.length}</span> {t('épreuves comparées, Arthur est déjà au niveau sur', 'events compared, Arthur already meets')} <span className="font-bold text-emerald-700 dark:text-emerald-400">{meets}</span>.
          <span className="text-tertiary"> {t('Et il a ~2 ans de marge avant la rentrée 2028.', 'And he has ~2 years of margin before fall 2028.')}</span>
        </p>
      )}
    </div>
  )
}
