import { useEffect, useMemo, useState } from 'react'
import { CHECKLIST, CHECKLIST_AS_OF, CHECKLIST_AS_OF_EN, ROADMAP } from '../data/checklist.js'
import { loadChecklist, saveChecklist } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

const ALL_IDS = CHECKLIST.flatMap((p) => p.items.map((i) => i.id))

function Roadmap() {
  const { t } = useLang()
  const today = new Date().toISOString().slice(0, 10)
  const nextIdx = ROADMAP.findIndex((m) => m.iso >= today)
  return (
    <div className="overflow-hidden rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-900/5">
      <h3 className="font-display text-lg font-extrabold text-navy-900">{t('Ta roadmap jusqu’à la rentrée 2028', 'Your roadmap to the 2028 start')}</h3>
      <p className="text-sm text-slate-500">{t('Les grandes étapes datées, calées sur le calendrier NCAA et visa.', 'The key dated milestones, aligned with the NCAA and visa calendar.')}</p>
      <ol className="mt-4 space-y-0">
        {ROADMAP.map((m, i) => {
          const past = nextIdx === -1 ? true : i < nextIdx
          const current = i === nextIdx
          const last = i === ROADMAP.length - 1
          return (
            <li key={m.iso} className="relative flex gap-3 pb-5 last:pb-0">
              {!last && <span className="absolute left-[15px] top-7 h-full w-0.5" style={{ background: past ? '#10b981' : '#e2e8f0' }} />}
              <span
                className={
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 ' +
                  (past ? 'bg-emerald-500 text-white ring-emerald-200' : current ? 'bg-spark-500 text-white ring-spark-300' : 'bg-slate-100 text-slate-500 ring-slate-200')
                }
              >
                {i + 1}
              </span>
              <div className={'min-w-0 flex-1 ' + (past ? 'opacity-60' : '')}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-pool-600">{t(m.date, m.dateEn)}</span>
                  {current && <span className="rounded-full bg-spark-500 px-2 py-0.5 text-[10px] font-bold text-white">{t('Tu es ici', 'You are here')}</span>}
                </div>
                <p className="font-semibold text-navy-900">{t(m.title, m.titleEn)}</p>
                <p className="text-sm text-slate-600">{t(m.detail, m.detailEn)}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function Steps() {
  const { t } = useLang()
  const [done, setDone] = useState(() => loadChecklist())
  useEffect(() => saveChecklist(done), [done])

  const toggle = (id) =>
    setDone((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const doneCount = useMemo(() => ALL_IDS.filter((id) => done.has(id)).length, [done])
  const pct = Math.round((doneCount / ALL_IDS.length) * 100)

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-900/5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-900">{t('Tes démarches — Road to 2028', 'Your steps — Road to 2028')}</h2>
            <p className="text-sm text-slate-500">{t('NCAA, tests, candidatures, visa. Coche au fur et à mesure', 'NCAA, tests, applications, visa. Check them off as you go')}</p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-black text-pool-600">{pct}%</div>
            <div className="text-xs text-slate-400">{doneCount}/{ALL_IDS.length} {t('faites', 'done')}</div>
          </div>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-pool-500 to-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Roadmap />

      {CHECKLIST.map((phase) => {
        const phaseDone = phase.items.filter((i) => done.has(i.id)).length
        return (
          <div key={phase.title} className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="font-display font-extrabold text-navy-900">{t(phase.title, phase.titleEn)}</h3>
              <span className="text-xs font-semibold text-slate-400">{phaseDone}/{phase.items.length}</span>
            </div>
            <ul>
              {phase.items.map((it) => {
                const checked = done.has(it.id)
                return (
                  <li key={it.id} className="border-b border-slate-50 last:border-0">
                    <div className="flex items-start gap-3 px-4 py-3">
                      <button
                        onClick={() => toggle(it.id)}
                        aria-label={checked ? t('Décocher', 'Uncheck') : t('Cocher', 'Check')}
                        className={
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold text-white transition ' +
                          (checked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white hover:border-pool-500')
                        }
                      >
                        {checked && '✓'}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={'font-semibold ' + (checked ? 'text-slate-400 line-through' : 'text-navy-900')}>
                            {t(it.title, it.titleEn)}
                          </span>
                          {it.tag && <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-white">{it.tag}</span>}
                        </div>
                        <p className={'mt-0.5 text-sm ' + (checked ? 'text-slate-400' : 'text-slate-600')}>{t(it.detail, it.detailEn)}</p>
                        {it.link && (
                          <a
                            href={it.link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs font-semibold text-pool-600 hover:underline"
                          >
                            {t(it.link.label, it.link.labelEn || it.link.label)} ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}

      <p className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-900/5">
        {t(
          `Guide indicatif (vérifié ${CHECKLIST_AS_OF}) pour un nageur international visant l'automne 2028. Les dates et frais changent — confirme toujours sur les liens officiels (NCAA, visa).`,
          `Indicative guide (verified ${CHECKLIST_AS_OF_EN}) for an international swimmer targeting fall 2028. Dates and fees change — always confirm on the official links (NCAA, visa).`,
        )}
      </p>
    </div>
  )
}
