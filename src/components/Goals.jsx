import { useEffect, useMemo, useState } from 'react'
import { EVENTS, formatTime, parseTime, STROKE_EN } from '../lib/convert.js'
import { loadGoals, saveGoals, loadTimes } from '../lib/storage.js'
import { bestScyForEvent, goalStatus } from '../lib/goals.js'
import { useLang } from '../lib/i18n.jsx'

const EV_BY_KEY = Object.fromEntries(EVENTS.map((e) => [e.key, e]))

// Épreuves groupées par nage (pour les <optgroup>).
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

export default function Goals({ profile }) {
  const { t } = useLang()
  const [goals, setGoals] = useState(() => loadGoals())
  const times = useMemo(() => loadTimes(), [])
  useEffect(() => saveGoals(goals), [goals])

  const [eventKey, setEventKey] = useState('50FR')
  const [course, setCourse] = useState('LCM')
  const [timeStr, setTimeStr] = useState('')
  const [date, setDate] = useState('')
  const [err, setErr] = useState('')

  const add = () => {
    const secs = parseTime(timeStr)
    if (secs == null) {
      setErr(t('Format invalide. Ex : 27.00 ou 1:05.00', 'Invalid format. E.g. 27.00 or 1:05.00'))
      return
    }
    setErr('')
    setGoals((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.round(secs * 100)}`, eventKey, course, seconds: secs, date, startScy: bestScyForEvent(eventKey, times, profile) },
    ])
    setTimeStr(''); setDate('')
  }
  const remove = (id) => setGoals((prev) => prev.filter((g) => g.id !== id))

  const sorted = useMemo(
    () => [...goals].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999')),
    [goals],
  )

  const today = todayISO()
  const inputCls = 'rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pool-500 focus:ring-2 focus:ring-pool-500/20'

  return (
    <div className="space-y-5">
      {/* Formulaire */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-display text-xl font-extrabold text-navy-900">{t('🏁 Mes objectifs', '🏁 My goals')}</h2>
        <p className="text-sm text-slate-500">
          {t(
            'Fixe un temps cible et une échéance par épreuve. L’app calcule l’écart avec ton meilleur temps et ta progression.',
            'Set a target time and a deadline per event. The app tracks the gap to your best time and your progress.',
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
          <input
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder={t('Temps cible · 1:05.00', 'Target time · 1:05.00')}
            className={inputCls}
            inputMode="decimal"
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} title={t('Échéance (optionnel)', 'Deadline (optional)')} />
          <button onClick={add} className="rounded-xl bg-pool-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pool-600">
            {t('+ Objectif', '+ Goal')}
          </button>
        </div>
        {err && <p className="mt-2 text-xs font-semibold text-flag-600">{err}</p>}
      </div>

      {/* Liste des objectifs */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-4xl">🏁</div>
          <p className="mt-3 font-semibold text-navy-900">{t('Aucun objectif pour l’instant', 'No goals yet')}</p>
          <p className="mt-1 text-sm text-slate-500">
            {t('Fixe ta première cible ci-dessus — par ex. passer sous 1:00 au 100 NL d’ici 2027.', 'Set your first target above — e.g. break 1:00 in the 100 Free by 2027.')}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {sorted.map((goal) => {
            const ev = EV_BY_KEY[goal.eventKey]
            const { targetScy, currentScy, achieved, gap, pct } = goalStatus(goal, times, profile)
            const daysLeft = goal.date ? Math.ceil((new Date(goal.date) - new Date(today)) / 86400000) : null
            return (
              <div key={goal.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-navy-900">{t(ev.label, ev.labelEn)}</h3>
                    <p className="text-xs text-slate-500">{t(ev.stroke, STROKE_EN[ev.stroke])}</p>
                  </div>
                  {achieved ? (
                    <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">{t('🎉 Atteint', '🎉 Achieved')}</span>
                  ) : (
                    daysLeft != null && (
                      <span className={'rounded-full px-2.5 py-1 text-xs font-bold ' + (daysLeft < 0 ? 'bg-flag-100 text-flag-600' : 'bg-slate-100 text-slate-600')}>
                        {daysLeft < 0 ? t('échéance passée', 'overdue') : daysLeft === 0 ? t('aujourd’hui', 'today') : `${daysLeft} ${t('j', 'd')}`}
                      </span>
                    )
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t('Cible', 'Target')}</div>
                    <div className="font-display text-xl font-black text-navy-900">
                      {formatTime(goal.seconds)} <span className="text-[10px] font-bold uppercase text-slate-400">{goal.course}</span>
                      {goal.course !== 'SCY' && <span className="ml-1 text-xs text-pool-600">→ {formatTime(targetScy)} SCY</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t('Ton record (yards)', 'Your best (yards)')}</div>
                    <div className="font-display text-xl font-black text-slate-500">{currentScy != null ? formatTime(currentScy) : '—'}</div>
                  </div>
                  {goal.date && (
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t('Échéance', 'Deadline')}</div>
                      <div className="text-sm font-semibold text-navy-900">{goal.date}</div>
                    </div>
                  )}
                </div>

                {/* Progression */}
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: achieved ? '#10b981' : 'linear-gradient(to right,#0ea5e9,#10b981)' }} />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-sm">
                    {achieved ? (
                      <span className="font-semibold text-emerald-700">{t('Objectif atteint 🎉', 'Goal reached 🎉')}</span>
                    ) : currentScy == null ? (
                      <span className="text-slate-400">{t('Enregistre un temps pour suivre.', 'Log a time to track.')}</span>
                    ) : (
                      <span className="text-slate-700"><span className="font-semibold text-navy-900">−{gap.toFixed(2)} s</span> {t('à gagner', 'to go')} <span className="text-slate-400">({Math.round(pct)}%)</span></span>
                    )}
                  </p>
                  <button onClick={() => remove(goal.id)} className="shrink-0 text-slate-300 transition hover:text-flag-500" title={t('Supprimer', 'Delete')} aria-label={t('Supprimer', 'Delete')}>
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-200">
        {t(
          '💡 Ton « record » combine tes chronos enregistrés et tes temps de profil (le plus rapide), converti en yards. Mets tes chronos à jour dans « Mes chronos » et la progression se recalcule.',
          '💡 Your “best” combines your logged times and your profile times (the fastest), converted to yards. Update your times in “My times” and the progress recomputes.',
        )}
      </p>
    </div>
  )
}
