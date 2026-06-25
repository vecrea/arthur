import { useEffect, useMemo, useState } from 'react'
import { EVENTS, toScy, scyLevel, formatTime, parseTime, LEVELS, STROKE_EN } from '../lib/convert.js'
import { loadTimes, saveTimes } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

const EV_BY_KEY = Object.fromEntries(EVENTS.map((e) => [e.key, e]))
const entryScy = (e) => toScy(e.seconds, EV_BY_KEY[e.eventKey].distance, e.course)

// Regroupe les épreuves par nage (pour les <optgroup> du sélecteur).
const EVENT_GROUPS = []
for (const e of EVENTS) {
  let g = EVENT_GROUPS[EVENT_GROUPS.length - 1]
  if (!g || g.stroke !== e.stroke) {
    g = { stroke: e.stroke, items: [] }
    EVENT_GROUPS.push(g)
  }
  g.items.push(e)
}

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function TimeTracker({ profile }) {
  const { t } = useLang()
  const [times, setTimes] = useState(() => loadTimes())
  useEffect(() => saveTimes(times), [times])

  const [eventKey, setEventKey] = useState('50FR')
  const [course, setCourse] = useState('LCM')
  const [date, setDate] = useState(todayISO())
  const [timeStr, setTimeStr] = useState('')
  const [meet, setMeet] = useState('')
  const [err, setErr] = useState('')

  const add = () => {
    const secs = parseTime(timeStr)
    if (secs == null) {
      setErr(t('Format invalide. Ex : 27.46 ou 1:07.39', 'Invalid format. E.g. 27.46 or 1:07.39'))
      return
    }
    setErr('')
    setTimes((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.round(secs * 100)}`, eventKey, course, seconds: secs, date: date || todayISO(), meet: meet.trim() },
    ])
    setTimeStr(''); setMeet('')
  }
  const remove = (id) => setTimes((prev) => prev.filter((it) => it.id !== id))

  const byEvent = useMemo(() => {
    const map = {}
    for (const e of EVENTS) {
      const list = times.filter((it) => it.eventKey === e.key).sort((a, b) => a.date.localeCompare(b.date))
      if (list.length) map[e.key] = list.map((it) => ({ ...it, scy: entryScy(it) }))
    }
    return map
  }, [times])

  const inputCls = 'rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pool-500 focus:ring-2 focus:ring-pool-500/20'

  return (
    <div className="space-y-5">
      {/* Formulaire d'ajout */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-display text-xl font-extrabold text-navy-900">{t('⏱️ Mes chronos', '⏱️ My times')}</h2>
        <p className="text-sm text-slate-500">
          {t(
            'Enregistre tes courses et suis ta progression vers la D1. Tout reste chez toi (navigateur).',
            'Log your races and track your progression toward D1. Everything stays on your device (browser).',
          )}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <select value={eventKey} onChange={(e) => setEventKey(e.target.value)} className={inputCls + ' lg:col-span-2'}>
            {EVENT_GROUPS.map((g) => (
              <optgroup key={g.stroke} label={t(g.stroke, STROKE_EN[g.stroke])}>
                {g.items.map((e) => (
                  <option key={e.key} value={e.key}>{t(e.label, e.labelEn)}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <select value={course} onChange={(e) => setCourse(e.target.value)} className={inputCls}>
            <option value="LCM">50 m (LCM)</option>
            <option value="SCM">25 m (SCM)</option>
            <option value="SCY">Yards (SCY)</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          <input
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="27.46 / 1:07.39"
            className={inputCls}
            inputMode="decimal"
          />
          <button onClick={add} className="rounded-xl bg-pool-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pool-600">
            {t('+ Ajouter', '+ Add')}
          </button>
        </div>
        <input
          value={meet}
          onChange={(e) => setMeet(e.target.value)}
          placeholder={t('Compétition (optionnel) — ex : Championnats de Belgique', 'Meet (optional) — e.g. Belgian Championships')}
          className={inputCls + ' mt-2 w-full'}
        />
        {err && <p className="mt-2 text-xs font-semibold text-flag-600">{err}</p>}
      </div>

      {/* Une case par épreuve (nage × distance), groupée par nage */}
      <div className="space-y-4">
        {EVENT_GROUPS.map((g) => (
          <div key={g.stroke} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-3 font-display text-sm font-extrabold uppercase tracking-wide text-slate-500">{t(g.stroke, STROKE_EN[g.stroke])}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((e) => {
                const list = byEvent[e.key]
                const selected = e.key === eventKey
                const best = list ? list.reduce((m, it) => (it.scy < m.scy ? it : m), list[0]) : null
                const lvl = best ? scyLevel(best.scy, e.key) : 0
                return (
                  <div
                    key={e.key}
                    onClick={() => setEventKey(e.key)}
                    title={t(`Choisir « ${e.label} » dans le formulaire`, `Select “${e.labelEn}” in the form`)}
                    className={
                      'cursor-pointer rounded-xl border p-3 transition ' +
                      (selected ? 'border-pool-500 ring-2 ring-pool-500/20 ' : 'border-slate-200 hover:border-pool-300 ') +
                      (best ? 'bg-white' : 'bg-slate-50/60')
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-extrabold text-navy-900">{t(e.label, e.labelEn)}</span>
                      {best && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: LEVELS[lvl].color }}>
                          {t(LEVELS[lvl].short, LEVELS[lvl].shortEn)}
                        </span>
                      )}
                    </div>

                    {best ? (
                      <>
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-display text-xl font-black text-navy-900">{formatTime(best.seconds)}</span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">{best.course}</span>
                          {best.course !== 'SCY' && <span className="text-xs text-pool-600">→ {formatTime(best.scy)} SCY</span>}
                        </div>
                        <ul className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                          {[...list].reverse().map((it) => (
                            <li key={it.id} className="flex items-center justify-between gap-2 text-xs">
                              <span className="min-w-0 truncate text-slate-600">
                                <span className="font-semibold text-navy-900">{formatTime(it.seconds)}</span>
                                <span className="ml-1 text-[9px] font-bold uppercase text-slate-400">{it.course}</span>
                                <span className="ml-1.5 text-slate-400">{it.date}{it.meet ? ` · ${it.meet}` : ''}</span>
                              </span>
                              <button
                                onClick={(ev) => { ev.stopPropagation(); remove(it.id) }}
                                className="shrink-0 text-slate-300 transition hover:text-flag-500"
                                title={t('Supprimer', 'Delete')}
                                aria-label={t('Supprimer', 'Delete')}
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-slate-300">{t('— pas de temps', '— no time')}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-200">
        {t(
          '💡 Astuce : note tes temps en grand bassin (50 m), petit bassin (25 m) ou yards — ils sont tous convertis en yards (SCY) pour suivre ta trajectoire vers les repères de l’onglet « Recrutable ? ». Clique sur une case pour la pré-sélectionner dans le formulaire ; le gros chiffre est ton record sur l’épreuve.',
          '💡 Tip: log your times in long course (50 m), short course (25 m) or yards — they’re all converted to yards (SCY) to track your trajectory toward the benchmarks in the “Recruitable?” tab. Click a box to pre-select it in the form; the big number is your record in that event.',
        )}
      </p>
    </div>
  )
}
