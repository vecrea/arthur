import { useEffect, useMemo, useState } from 'react'
import { computeGpa, bandFor, gradeInRange, gpaToLetter, mentionKey, GPA_BANDS, NCAA_GRADE_POINTS, NCAA_TIERS } from '../lib/gpa.js'
import { loadGpaSubjects, saveGpaSubjects, loadGpaScale, saveGpaScale, loadProfileExtras, saveProfileExtras } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'
import { PageHeader } from './ui/Page.jsx'

// ---------------------------------------------------------------------------
// Catégories core course NCAA + catalogue des matières ÉLIGIBLES. Seules ces
// matières peuvent entrer dans le calcul (le sport, la religion, les options
// techniques/pro, l'informatique et les arts ne comptent pas, donc ils ne sont
// pas dans le catalogue). base:true = cours réels d'Arthur (horaire), pré-remplis
// et verrouillés (non supprimables). Les autres s'ajoutent via le menu.
// ---------------------------------------------------------------------------
const AREAS = {
  english: { fr: '« English » (langue des cours)', en: '“English” (teaching language)', color: '#1273b8' },
  foreign: { fr: 'Langue étrangère', en: 'Foreign language', color: '#3a3f7a' },
  math: { fr: 'Maths', en: 'Math', color: '#1d7a4d' },
  science: { fr: 'Sciences', en: 'Science', color: '#0e7490' },
  social: { fr: 'Sciences sociales', en: 'Social science', color: '#6f63a0' },
  additional: { fr: 'Au choix (philo)', en: 'Additional (philosophy)', color: '#b45309' },
}

const CATALOG = [
  { key: 'NE', fr: 'Néerlandais', en: 'Dutch', area: 'english', base: true, aliases: ['neerlandais', 'nederlands', 'dutch'] },
  { key: 'EN', fr: 'Anglais', en: 'English', area: 'foreign', base: true, aliases: ['anglais', 'english', 'engels'] },
  { key: 'FR', fr: 'Français', en: 'French', area: 'foreign', base: true, aliases: ['francais', 'french', 'frans'] },
  { key: 'DU', fr: 'Allemand', en: 'German', area: 'foreign', base: true, aliases: ['allemand', 'german', 'duits'] },
  { key: 'WI', fr: 'Mathématiques', en: 'Mathematics', area: 'math', base: true, aliases: ['mathematiques', 'maths', 'math', 'wiskunde'] },
  { key: 'NW', fr: 'Sciences', en: 'Science', area: 'science', base: true, aliases: ['sciences', 'science', 'natuurwetenschappen'] },
  { key: 'GE', fr: 'Histoire', en: 'History', area: 'social', base: true, aliases: ['histoire', 'history', 'geschiedenis'] },
  { key: 'AA', fr: 'Géographie', en: 'Geography', area: 'social', base: true, aliases: ['geographie', 'geography', 'aardrijkskunde'] },
  { key: 'EC', fr: 'Économie', en: 'Economics', area: 'social', base: true, aliases: ['economie', 'economics', 'eco'] },
  // Ajoutables (matières éligibles supplémentaires) :
  { key: 'LA', fr: 'Latin', en: 'Latin', area: 'foreign', aliases: ['latin', 'latijn'] },
  { key: 'GR', fr: 'Grec', en: 'Greek', area: 'foreign', aliases: ['grec', 'greek', 'grieks'] },
  { key: 'ES', fr: 'Espagnol', en: 'Spanish', area: 'foreign', aliases: ['espagnol', 'spanish', 'spaans'] },
  { key: 'IT', fr: 'Italien', en: 'Italian', area: 'foreign', aliases: ['italien', 'italian', 'italiaans'] },
  { key: 'PH', fr: 'Philosophie', en: 'Philosophy', area: 'additional', aliases: ['philosophie', 'philosophy', 'filosofie', 'philo'] },
  { key: 'PHY', fr: 'Physique', en: 'Physics', area: 'science', aliases: ['physique', 'physics', 'fysica'] },
  { key: 'CHI', fr: 'Chimie', en: 'Chemistry', area: 'science', aliases: ['chimie', 'chemistry', 'chemie'] },
  { key: 'BIO', fr: 'Biologie', en: 'Biology', area: 'science', aliases: ['biologie', 'biology'] },
]
const BASE_KEYS = CATALOG.filter((c) => c.base).map((c) => c.key)
const byKey = (k) => CATALOG.find((c) => c.key === k)
const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const keyFromName = (name) => {
  const n = norm(name)
  if (!n) return null
  const c = CATALOG.find((x) => x.aliases.includes(n) || norm(x.fr) === n || norm(x.en) === n)
  return c ? c.key : null
}

