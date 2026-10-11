import { useEffect, useMemo, useState } from 'react'
import { CHECKLIST, CHECKLIST_AS_OF, CHECKLIST_AS_OF_EN, ROADMAP } from '../data/checklist.js'
import { loadChecklist, saveChecklist } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'
import { PageHeader } from './ui/Page.jsx'

const ALL_IDS = CHECKLIST.flatMap((p) => p.items.map((i) => i.id))

function Roadmap() {
  const { t } = useLang()
  const today = new Date().toISOString().slice(0, 10)
  const nextIdx = ROADMAP.findIndex((m) => m.iso >= today)
  return (
    <section className="panel p-5">
      <h3 className="font-display text-lg font-extrabold text-heading">{t('Ta roadmap jusqu’à la rentrée 2028', 'Your roadmap to the 2028 start')}</h3>
      <p className="text-sm text-secondary">{t('Les grandes étapes datées, calées sur le calendrier NCAA et visa.', 'The key dated milestones, aligned with the NCAA and visa calendar.')}</p>
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
                  (past ? 'bg-emerald-500 text-white ring-emerald-200' : current ? 'bg-spark-500 text-white ring-spark-300' : 'surface-3 text-secondary ring-slate-200')
                }
              >
                {i + 1}
              </span>
              <div className={'min-w-0 flex-1 ' + (past ? 'opacity-60' : '')}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-accent">{t(m.date, m.dateEn)}</span>
                  {current && <span className="rounded-full bg-spark-500 px-2 py-0.5 text-[10px] font-bold text-white">{t('Tu es ici', 'You are here')}</span>}
                </div>
                <p className="font-semibold text-heading">{t(m.title, m.titleEn)}</p>
                <p className="text-sm text-primary">{t(m.detail, m.detailEn)}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
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
    <div className="space-y-4">
      <PageHeader
        icon="steps"
        title={t('Tes démarches — Road to 2028', 'Your steps — Road to 2028')}
        subtitle={t('NCAA, tests, candidatures, visa. Coche au fur et à mesure', 'NCAA, tests, applications, visa. Check them off as you go')}
      />

      {/* Avancement global — carte sombre */}
      <section className="panel-dark grain relative overflow-hidden p-5 text-white">
        <div className="relative z-10">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-4xl font-black tracking-tight text-spark-400">{pct}%</span>
            <span className="text-sm text-white/70">{doneCount}/{ALL_IDS.length} {t('faites', 'done')}</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-pool-500 to-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </section>

      <Roadmap />

      {CHECKLIST.map((phase) => {
        const phaseDone = phase.items.filter((i) => done.has(i.id)).length
        return (
          <section key={phase.title} className="panel overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="font-display font-extrabold text-heading">{t(phase.title, phase.titleEn)}</h3>
              <span className="text-xs font-semibold text-tertiary">{phaseDone}/{phase.items.length}</span>
            </div>
            <ul className="row-list border-t border-hair">
              {phase.items.map((it) => {
                const checked = done.has(it.id)
                return (
                  <li key={it.id}>
                    <div className="flex items-start gap-3 px-4 py-3">
                      <button
                        onClick={() => toggle(it.id)}
                        aria-label={checked ? t('Décocher', 'Uncheck') : t('Cocher', 'Check')}
                        className={
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold text-white transition ' +
                          (checked ? 'border-emerald-500 bg-emerald-500' : 'border-hair-strong surface hover:border-pool-500')
                        }
                      >
                        {checked && '✓'}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={'font-semibold ' + (checked ? 'text-tertiary line-through' : 'text-heading')}>
                            {t(it.title, it.titleEn)}
                          </span>
                          {it.tag && <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-white">{it.tag}</span>}
                        </div>
                        <p className={'mt-0.5 text-sm ' + (checked ? 'text-tertiary' : 'text-primary')}>{t(it.detail, it.detailEn)}</p>
                        {it.link && (
                          <a
                            href={it.link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs font-semibold text-accent hover:underline"
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
          </section>
        )
      })}

      <p className="px-1 text-xs text-secondary">
        {t(
          `Guide indicatif (vérifié ${CHECKLIST_AS_OF}) pour un nageur international visant l'automne 2028. Les dates et frais changent — confirme toujours sur les liens officiels (NCAA, visa).`,
          `Indicative guide (verified ${CHECKLIST_AS_OF_EN}) for an international swimmer targeting fall 2028. Dates and fees change — always confirm on the official links (NCAA, visa).`,
        )}
      </p>
    </div>
  )
}
