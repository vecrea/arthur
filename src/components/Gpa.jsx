import { useEffect, useMemo, useState } from 'react'
import { computeGpa, bandFor, gradeInRange, gpaToLetter, mentionKey, GPA_BANDS } from '../lib/gpa.js'
import { loadGpaSubjects, saveGpaSubjects, loadGpaScale, saveGpaScale, loadProfileExtras, saveProfileExtras } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

const rid = () => 's' + Date.now() + Math.random().toString(36).slice(2, 6)
const blank = () => ({ id: rid(), name: '', grade: '' })

export default function Gpa() {
  const { t } = useLang()
  const [scale, setScale] = useState(() => loadGpaScale())
  const [subjects, setSubjects] = useState(() => {
    const s = loadGpaSubjects()
    return s.length ? s : [blank(), blank(), blank()]
  })
  const [msg, setMsg] = useState('')
  useEffect(() => saveGpaSubjects(subjects), [subjects])
  useEffect(() => saveGpaScale(scale), [scale])

  const isPct = scale === '100'
  const unit = isPct ? '%' : '/20'
  const rangeLabel = isPct ? '0–100%' : '0–20'
  const invalidCount = subjects.filter((s) => s.grade !== '' && !gradeInRange(s.grade, scale)).length

  const addRow = () => setSubjects((s) => [...s, blank()])
  const removeRow = (id) => setSubjects((s) => s.filter((x) => x.id !== id))
  const update = (id, patch) => setSubjects((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)))

  const result = useMemo(() => computeGpa(subjects, scale), [subjects, scale])

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

  const inputCls = 'w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-pool-500 focus:ring-2 focus:ring-pool-500/20'

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-900/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold text-navy-900">{t('Notes → GPA', 'Grades → GPA')}</h2>
            <p className="text-sm text-slate-500">
              {t(
                'Entre tes matières et notes belges. L’app estime ton GPA américain (sur 4.0), la lettre et la mention — moyenne simple de tes matières.',
                'Enter your subjects and Belgian grades. The app estimates your US GPA (out of 4.0), the letter grade and the honor — a simple average of your subjects.',
              )}
            </p>
          </div>
          <div>
            <div className="mb-1 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('Échelle de tes notes', 'Your grade scale')}</div>
            <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm font-semibold">
              {[['100', '%'], ['20', '/20']].map(([v, lab]) => (
                <button key={v} onClick={() => setScale(v)} className={'rounded-full px-4 py-1 transition ' + (scale === v ? 'bg-navy-900 text-white' : 'text-slate-500 hover:text-navy-900')}>
                  {lab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Résultat */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-900/5">
        <div className="grid gap-3 panel-dark p-5 text-white sm:grid-cols-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('GPA estimé (US)', 'Estimated GPA (US)')}</div>
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
        <div className="flex flex-wrap items-center gap-2 px-5 py-3">
          <button onClick={useInSheet} disabled={!result} className="rounded-full bg-flag-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-flag-600 disabled:opacity-50">
            {t('Utiliser dans ma fiche', 'Use in my athlete sheet')}
          </button>
          {msg && <span className="text-sm font-semibold text-emerald-700">{msg}</span>}
        </div>
      </div>

      {invalidCount > 0 && (
        <div className="rounded-xl bg-flag-100 p-3 text-sm font-semibold text-flag-600 ring-1 ring-flag-500/30">
          {t(
            `${invalidCount} note(s) hors barème (${rangeLabel}) — corrige-les, elles ne sont pas comptées dans la moyenne.`,
            `${invalidCount} grade(s) out of range (${rangeLabel}) — fix them, they are not counted in the average.`,
          )}
        </div>
      )}

      {/* Matières */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2 font-semibold">{t('Matière', 'Subject')}</th>
                <th className="w-28 px-3 py-2 font-semibold">{t('Note', 'Grade')} {unit}</th>
                <th className="w-24 px-3 py-2 font-semibold">GPA</th>
                <th className="w-8 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => {
                const bad = s.grade !== '' && !gradeInRange(s.grade, scale)
                const band = s.grade !== '' && !bad ? bandFor(s.grade, scale) : null
                return (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-3 py-1.5">
                      <input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} placeholder={t('ex. Mathématiques', 'e.g. Mathematics')} className={inputCls} />
                    </td>
                    <td className="px-3 py-1.5">
                      <input type="number" min="0" max={isPct ? 100 : 20} step={isPct ? 1 : 0.1} value={s.grade} onChange={(e) => update(s.id, { grade: e.target.value })} placeholder={isPct ? '75' : '15'} className={inputCls + (bad ? ' border-flag-500 ring-1 ring-flag-500/30' : '')} />
                    </td>
                    <td className="px-3 py-1.5">
                      {bad ? (
                        <span className="text-xs font-bold text-flag-600" title={t(`Hors barème (${rangeLabel})`, `Out of range (${rangeLabel})`)}>{t('hors barème', 'out of range')}</span>
                      ) : band ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="font-display font-extrabold text-navy-900">{band.gpa.toFixed(1)}</span>
                          <span className="rounded bg-slate-100 px-1.5 text-xs font-bold text-slate-600">{band.letter}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <button onClick={() => removeRow(s.id)} className="text-slate-300 transition hover:text-flag-500" title={t('Supprimer', 'Delete')} aria-label={t('Supprimer', 'Delete')}>✕</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-3 py-2">
          <button onClick={addRow} className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
            {t('+ Ajouter une matière', '+ Add a subject')}
          </button>
        </div>
      </div>

      {/* Barème */}
      <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-900/5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('Barème de conversion (indicatif)', 'Conversion scale (indicative)')}</p>
        <div className="flex flex-wrap gap-1.5">
          {GPA_BANDS.filter((b) => b.min > 0).map((b) => (
            <span key={b.letter} className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-900/5">
              ≥ <span className="font-bold text-navy-900">{isPct ? b.min * 5 + '%' : b.min + '/20'}</span> → <span className="font-bold text-pool-600">{b.gpa.toFixed(1)}</span> ({b.letter})
            </span>
          ))}
          <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-900/5">&lt; {isPct ? '50%' : '10/20'} → <span className="font-bold">0.0</span> (F)</span>
        </div>
      </div>

      <p className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-900/5">
        {t(
          'Conversion indicative : il n’existe pas de barème officiel unique (WES, NCAA Eligibility Center et chaque fac ont le leur). Utile pour te situer et remplir ta fiche, mais le GPA officiel sera recalculé par l’organisme d’évaluation à partir de tes relevés.',
          'Indicative conversion: there is no single official scale (WES, NCAA Eligibility Center and each school use their own). Useful to place yourself and fill your sheet, but the official GPA will be recomputed by the evaluator from your transcripts.',
        )}
      </p>
    </div>
  )
}
