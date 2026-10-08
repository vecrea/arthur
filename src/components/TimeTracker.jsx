import { useEffect, useMemo, useState } from 'react'
import { EVENTS, toScy, scyLevel, formatTime, parseTime, LEVELS, STROKE_EN } from '../lib/convert.js'
import { loadTimes, saveTimes, loadSwimcloudUrl, saveSwimcloudUrl } from '../lib/storage.js'
import { parseSwimcloud } from '../lib/swimcloud.js'
import { useLang } from '../lib/i18n.jsx'

const EV_BY_KEY = Object.fromEntries(EVENTS.map((e) => [e.key, e]))
const entryScy = (e) => toScy(e.seconds, EV_BY_KEY[e.eventKey].distance, e.course)

// Distinction claire des bassins : couleur + libellé par type de bassin.
const COURSE_ORDER = ['LCM', 'SCM', 'SCY']
const COURSE_INFO = {
  LCM: { short: '50 m', label: 'Grand bassin', labelEn: 'Long course', color: '#0e88d3' },
  SCM: { short: '25 m', label: 'Petit bassin', labelEn: 'Short course', color: '#7c3aed' },
  SCY: { short: 'yards', label: 'Yards', labelEn: 'Yards', color: '#d1971f' },
}

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

// 'YYYY-MM-DD' -> 'DD/MM/YYYY' (FR) ou 'MM/DD/YYYY' (US)
const fmtDMY = (d, en) => {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return en ? `${m}/${day}/${y}` : `${day}/${m}/${y}`
}

