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

// ---------------------------------------------------------------------------
// Amateurisme — do's / don'ts. Point sensible pour un nageur européen : primes,
// sponsors, agents, statut pro. (NCAA International Student-Athlete Handbook.)
// ---------------------------------------------------------------------------
function AmateurismCard() {
  const { t } = useLang()
  const dos = [
    ['Rester amateur', 'Nager pour la compétition et le plaisir — jamais contre un salaire.', 'Stay amateur', 'Swim for competition and love of the sport — never for a salary.'],
    ['Déclarer chaque aide', 'Bourses de club, aides de la fédération, remboursements : note tout pour l’Eligibility Center.', 'Declare every benefit', 'Club grants, federation help, reimbursements: log it all for the Eligibility Center.'],
    ['Garder les preuves', 'Reçus de tes frais réels (voyage, hébergement en stage) au cas où un prix est versé.', 'Keep the receipts', 'Proof of your actual expenses (travel, camp lodging) in case prize money is paid.'],
    ['NIL : attendre la fac', 'Les revenus d’image (NIL) sont permis une fois inscrit, selon les règles NCAA / de l’État.', 'NIL: wait for college', 'Name-Image-Likeness income is allowed once enrolled, under NCAA / state rules.'],
  ]
  const donts = [
    ['Prize money au-delà des frais', 'Encaisser des gains de compétition qui dépassent tes frais réels.', 'Prize money above expenses', 'Taking competition winnings beyond your actual expenses.'],
    ['Salaire ou sponsor', 'Être payé pour nager, toucher un salaire de club pro ou un contrat sponsor.', 'Salary or sponsor pay', 'Being paid to swim, a pro-club salary or a sponsorship contract.'],
    ['Signer avec un agent', 'Laisser un agent te représenter ou négocier un contrat pour toi.', 'Sign with an agent', 'Letting an agent represent you or negotiate a contract for you.'],
    ['Statut professionnel', 'Signer comme professionnel ou concourir sous contrat pro.', 'Professional status', 'Signing as a professional or competing under a pro contract.'],
  ]
  return (
    <section className="panel p-5">
      <h3 className="font-display text-lg font-extrabold text-heading">{t('Amateurisme — à protéger dès maintenant', 'Amateurism — protect it from now')}</h3>
      <p className="mt-0.5 text-sm text-secondary">{t('Le point le plus sensible pour un nageur européen. Une seule erreur peut coûter l’éligibilité NCAA.', 'The most sensitive point for a European swimmer. A single slip can cost your NCAA eligibility.')}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/25">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">{t('À faire', 'Do')}</div>
          <ul className="space-y-2.5">
            {dos.map((d) => (
              <li key={d[0]} className="flex gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-emerald-600 dark:text-emerald-400">✓</span>
                <span><span className="font-semibold text-heading">{t(d[0], d[2])}</span> <span className="text-sm text-primary">— {t(d[1], d[3])}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-flag-500/10 p-4 ring-1 ring-flag-500/25">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-flag-600 dark:text-flag-400">{t('À éviter', 'Avoid')}</div>
          <ul className="space-y-2.5">
            {donts.map((d) => (
              <li key={d[0]} className="flex gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-flag-500">✕</span>
                <span><span className="font-semibold text-heading">{t(d[0], d[2])}</span> <span className="text-sm text-primary">— {t(d[1], d[3])}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Rester éligible une fois admis — GPA minimum + progression vers le diplôme,
// par division (D1 / D2 / D3). Source : NCAA handbook.
// ---------------------------------------------------------------------------
function StayEligibleCard() {
  const { t } = useLang()
  const divs = [
    {
      tag: 'Division I', color: '#1273b8',
      rows: [
        ['GPA minimum', 't', '1.80 (→ année 2) · 1.90 (→ année 3) · 2.00 (→ année 4+)', '1.80 (→ year 2) · 1.90 (→ year 3) · 2.00 (→ year 4+)'],
        ['Progression vers le diplôme', 't', '40 % du diplôme fin année 2 · 60 % fin année 3 · 80 % fin année 4', '40% of degree by end of year 2 · 60% by year 3 · 80% by year 4'],
        ['Crédits', 't', 'Min. d’heures-crédit chaque semestre (≈ 18–24 / an)', 'Minimum credit-hours each term (≈ 18–24 / yr)'],
      ],
    },
    {
      tag: 'Division II', color: '#3a3f7a',
      rows: [
        ['GPA minimum', 't', '2.00', '2.00'],
        ['Crédits', 't', '24 heures-crédit par an (9 par trimestre)', '24 credit-hours per year (9 per term)'],
      ],
    },
    {
      tag: 'Division III', color: '#6f63a0',
      rows: [
        ['GPA minimum', 't', 'Pas de minimum national', 'No national minimum'],
        ['Règle', 't', 'Tu suis les standards de ta fac, comme tout étudiant', 'You follow your school’s standards, like any student'],
      ],
    },
  ]
  return (
    <section className="panel p-5">
      <h3 className="font-display text-lg font-extrabold text-heading">{t('Rester éligible une fois admis', 'Staying eligible once admitted')}</h3>
      <p className="mt-0.5 text-sm text-secondary">{t('Être recruté ne suffit pas : chaque année, un GPA minimum et une progression vers le diplôme sont exigés pour continuer à nager.', 'Getting recruited isn’t the end: each year a minimum GPA and progress toward your degree are required to keep competing.')}</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {divs.map((d) => (
          <div key={d.tag} className="rounded-xl surface-2 border border-hair p-4">
            <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: d.color }}>{d.tag}</span>
            <dl className="mt-3 space-y-2">
              {d.rows.map((r) => (
                <div key={r[0]}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-tertiary">{t(r[0], r[0] === 'GPA minimum' ? 'Minimum GPA' : r[0] === 'Crédits' ? 'Credits' : r[0] === 'Progression vers le diplôme' ? 'Progress toward degree' : r[0] === 'Règle' ? 'Rule' : r[0])}</dt>
                  <dd className="text-sm font-medium text-primary">{t(r[2], r[3])}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Ressources officielles (liens vérifiés). Regroupe NCAA, tests et gouvernement
// US pour tout avoir au même endroit.
// ---------------------------------------------------------------------------
function ResourcesHub() {
  const { t } = useLang()
  const groups = [
    {
      title: 'NCAA', titleEn: 'NCAA',
      links: [
        ['NCAA Eligibility Center', 'Créer ton compte, t’enregistrer, suivre la checklist et les standards académiques internationaux (Belgique).', 'Create your account, register, follow the checklist and the international (Belgium) academic standards.', 'https://www.eligibilitycenter.org'],
        ['Règles & calendrier de recrutement (natation)', 'Quand et comment un coach peut te contacter.', 'When and how a coach may contact you.', 'https://www.ncsasports.org/mens-swimming/recruiting-rules-calendar'],
      ],
    },
    {
      title: 'Tests & académique', titleEn: 'Tests & academics',
      links: [
        ['Duolingo English Test', 'Test d’anglais accepté par de nombreuses facs.', 'English test accepted by many schools.', 'https://englishtest.duolingo.com'],
        ['SAT (College Board)', 'Inscription et préparation au SAT.', 'SAT registration and prep.', 'https://satsuite.collegeboard.org/sat'],
      ],
    },
    {
      title: 'Visa & gouvernement US', titleEn: 'Visa & US government',
      links: [
        ['Form I-20 (Study in the States)', 'Le document envoyé par la fac pour demander le visa.', 'The document the school issues to apply for the visa.', 'https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20'],
        ['SEVIS I-901 (paiement)', 'Payer les frais SEVIS avant l’entretien de visa.', 'Pay the SEVIS fee before the visa interview.', 'https://www.fmjfee.com'],
        ['Visa étudiant F-1 (Dept. of State)', 'Procédure officielle du visa F-1.', 'Official F-1 visa process.', 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html'],
      ],
    },
  ]
  return (
    <section className="panel p-5">
      <h3 className="font-display text-lg font-extrabold text-heading">{t('Ressources officielles', 'Official resources')}</h3>
      <p className="mt-0.5 text-sm text-secondary">{t('Tous les liens utiles au même endroit — NCAA, tests et administration US.', 'Every useful link in one place — NCAA, tests and US admin.')}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title}>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-tertiary">{t(g.title, g.titleEn)}</div>
            <ul className="space-y-2">
              {g.links.map((l) => (
                <li key={l[0]}>
                  <a href={l[3]} target="_blank" rel="noopener noreferrer" className="group block rounded-xl surface-2 border border-hair p-3 transition hover:border-pool-500">
                    <span className="flex items-center gap-1.5 font-semibold text-accent group-hover:underline">{l[0]} <span className="text-xs">↗</span></span>
                    <span className="mt-0.5 block text-xs text-secondary">{t(l[1], l[2])}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
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

      <AmateurismCard />
      <StayEligibleCard />
      <ResourcesHub />

      <p className="px-1 text-xs text-secondary">
        {t(
          `Guide indicatif (vérifié ${CHECKLIST_AS_OF}) pour un nageur international visant l'automne 2028. Les dates et frais changent — confirme toujours sur les liens officiels (NCAA, visa).`,
          `Indicative guide (verified ${CHECKLIST_AS_OF_EN}) for an international swimmer targeting fall 2028. Dates and fees change — always confirm on the official links (NCAA, visa).`,
        )}
      </p>
    </div>
  )
}
