import { useEffect, useMemo, useState } from 'react'
import { EVENTS, toScy, scyLevel, formatTime, parseTime, LEVELS } from '../lib/convert.js'
import { loadTimes, saveTimes } from '../lib/storage.js'

const EV_BY_KEY = Object.fromEntries(EVENTS.map((e) => [e.key, e]))
const entryScy = (e) => toScy(e.seconds, EV_BY_KEY[e.eventKey].distance, e.course)

// Mini-graphe de progression (axe Y = secondes SCY, plus bas = mieux → en haut).
function Sparkline({ points }) {
  const W = 320, H = 70, pad = 10
  if (points.length < 2) return null
  const ys = points.map((p) => p.scy)
  const min = Math.min(...ys), max = Math.max(...ys)
  const span = max - min || 1
  const innerW = W - pad * 2, innerH = H - pad * 2
  const xy = points.map((p, i) => {
    const x = pad + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
    const y = pad + ((p.scy - min) / span) * innerH // plus rapide (min) => en haut
    return [x, y]
  })
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" preserveAspectRatio="none" style={{ height: 70 }}>
      <polyline points={line} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {xy.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" fill={i === xy.length - 1 ? '#e63946' : '#0ea5e9'} />
      ))}
    </svg>
  )
}

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function TimeTracker({ profile }) {
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
    if (secs == null) { setErr('Format invalide. Ex : 27.46 ou 1:07.39'); return }
    setErr('')
    setTimes((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.round(secs * 100)}`, eventKey, course, seconds: secs, date: date || todayISO(), meet: meet.trim() },
    ])
    setTimeStr(''); setMeet('')
  }
  const remove = (id) => setTimes((prev) => prev.filter((t) => t.id !== id))

  const byEvent = useMemo(() => {
    const map = {}
    for (const e of EVENTS) {
      const list = times.filter((t) => t.eventKey === e.key).sort((a, b) => a.date.localeCompare(b.date))
      if (list.length) map[e.key] = list.map((t) => ({ ...t, scy: entryScy(t) }))
    }
    return map
  }, [times])

  const inputCls = 'rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pool-500 focus:ring-2 focus:ring-pool-500/20'

  return (
    <div className="space-y-5">
      {/* Formulaire d'ajout */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-display text-xl font-extrabold text-navy-900">⏱️ Mes chronos</h2>
        <p className="text-sm text-slate-500">Enregistre tes courses et suis ta progression vers la D1. Tout reste chez toi (navigateur).</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <select value={eventKey} onChange={(e) => setEventKey(e.target.value)} className={inputCls + ' lg:col-span-2'}>
            {EVENTS.map((e) => (
              <option key={e.key} value={e.key}>{e.label} — {e.stroke}</option>
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
            + Ajouter
          </button>
        </div>
        <input
          value={meet}
          onChange={(e) => setMeet(e.target.value)}
          placeholder="Compétition (optionnel) — ex : Championnats de Belgique"
          className={inputCls + ' mt-2 w-full'}
        />
        {err && <p className="mt-2 text-xs font-semibold text-flag-600">{err}</p>}
      </div>

      {/* Cartes par épreuve */}
      {Object.keys(byEvent).length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-4xl">📈</div>
          <p className="mt-3 font-semibold text-navy-900">Pas encore de chrono</p>
          <p className="mt-1 text-sm text-slate-500">Ajoute ta première course ci-dessus pour démarrer ta courbe de progression.</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {EVENTS.filter((e) => byEvent[e.key]).map((e) => {
            const list = byEvent[e.key]
            const best = list.reduce((m, t) => (t.scy < m.scy ? t : m), list[0])
            const latest = list[list.length - 1]
            const delta = latest.scy - best.scy
            const lvl = scyLevel(best.scy, e.key)
            return (
              <div key={e.key} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-navy-900">{e.label}</h3>
                    <p className="text-xs text-slate-500">{list.length} chrono(s) · record {formatTime(best.scy)} SCY</p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: LEVELS[lvl].color }}>
                    {LEVELS[lvl].short}
                  </span>
                </div>

                <Sparkline points={list} />

                {delta > 0.001 && (
                  <p className="mt-1 text-xs text-slate-500">Dernier : {formatTime(latest.scy)} SCY (+{delta.toFixed(2)} s vs record)</p>
                )}

                <ul className="mt-2 divide-y divide-slate-50">
                  {[...list].reverse().map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                      <div className="min-w-0">
                        <span className="font-semibold text-navy-900">{formatTime(t.seconds)}</span>
                        <span className="ml-1 text-[10px] font-bold uppercase text-slate-400">{t.course}</span>
                        {t.course !== 'SCY' && <span className="ml-1 text-xs text-pool-600">→ {formatTime(t.scy)} SCY</span>}
                        <span className="ml-2 text-xs text-slate-400">{t.date}{t.meet ? ` · ${t.meet}` : ''}</span>
                      </div>
                      <button onClick={() => remove(t.id)} className="shrink-0 text-slate-300 transition hover:text-flag-500" title="Supprimer" aria-label="Supprimer">
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      <p className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-200">
        💡 Astuce : note tes temps en grand bassin (50 m), petit bassin (25 m) ou yards — ils sont tous convertis en yards (SCY)
        pour suivre ta trajectoire vers les repères de l’onglet <strong>« Recrutable ? »</strong>. Le point rouge = ton dernier chrono.
      </p>
    </div>
  )
}