export default function TimeTracker({ profile }) {
  const { t, lang } = useLang()
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

  const [showAll, setShowAll] = useState(false)

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden">
        {/* Formulaire d'ajout */}
        <div className="p-5">
          <h2 className="font-display text-xl font-extrabold text-heading">{t('Mes chronos', 'My times')}</h2>
          <p className="text-sm text-secondary">
            {t(
              'Enregistre tes courses et suis ta progression vers la D1. Tout reste chez toi (navigateur).',
              'Log your races and track your progression toward D1. Everything stays on your device (browser).',
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
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field" />
            <input
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="27.46 / 1:07.39"
              className="field"
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
            className="field mt-2 w-full"
          />
          {err && <p className="mt-2 text-xs font-semibold text-flag-600 dark:text-flag-400">{err}</p>}
        </div>

        {/* Import SwimCloud (copier-coller) */}
        <div className="border-t border-hair">
          <button
            onClick={() => setScOpen((o) => !o)}
            className="flex w-full items-center justify-between px-5 py-3 text-left"
          >
            <span className="font-display text-sm font-extrabold text-heading">{t('Importer mes temps (SwimCloud, SwimRankings…)', 'Import my times (SwimCloud, SwimRankings…)')}</span>
            <span className={'text-tertiary transition ' + (scOpen ? 'rotate-180' : '')}>⌄</span>
          </button>
          {scOpen && (
            <div className="space-y-3 border-t border-hair px-5 py-4">
              <p className="text-xs text-secondary">
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
                  className="field min-w-0 flex-1"
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
                <span className="text-xs font-semibold text-secondary">{t('Bassin de ces temps :', 'Course of these times:')}</span>
                <select value={scCourse} onChange={(e) => setScCourse(e.target.value)} className="field">
                  <option value="LCM">50 m (LCM)</option>
                  <option value="SCM">25 m (SCM)</option>
                  <option value="SCY">Yards (SCY)</option>
                </select>
                <span className="text-[11px] text-tertiary">{t('(détecté par ligne si SwimCloud l’indique)', '(auto-detected per line when SwimCloud shows it)')}</span>
              </div>
              <textarea
                value={scPaste}
                onChange={(e) => setScPaste(e.target.value)}
                rows={5}
                placeholder={t('Colle ici ton tableau de meilleurs temps… ex : 100 Free  57.80  …', 'Paste your best-times table here… e.g. 100 Free  57.80  …')}
                className="field w-full font-mono text-xs"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={importSwimcloud} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
                  {t('Importer', 'Import')}
                </button>
                {scMsg && <span className="text-xs font-semibold text-primary">{scMsg}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Barre : titre + filtre des épreuves affichées */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hair px-5 py-3">
          <h3 className="font-display text-sm font-extrabold text-heading">{t('Mes temps par épreuve', 'My times by event')}</h3>
          <div className="inline-flex rounded-full surface-2 border border-hair p-1 text-xs font-semibold">
            <button onClick={() => setShowAll(false)} className={'rounded-full px-3 py-1 transition ' + (!showAll ? 'pill-active' : 'text-secondary hover:text-heading')}>{t('Avec temps', 'With times')}</button>
            <button onClick={() => setShowAll(true)} className={'rounded-full px-3 py-1 transition ' + (showAll ? 'pill-active' : 'text-secondary hover:text-heading')}>{t('Toutes', 'All')}</button>
          </div>
        </div>

        {/* Une case par épreuve (nage × distance), groupée par nage */}
        {EVENT_GROUPS.map((g) => {
          const items = showAll ? g.items : g.items.filter((e) => byEvent[e.key])
          if (!items.length) return null
          return (
          <div key={g.stroke} className="border-t border-hair p-4 sm:p-5">
            <h3 className="mb-3 font-display text-sm font-extrabold uppercase tracking-wide text-secondary">{t(g.stroke, STROKE_EN[g.stroke])}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((e) => {
                const list = byEvent[e.key]
                const selected = e.key === eventKey
                // Record par bassin (dans un même bassin, le plus petit temps = le meilleur).
                const byCourse = {}
                for (const it of list || []) (byCourse[it.course] = byCourse[it.course] || []).push(it)
                const records = COURSE_ORDER
                  .map((cv) => {
                    const arr = byCourse[cv]
                    return arr && arr.length ? { course: cv, best: arr.reduce((m, it) => (it.seconds < m.seconds ? it : m), arr[0]) } : null
                  })
                  .filter(Boolean)
                const bestIds = new Set(records.map((r) => r.best.id))
                // Record « global » (meilleur niveau, tous bassins confondus) pour le liseré.
                const overall = list ? list.reduce((m, it) => (it.scy < m.scy ? it : m), list[0]) : null
                const overallLvl = overall ? scyLevel(overall.scy, e.key) : 0
                return (
                  <div
                    key={e.key}
                    onClick={() => setEventKey(e.key)}
                    title={t(`Choisir « ${e.label} » dans le formulaire`, `Select “${e.labelEn}” in the form`)}
                    className={
                      'cursor-pointer overflow-hidden rounded-2xl border transition ' +
                      (selected ? 'border-pool-500 ring-2 ring-pool-500/20 ' : 'border-hair hover:border-pool-300 hover:shadow-card ') +
                      (overall ? 'surface' : 'surface-2')
                    }
                  >
                    {/* liseré coloré = niveau de recrutement de l'épreuve (meilleur bassin) */}
                    <div className="h-1.5 w-full" style={{ background: overall ? LEVELS[overallLvl].color : 'var(--border)' }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display text-base font-extrabold text-heading">{t(e.label, e.labelEn)}</span>
                        {overall && (
                          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: LEVELS[overallLvl].color }}>
                            {t(LEVELS[overallLvl].short, LEVELS[overallLvl].shortEn)}
                          </span>
                        )}
                      </div>

                      {overall ? (
                        <>
                          {/* Record par bassin — distinction claire Grand bassin / Petit bassin */}
                          <div className="mt-3 space-y-1.5">
                            {records.map((r) => {
                              const ci = COURSE_INFO[r.course] || COURSE_INFO.LCM
                              const lvl = scyLevel(entryScy(r.best), e.key)
                              return (
                                <div key={r.course} className="flex items-center gap-2">
                                  <span className="inline-flex w-14 shrink-0 justify-center rounded-md py-0.5 text-[10px] font-extrabold text-white" style={{ background: ci.color }}>
                                    {ci.short}
                                  </span>
                                  <span className="truncate text-xs font-medium text-secondary">{t(ci.label, ci.labelEn)}</span>
                                  <span className="ml-auto font-display text-lg font-black tabular-nums text-heading">{formatTime(r.best.seconds)}</span>
                                  <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold text-white" style={{ background: LEVELS[lvl].color }}>
                                    {t(LEVELS[lvl].short, LEVELS[lvl].shortEn)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>

                          {/* Historique complet — pastille de bassin colorée sur chaque ligne */}
                          <ul className="mt-3 space-y-0.5 border-t border-hair pt-2.5">
                            {[...list].reverse().map((it) => {
                              const ci = COURSE_INFO[it.course] || COURSE_INFO.LCM
                              const isBest = bestIds.has(it.id)
                              return (
                                <li key={it.id} className={'flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs ' + (isBest ? 'bg-accent-soft' : '')}>
                                  <span className="min-w-0 truncate">
                                    <span className="mr-1.5 inline-block w-11 rounded text-center text-[9px] font-bold text-white" style={{ background: ci.color }}>{ci.short}</span>
                                    <span className={'font-bold ' + (isBest ? 'text-accent' : 'text-heading')}>{formatTime(it.seconds)}</span>
                                    <span className="ml-1.5 text-tertiary">{fmtDMY(it.date, lang === 'en')}{it.meet ? ` · ${it.meet}` : ''}</span>
                                  </span>
                                  <button
                                    onClick={(ev) => { ev.stopPropagation(); remove(it.id) }}
                                    className="shrink-0 text-tertiary transition hover:text-flag-500"
                                    title={t('Supprimer', 'Delete')}
                                    aria-label={t('Supprimer', 'Delete')}
                                  >
                                    ✕
                                  </button>
                                </li>
                              )
                            })}
                          </ul>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-tertiary">{t('— pas de temps', '— no time')}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          )
        })}
      </div>

      <p className="px-1 text-xs text-secondary">
        {t(
          'Astuce : chaque épreuve affiche ton record par bassin — Grand bassin (50 m, bleu) et Petit bassin (25 m, violet) sont séparés car non comparables directement. Par défaut on n’affiche que les épreuves où tu as un temps — bascule sur « Toutes » pour les voir toutes. Clique sur une case pour la pré-sélectionner dans le formulaire.',
          'Tip: each event shows your record per course — Long course (50 m, blue) and Short course (25 m, purple) are kept separate since they’re not directly comparable. By default only events with a time are shown — switch to “All” to see them all. Click a box to pre-select it in the form.',
        )}
      </p>
    </div>
  )
}
