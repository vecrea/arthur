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

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden">
        {/* Formulaire */}
        <div className="p-5">
          <h2 className="font-display text-xl font-extrabold text-heading">{t('Mes objectifs', 'My goals')}</h2>
          <p className="text-sm text-secondary">
            {t(
              'Fixe un temps cible et une échéance par épreuve. L’app calcule l’écart avec ton meilleur temps et ta progression.',
              'Set a target time and a deadline per event. The app tracks the gap to your best time and your progress.',
            )}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            <select value={eventKey} onChange={(e) => setEventKey(e.target.value)} className="field lg:col-span-2">
              {EVENT_GROUPS.map((g) => (
                <optgroup key={g.stroke} label={t(g.stroke, STROKE_EN[g.stroke])}>
                  {g.items.map((e) => (
                    <option key={e.key} value={e.key}>{t(e.label, e.labelEn)}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <select value={course} onChange={(e) => setCourse(e.target.value)} className="field">
              <option value="LCM">50 m (LCM)</option>
              <option value="SCM">25 m (SCM)</option>
              <option value="SCY">Yards (SCY)</option>
            </select>
            <input
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder={t('Temps cible · 1:05.00', 'Target time · 1:05.00')}
              className="field"
              inputMode="decimal"
            />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field" title={t('Échéance (optionnel)', 'Deadline (optional)')} />
            <button onClick={add} className="rounded-xl bg-pool-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pool-600">
              {t('+ Objectif', '+ Goal')}
            </button>
          </div>
          {err && <p className="mt-2 text-xs font-semibold text-flag-600 dark:text-flag-400">{err}</p>}
        </div>

        {/* Liste des objectifs — lignes séparées par un filet */}
        {sorted.length === 0 ? (
          <div className="border-t border-hair p-10 text-center">
            <p className="font-semibold text-heading">{t('Aucun objectif pour l’instant', 'No goals yet')}</p>
            <p className="mt-1 text-sm text-secondary">
              {t('Fixe ta première cible ci-dessus — par ex. passer sous 1:00 au 100 NL d’ici 2027.', 'Set your first target above — e.g. break 1:00 in the 100 Free by 2027.')}
            </p>
          </div>
        ) : (
          <div className="row-list border-t border-hair">
            {sorted.map((goal) => {
              const ev = EV_BY_KEY[goal.eventKey]
              const { targetScy, currentScy, achieved, gap, pct } = goalStatus(goal, times, profile)
              const daysLeft = goal.date ? Math.ceil((new Date(goal.date) - new Date(today)) / 86400000) : null
              return (
                <div key={goal.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-heading">{t(ev.label, ev.labelEn)}</h3>
                      <p className="text-xs text-secondary">{t(ev.stroke, STROKE_EN[ev.stroke])}</p>
                    </div>
                    {achieved ? (
                      <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">{t('Atteint', 'Achieved')}</span>
                    ) : (
                      daysLeft != null && (
                        <span className={'rounded-full px-2.5 py-1 text-xs font-bold ' + (daysLeft < 0 ? 'bg-flag-500/15 text-flag-600 dark:text-flag-400' : 'surface-3 text-secondary')}>
                          {daysLeft < 0 ? t('échéance passée', 'overdue') : daysLeft === 0 ? t('aujourd’hui', 'today') : `${daysLeft} ${t('j', 'd')}`}
                        </span>
                      )
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-tertiary">{t('Cible', 'Target')}</div>
                      <div className="font-display text-xl font-black text-heading">
                        {formatTime(goal.seconds)} <span className="text-[10px] font-bold uppercase text-tertiary">{goal.course}</span>
                        {goal.course !== 'SCY' && <span className="ml-1 text-xs text-accent">→ {formatTime(targetScy)} SCY</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-tertiary">{t('Ton record (yards)', 'Your best (yards)')}</div>
                      <div className="font-display text-xl font-black text-secondary">{currentScy != null ? formatTime(currentScy) : '—'}</div>
                    </div>
                    {goal.date && (
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-tertiary">{t('Échéance', 'Deadline')}</div>
                        <div className="text-sm font-semibold text-heading">{goal.date}</div>
                      </div>
                    )}
                  </div>

                  {/* Progression */}
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full surface-3">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: achieved ? '#10b981' : 'linear-gradient(to right,#0ea5e9,#10b981)' }} />
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-sm">
                      {achieved ? (
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{t('Objectif atteint', 'Goal reached')}</span>
                      ) : currentScy == null ? (
                        <span className="text-tertiary">{t('Enregistre un temps pour suivre.', 'Log a time to track.')}</span>
                      ) : (
                        <span className="text-primary"><span className="font-semibold text-heading">−{gap.toFixed(2)} s</span> {t('à gagner', 'to go')} <span className="text-tertiary">({Math.round(pct)}%)</span></span>
                      )}
                    </p>
                    <button onClick={() => remove(goal.id)} className="shrink-0 text-tertiary transition hover:text-flag-500" title={t('Supprimer', 'Delete')} aria-label={t('Supprimer', 'Delete')}>
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="px-1 text-xs text-secondary">
        {t(
          'Ton « record » combine tes chronos enregistrés et tes temps de profil (le plus rapide), converti en yards. Mets tes chronos à jour dans « Mes chronos » et la progression se recalcule.',
          'Your “best” combines your logged times and your profile times (the fastest), converted to yards. Update your times in “My times” and the progress recomputes.',
        )}
      </p>
    </div>
  )
}
