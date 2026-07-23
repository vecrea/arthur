import { useEffect, useMemo, useState } from 'react'
import { EVENTS, toScy, scyLevel, formatTime, parseTime, LEVELS, STROKE_EN } from '../lib/convert.js'
import { loadTimes, saveTimes, loadSwimcloudUrl, saveSwimcloudUrl } from '../lib/storage.js'
import { parseSwimcloud } from '../lib/swimcloud.js'
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

  // --- Import SwimCloud (copier-coller) ---
  const [scOpen, setScOpen] = useState(false)
  const [scUrl, setScUrl] = useState(() => loadSwimcloudUrl())
  const [scCourse, setScCourse] = useState('LCM')
  const [scPaste, setScPaste] = useState('')
  const [scMsg, setScMsg] = useState('')
  useEffect(() => saveSwimcloudUrl(scUrl), [scUrl])

  const importSwimcloud = () => {
    const { matched, skipped } = parseSwimcloud(scPaste, scCourse)
    if (matched.length === 0) {
      setScMsg(t('Aucun temps reconnu. Colle le tableau « Best Times » de ton profil SwimCloud.', 'No times recognized. Paste the “Best Times” table from your SwimCloud profile.'))
      return
    }
    // Dédoublonnage contre l'état courant (synchronisé pour le message).
    const seen = new Set(times.map((it) => `${it.eventKey}|${it.course}|${Math.round(it.seconds * 100)}`))
    const extra = []
    for (const m of matched) {
      const k = `${m.eventKey}|${m.course}|${Math.round(m.seconds * 100)}`
      if (seen.has(k)) continue
      seen.add(k)
      extra.push({ id: `sc-${Date.now()}-${m.eventKey}-${Math.round(m.seconds * 100)}`, eventKey: m.eventKey, course: m.course, seconds: m.seconds, date: todayISO(), meet: 'SwimCloud' })
    }
    if (extra.length) setTimes((prev) => [...prev, ...extra])
    const added = extra.length
    const dup = matched.length - added
    setScMsg(
      t(
        `${added} temps importés${dup ? ` · ${dup} doublon(s) ignoré(s)` : ''}${skipped ? ` · ${skipped} épreuve(s) non suivie(s)` : ''}.`,
        `${added} times imported${dup ? ` · ${dup} duplicate(s) skipped` : ''}${skipped ? ` · ${skipped} untracked event(s)` : ''}.`,
      ),
    )
    setScPaste('')
  }

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
      <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-900/5">
        <h2 className="font-display text-xl font-extrabold text-navy-900">{t('Mes chronos', 'My times')}</h2>
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

      {/* Import SwimCloud (copier-coller) */}
      <div className="rounded-3xl bg-white shadow-card ring-1 ring-slate-900/5">
        <button
          onClick={() => setScOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-3 text-left"
        >
          <span className="font-display text-sm font-extrabold text-navy-900">{t('Importer mes temps (SwimCloud, SwimRankings…)', 'Import my times (SwimCloud, SwimRankings…)')}</span>
          <span className={'text-slate-400 transition ' + (scOpen ? 'rotate-180' : '')}>⌄</span>
        </button>
        {scOpen && (
          <div className="space-y-3 border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              {t(
                'Ces sites n’ont pas d’API publique : on importe par copier-coller. 1) Ouvre ton profil (SwimCloud, SwimRankings…) → 2) copie ton tableau de meilleurs temps → 3) colle-le ci-dessous. Marche aussi avec un CSV. À refaire quand tu veux pour te resynchroniser.',
                'These sites have no public API: import is via copy-paste. 1) Open your profile (SwimCloud, SwimRankings…) → 2) copy your best-times table → 3) paste it below. Works with a CSV too. Redo it anytime to resync.',
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                value={scUrl}
                onChange={(e) => setScUrl(e.target.value)}
                placeholder="https://www.swimcloud.com/swimmer/........"
                className={inputCls + ' min-w-0 flex-1'}
              />
              {scUrl.trim() && (
                <a
                  href={scUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-800"
                >
                  {t('Ouvrir mon profil ↗', 'Open my profile ↗')}
                </a>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">{t('Bassin de ces temps :', 'Course of these times:')}</span>
              <select value={scCourse} onChange={(e) => setScCourse(e.target.value)} className={inputCls}>
                <option value="LCM">50 m (LCM)</option>
                <option value="SCM">25 m (SCM)</option>
                <option value="SCY">Yards (SCY)</option>
              </select>
              <span className="text-[11px] text-slate-400">{t('(détecté par ligne si SwimCloud l’indique)', '(auto-detected per line when SwimCloud shows it)')}</span>
            </div>
            <textarea
              value={scPaste}
              onChange={(e) => setScPaste(e.target.value)}
              rows={5}
              placeholder={t('Colle ici ton tableau de meilleurs temps… ex : 100 Free  57.80  …', 'Paste your best-times table here… e.g. 100 Free  57.80  …')}
              className={inputCls + ' w-full font-mono text-xs'}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={importSwimcloud} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
                {t('Importer', 'Import')}
              </button>
              {scMsg && <span className="text-xs font-semibold text-slate-600">{scMsg}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Une case par épreuve (nage × distance), groupée par nage */}
      <div className="space-y-4">
        {EVENT_GROUPS.map((g) => (
          <div key={g.stroke} className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-900/5">
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

      <p className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-900/5">
        {t(
          'Astuce : note tes temps en grand bassin (50 m), petit bassin (25 m) ou yards — ils sont tous convertis en yards (SCY) pour suivre ta trajectoire vers les repères de l’onglet « Recrutable ? ». Clique sur une case pour la pré-sélectionner dans le formulaire ; le gros chiffre est ton record sur l’épreuve.',
          'Tip: log your times in long course (50 m), short course (25 m) or yards — they’re all converted to yards (SCY) to track your trajectory toward the benchmarks in the “Recruitable?” tab. Click a box to pre-select it in the form; the big number is your record in that event.',
        )}
      </p>
    </div>
  )
}