// Lignes initiales : les cours de base (verrouillés) + toute matière éligible déjà
// enregistrée, en récupérant les notes saisies auparavant (migration par nom).
function initRows() {
  let saved = []
  try { saved = loadGpaSubjects() || [] } catch { saved = [] }
  const grades = {}
  const extra = []
  for (const s of saved) {
    const k = s.key || keyFromName(s.name)
    if (!k) continue
    if (grades[k] == null) grades[k] = s.grade ?? ''
    if (!BASE_KEYS.includes(k) && !extra.includes(k)) extra.push(k)
  }
  return [...BASE_KEYS, ...extra].map((k) => ({ key: k, grade: grades[k] ?? '' }))
}

// ---------------------------------------------------------------------------
// Les « core courses » NCAA : les matières académiques retenues par l'Eligibility
// Center pour le GPA officiel. (International Student-Athlete Handbook.)
// ---------------------------------------------------------------------------
function CoreCoursesCard() {
  const { t } = useLang()
  const d1 = [
    ['Anglais', '4 ans', 'English', '4 yrs'],
    ['Maths (algèbre ou +)', '3 ans', 'Math (algebra+)', '3 yrs'],
    ['Sciences (dont 1 labo)', '2 ans', 'Science (incl. 1 lab)', '2 yrs'],
    ['Anglais / maths / sciences', '+1 an', 'English / math / science', '+1 yr'],
    ['Sciences sociales', '2 ans', 'Social science', '2 yrs'],
    ['Au choix (dont langue étrangère)', '4 ans', 'Additional (incl. foreign language)', '4 yrs'],
  ]
  const facts = [
    ['GPA minimum sur ces cours', '2.3 (D1) · 2.2 (D2) — pas la moyenne de toutes tes notes.', 'Minimum GPA on these courses', '2.3 (D1) · 2.2 (D2) — not the average of all your grades.'],
    ['Règle 10/7 (D1)', '10 des 16 cours finis avant la dernière année, dont 7 en anglais/maths/sciences, puis verrouillés.', '10/7 rule (D1)', '10 of the 16 done before your final year, 7 of them in English/math/science, then locked.'],
    ['Tests SAT / ACT', 'Non obligatoires depuis 2023 — tout repose sur les core courses.', 'SAT / ACT tests', 'Not required since 2023 — everything rests on the core courses.'],
    ['Tes langues', 'Néerlandais, allemand, français comptent comme « langue étrangère ».', 'Your languages', 'Dutch, German, French count as “foreign language”.'],
  ]
  return (
    <section className="panel p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Les core courses NCAA', 'NCAA core courses')}</p>
      <p className="mb-4 text-sm text-secondary">{t('Les matières académiques que le NCAA Eligibility Center retient pour calculer ton GPA officiel. Le sport et les options non-académiques ne comptent pas.', 'The academic subjects the NCAA Eligibility Center keeps to compute your official GPA. Sport and non-academic electives don’t count.')}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-tertiary">{t('16 cours exigés (Division I)', '16 required courses (Division I)')}</span>
            <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-white">16</span>
          </div>
          <ul className="overflow-hidden rounded-xl surface-2 border border-hair">
            {d1.map((r) => (
              <li key={r[0]} className="flex items-center justify-between gap-3 border-t border-hair px-3 py-2 first:border-t-0">
                <span className="text-sm text-primary">{t(r[0], r[2])}</span>
                <span className="shrink-0 rounded-md surface-3 px-2 py-0.5 text-xs font-bold text-heading">{t(r[1], r[3])}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[11px] text-tertiary">{t('Division II : 16 cours aussi, répartis autrement (3 anglais, 2 maths, 2 sciences, 3 en +, 2 sociales, 4 libres).', 'Division II: also 16 courses, split differently (3 English, 2 math, 2 science, 3 more, 2 social, 4 free).')}</p>
        </div>
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-tertiary">{t('À retenir', 'Key points')}</div>
          <dl className="space-y-2.5">
            {facts.map((f) => (
              <div key={f[0]} className="rounded-xl surface-2 border border-hair p-3">
                <dt className="text-sm font-semibold text-heading">{t(f[0], f[2])}</dt>
                <dd className="mt-0.5 text-xs text-secondary">{t(f[1], f[3])}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-pool-500/10 p-4 ring-1 ring-pool-500/25">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-accent">{t('Pour un élève belge', 'For a Belgian student')}</div>
        <p className="text-sm text-primary">{t('Tu ne choisis pas tes core courses : l’Eligibility Center prend ton bulletin belge (filière générale) et mappe chaque matière académique sur ce tableau, selon le barème propre à la Belgique. Le non-académique (éducation physique, options techniques) n’est pas compté.', 'You don’t pick your core courses: the Eligibility Center takes your Belgian report card (general track) and maps each academic subject onto this table, using Belgium-specific standards. Non-academic subjects (PE, technical electives) are not counted.')}</p>
      </div>
    </section>
  )
}

export default function Gpa() {
  const { t } = useLang()
  const [scale, setScale] = useState(() => loadGpaScale())
  const [rows, setRows] = useState(initRows)
  const [years, setYears] = useState(() => {
    try { return loadProfileExtras().courseYears || {} } catch { return {} }
  })
  const [pick, setPick] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const toSave = rows.map((r) => ({ id: r.key, key: r.key, name: byKey(r.key)?.fr || r.key, grade: r.grade }))
    saveGpaSubjects(toSave)
  }, [rows])
  useEffect(() => saveGpaScale(scale), [scale])

  const isPct = scale === '100'
  const unit = isPct ? '%' : '/20'
  const rangeLabel = isPct ? '0–100%' : '0–20'
  const invalidCount = rows.filter((r) => r.grade !== '' && !gradeInRange(r.grade, scale)).length

  const setGrade = (key, grade) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, grade } : r)))
  const removeRow = (key) => setRows((rs) => rs.filter((r) => r.key !== key))
  const addKey = (key) => {
    if (!key) return
    setRows((rs) => (rs.some((r) => r.key === key) ? rs : [...rs, { key, grade: '' }]))
  }
  const setYear = (key, v) =>
    setYears((prev) => {
      const next = { ...prev }
      if (v === '') delete next[key]
      else next[key] = v
      try { const ex = loadProfileExtras(); saveProfileExtras({ ...ex, courseYears: next }) } catch { /* ignore */ }
      return next
    })

  const available = CATALOG.filter((c) => !rows.some((r) => r.key === c.key))
  const result = useMemo(() => computeGpa(rows.map((r) => ({ grade: r.grade })), scale), [rows, scale])

  const MENTIONS = {
    summa: t('La plus grande distinction', 'Highest honors'),
    magna: t('Grande distinction', 'Great distinction'),
    cum: t('Distinction', 'Distinction'),
    satis: t('Satisfaction', 'Satisfactory'),
    pass: t('Réussite', 'Pass'),
    fail: t('Échec', 'Fail'),
  }

  const useInSheet = () => {
    if (!result) return
    const extras = loadProfileExtras()
    saveProfileExtras({ ...extras, average: `${result.gpa.toFixed(2)} / 4.0 (${result.avgNative.toFixed(isPct ? 0 : 1)}${unit})` })
    setMsg(t('GPA copié dans « Ma fiche ».', 'GPA copied to “My sheet”.'))
    setTimeout(() => setMsg(''), 2500)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon="cap"
        title={t('Notes → GPA', 'Grades → GPA')}
        subtitle={t(
          'Tes cours éligibles NCAA sont déjà là (verrouillés). Entre tes notes belges → l’app estime ton GPA « core courses » (sur 4.0). Tu peux ajouter d’autres matières éligibles.',
          'Your NCAA-eligible courses are already here (locked). Enter your Belgian grades → the app estimates your “core-course” GPA (out of 4.0). You can add more eligible subjects.',
        )}
        action={
          <div>
            <div className="mb-1 text-right text-[11px] font-semibold uppercase tracking-wide text-tertiary">{t('Échelle de tes notes', 'Your grade scale')}</div>
            <div className="inline-flex rounded-full surface-2 border border-hair p-1 text-sm font-semibold">
              {[['100', '%'], ['20', '/20']].map(([v, lab]) => (
                <button key={v} onClick={() => setScale(v)} className={'rounded-full px-4 py-1 transition ' + (scale === v ? 'pill-active' : 'text-secondary hover:text-heading')}>
                  {lab}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Résultat — carte sombre */}
      <section className="panel overflow-hidden">
        <div className="panel-dark grain relative overflow-hidden p-5 text-white">
          <div className="relative z-10 grid gap-3 sm:grid-cols-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('GPA core courses (est.)', 'Core-course GPA (est.)')}</div>
              <div className="font-display text-4xl font-black text-spark-400">{result ? result.gpa.toFixed(2) : '—'}<span className="text-lg text-white/50"> / 4.0</span></div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Moyenne', 'Average')}</div>
              <div className="mt-1 font-display text-2xl font-black">{result ? result.avgNative.toFixed(isPct ? 0 : 1) : '—'}<span className="text-sm text-white/50"> {unit}</span></div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Lettre', 'Letter')}</div>
              <div className="mt-1 font-display text-2xl font-black">{result ? gpaToLetter(result.gpa) : '—'}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Mention', 'Honor')}</div>
              <div className="mt-1 text-sm font-bold">{result ? MENTIONS[mentionKey(result.avg20)] : '—'}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-5 py-3">
          <button onClick={useInSheet} disabled={!result} className="rounded-full bg-flag-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-flag-600 disabled:opacity-50">
            {t('Utiliser dans ma fiche', 'Use in my athlete sheet')}
          </button>
          {msg && <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{msg}</span>}
        </div>
      </section>

      {invalidCount > 0 && (
        <section className="panel p-5">
            <div className="rounded-xl bg-flag-500/15 p-3 text-sm font-semibold text-flag-600 ring-1 ring-flag-500/30 dark:text-flag-400">
              {t(
                `${invalidCount} note(s) hors barème (${rangeLabel}) — corrige-les, elles ne sont pas comptées dans la moyenne.`,
                `${invalidCount} grade(s) out of range (${rangeLabel}) — fix them, they are not counted in the average.`,
              )}
            </div>
        </section>
        )}

        {/* Mes cours éligibles (verrouillés) + notes + années */}
        <section className="panel overflow-hidden">
          <div className="border-b border-hair px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Mes core courses', 'My core courses')}</p>
            <p className="mt-0.5 text-xs text-secondary">{t('Matière et catégorie NCAA verrouillées (c’est la règle). Tu remplis ta note et le nombre d’années. Seuls des cours éligibles peuvent être ajoutés.', 'Subject and NCAA area are locked (that’s the rule). You fill in your grade and the number of years. Only eligible courses can be added.')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-tertiary">
                  <th className="px-3 py-2 font-semibold">{t('Matière', 'Subject')}</th>
                  <th className="px-3 py-2 font-semibold">{t('Catégorie NCAA', 'NCAA area')}</th>
                  <th className="px-3 py-2 font-semibold">{t('Note', 'Grade')} {unit}</th>
                  <th className="w-20 px-3 py-2 font-semibold">{t('Années', 'Years')}</th>
                  <th className="w-8 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const c = byKey(r.key)
                  if (!c) return null
                  const area = AREAS[c.area]
                  const bad = r.grade !== '' && !gradeInRange(r.grade, scale)
                  const band = r.grade !== '' && !bad ? bandFor(r.grade, scale) : null
                  return (
                    <tr key={r.key} className="border-t border-hair">
                      <td className="px-3 py-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="font-semibold text-heading">{t(c.fr, c.en)}</span>
                          <span className="rounded bg-navy-900 px-1.5 text-[10px] font-bold text-white">{c.key}</span>
                          {c.base && <LockIcon />}
                        </span>
                      </td>
                      <td className="px-3 py-1.5">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: area.color }} />
                          <span className="text-primary">{t(area.fr, area.en)}</span>
                        </span>
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" max={isPct ? 100 : 20} step={isPct ? 1 : 0.1} value={r.grade} onChange={(e) => setGrade(r.key, e.target.value)} placeholder={isPct ? '75' : '15'} className={'field w-20 px-2 py-1.5' + (bad ? ' border-flag-500 ring-1 ring-flag-500/30' : '')} />
                          {bad ? (
                            <span className="text-[11px] font-bold text-flag-600 dark:text-flag-400">{t('hors barème', 'out of range')}</span>
                          ) : band ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px]">
                              <span className="font-display font-extrabold text-heading">{band.gpa.toFixed(1)}</span>
                              <span className="rounded surface-3 px-1.5 font-bold text-secondary">{band.letter}</span>
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" min="0" max="7" value={years[r.key] ?? ''} onChange={(e) => setYear(r.key, e.target.value)} placeholder="—" className="field w-16 px-2 py-1.5" />
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {c.base ? (
                          <span className="text-tertiary/50" title={t('Cours verrouillé', 'Locked course')}>—</span>
                        ) : (
                          <button onClick={() => removeRow(r.key)} className="text-tertiary transition hover:text-flag-500" title={t('Supprimer', 'Delete')} aria-label={t('Supprimer', 'Delete')}>✕</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-hair px-3 py-2">
            {available.length > 0 ? (
              <>
                <label className="text-xs font-semibold text-secondary">{t('Ajouter un cours éligible :', 'Add an eligible subject:')}</label>
                <select
                  value={pick}
                  onChange={(e) => { addKey(e.target.value); setPick('') }}
                  className="field w-auto px-3 py-1.5"
                >
                  <option value="" disabled>{t('— choisir —', '— choose —')}</option>
                  {Object.keys(AREAS).map((areaKey) => {
                    const opts = available.filter((c) => c.area === areaKey)
                    if (!opts.length) return null
                    return (
                      <optgroup key={areaKey} label={t(AREAS[areaKey].fr, AREAS[areaKey].en)}>
                        {opts.map((c) => (
                          <option key={c.key} value={c.key}>{t(c.fr, c.en)}</option>
                        ))}
                      </optgroup>
                    )
                  })}
                </select>
              </>
            ) : (
              <span className="text-xs text-tertiary">{t('Tous les cours éligibles sont déjà là.', 'All eligible subjects are already here.')}</span>
            )}
          </div>
          <div className="border-t border-hair px-4 py-2.5">
            <p className="text-[11px] text-tertiary">{t('Minimums NCAA (D1) : « English » 4 ans · Maths 3 · Sciences 2 · Sciences sociales 2 · +1 · +4 au choix (dont langue étrangère) — 16 au total. Religion et éducation physique ne comptent pas (donc non proposées).', 'NCAA minimums (D1): “English” 4 yrs · Math 3 · Science 2 · Social science 2 · +1 · +4 additional (incl. foreign language) — 16 total. Religion and physical education don’t count (so they aren’t offered).')}</p>
          </div>
        </section>

        {/* Barème */}
        <section className="panel p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Barème de conversion (indicatif)', 'Conversion scale (indicative)')}</p>
          <div className="flex flex-wrap gap-1.5">
            {GPA_BANDS.filter((b) => b.min > 0).map((b) => (
              <span key={b.letter} className="rounded-lg surface-3 border border-hair px-2.5 py-1 text-xs text-primary">
                ≥ <span className="font-bold text-heading">{isPct ? b.min * 5 + '%' : b.min + '/20'}</span> → <span className="font-bold text-accent">{b.gpa.toFixed(1)}</span> ({b.letter})
              </span>
            ))}
            <span className="rounded-lg surface-3 border border-hair px-2.5 py-1 text-xs text-primary">&lt; {isPct ? '50%' : '10/20'} → <span className="font-bold">0.0</span> (F)</span>
          </div>
        </section>

        {/* Table officielle NCAA (Grade-Point Values) — référence du handbook */}
        <section className="panel p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Table officielle NCAA (Grade-Point Values)', 'Official NCAA grade-point values')}</p>
          <p className="mb-3 text-xs text-secondary">{t('Référence du handbook NCAA : chaque lettre vaut un nombre de points fixe (de A = 4.000 à F = 0.000).', 'NCAA handbook reference: each letter is worth a fixed number of points (A = 4.000 down to F = 0.000).')}</p>
          <div className="space-y-2">
            {['superior', 'above', 'average', 'below', 'failing'].map((tier) => (
              <div key={tier} className="flex flex-wrap items-center gap-2">
                <span className="w-full text-xs font-semibold text-secondary sm:w-52 sm:shrink-0">{t(NCAA_TIERS[tier].fr, NCAA_TIERS[tier].en)}</span>
                <div className="flex flex-wrap gap-1.5">
                  {NCAA_GRADE_POINTS.filter((g) => g.tier === tier).map((g) => (
                    <span key={g.letter} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ background: g.color }}>
                      {g.letter} <span className="font-display tabular-nums">{g.gpa.toFixed(3)}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <CoreCoursesCard />

      <p className="px-1 text-xs text-secondary">
        {t(
          'Conversion indicative : il n’existe pas de barème officiel unique (WES, NCAA Eligibility Center et chaque fac ont le leur). Utile pour te situer et remplir ta fiche, mais le GPA officiel NCAA est recalculé par le Eligibility Center à partir de tes seules matières « core courses » (pas toutes tes notes).',
          'Indicative conversion: there is no single official scale (WES, NCAA Eligibility Center and each school use their own). Useful to place yourself and fill your sheet, but the official NCAA GPA is recomputed by the Eligibility Center from your “core courses” only (not all your grades).',
        )}
      </p>
    </div>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 text-tertiary" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}
