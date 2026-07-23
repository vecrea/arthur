import { athleteLevel, LEVELS } from '../lib/convert.js'
import { CHECKLIST, ROADMAP } from '../data/checklist.js'
import { loadChecklist, loadCoaches, loadTimes, loadGoals, loadProfileExtras } from '../lib/storage.js'
import { goalStatus } from '../lib/goals.js'
import { useLang } from '../lib/i18n.jsx'

const ALL_IDS = CHECKLIST.flatMap((p) => p.items.map((i) => i.id))

// Petit intitulé de section.
function GroupLabel({ children, action }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-tertiary">{children}</span>
      {action}
    </div>
  )
}

// Jauge circulaire « préparation » (part de dossier de recrutement complété).
function ReadinessRing({ pct, t }) {
  const R = 54
  const C = 2 * Math.PI * R
  const clamped = Math.max(0, Math.min(100, pct))
  const offset = C * (1 - clamped / 100)
  return (
    <div className="relative mx-auto flex h-36 w-36 shrink-0 items-center justify-center sm:mx-0">
      <svg viewBox="0 0 128 128" className="h-36 w-36 -rotate-90">
        <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="11" />
        <circle
          cx="64" cy="64" r={R} fill="none" stroke="url(#ready)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <defs>
          <linearGradient id="ready" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0e88d3" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-black text-white">{pct}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{t('préparation', 'ready')}</span>
      </div>
    </div>
  )
}

export default function Dashboard({ profile, matches, favCount, setTab }) {
  const { t } = useLang()
  const { level } = athleteLevel(profile)
  const lvl = LEVELS[level]
  const projected = LEVELS[Math.min(5, level + (profile.recruitHorizonBonus || 0))]

  // Compte à rebours jusqu'à la rentrée (≈ mi-août de l'année d'entrée).
  const today = new Date()
  const target = new Date(`${profile.usEntryYear}-08-15`)
  const days = Math.max(0, Math.ceil((target - today) / 86400000))
  const months = Math.round(days / 30.44)

  // Données locales.
  const done = loadChecklist()
  const doneCount = ALL_IDS.filter((id) => done.has(id)).length
  const todayISO = today.toISOString().slice(0, 10)
  const nextMile = ROADMAP.find((m) => m.iso >= todayISO) || ROADMAP[ROADMAP.length - 1]
  const coaches = loadCoaches()
  const times = loadTimes()
  const goals = loadGoals()
  const goalsAchieved = goals.filter((g) => goalStatus(g, times, profile).achieved).length
  const extras = loadProfileExtras()
  const top = (matches || []).slice(0, 3)

  // « Préparation » = part du dossier de recrutement déjà constitué dans l'app.
  const signals = [
    doneCount / ALL_IDS.length,
    Math.min(times.length / 6, 1),
    goals.length ? 1 : 0,
    extras.average ? 1 : 0,
    Math.min(favCount / 5, 1),
    Math.min(coaches.length / 5, 1),
  ]
  const readiness = Math.round((100 * signals.reduce((a, b) => a + b, 0)) / signals.length)

  // Prochaines actions : l'étape datée + les manques du dossier, priorisés.
  const actions = [
    {
      key: 'mile',
      title: `${t('Prochaine étape', 'Next step')} — ${t(nextMile.title, nextMile.titleEn)}`,
      sub: t(nextMile.date, nextMile.dateEn),
      tab: 'steps',
    },
  ]
  if (times.length === 0) actions.push({ key: 'times', title: t('Enregistre tes premiers chronos', 'Log your first times'), sub: t('pour situer ton niveau réel', 'to gauge your real level'), tab: 'times' })
  if (!extras.average) actions.push({ key: 'gpa', title: t('Calcule ton GPA', 'Compute your GPA'), sub: t('les coachs le demandent tôt', 'coaches ask for it early'), tab: 'gpa' })
  if (favCount === 0) actions.push({ key: 'fav', title: t('Constitue ta shortlist de facs', 'Build your school shortlist'), sub: t('mets des favoris depuis le classement', 'star schools from the rankings'), tab: 'ranking' })
  if (goals.length === 0) actions.push({ key: 'goals', title: t('Fixe un objectif de temps', 'Set a target time'), sub: t('un cap chiffré à viser', 'a concrete target to chase'), tab: 'goals' })
  if (coaches.length === 0) actions.push({ key: 'coaches', title: t('Commence à contacter des coachs', 'Start reaching out to coaches'), sub: t('et suis tes échanges', 'and track your outreach'), tab: 'coaches' })
  const shownActions = actions.slice(0, 4)

  // Indicateurs clés.
  const vitals = [
    { key: 'lvl', label: t('Niveau', 'Level'), value: t(lvl.short, lvl.shortEn), tab: 'recruit', color: lvl.color },
    { key: 'gpa', label: t('Moyenne', 'GPA'), value: extras.average ? extras.average.split(' ')[0] : '—', tab: 'gpa' },
    { key: 'times', label: t('Chronos', 'Times'), value: times.length, tab: 'times' },
    { key: 'goals', label: t('Objectifs', 'Goals'), value: goals.length ? `${goalsAchieved}/${goals.length}` : '—', tab: 'goals' },
    { key: 'coaches', label: t('Coachs', 'Coaches'), value: coaches.length, tab: 'coaches' },
    { key: 'fav', label: t('Favoris', 'Favorites'), value: favCount, tab: 'favorites' },
  ]

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden">
        {/* Hero — cockpit : objectif, compte à rebours, jauge de préparation */}
        <div className="panel-dark p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium text-white/70">{t('Salut', 'Hi')} {profile.name}</div>
              <h2 className="mt-1 font-display text-3xl font-black leading-tight sm:text-4xl">
                {t('Cap sur la NCAA Division 1', 'Aiming for NCAA Division 1')}
              </h2>
              <p className="mt-2 text-sm text-white/70">
                {t('Rentrée automne', 'Fall')} {profile.usEntryYear} · {t('niveau visé', 'target level')}{' '}
                <span className="font-semibold text-white">{t(projected.short, projected.shortEn)}</span>
              </p>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-5xl font-black text-spark-400 sm:text-6xl">{months}</span>
                <span className="text-sm text-white/70">{t('mois restants', 'months left')} · ≈ {days} {t('jours', 'days')}</span>
              </div>
            </div>
            <ReadinessRing pct={readiness} t={t} />
          </div>
        </div>

        {/* Prochaines actions — ce qu'il faut faire maintenant */}
        <div className="border-t border-hair">
          <GroupLabel>{t('Prochaines actions', 'Next actions')}</GroupLabel>
          <div className="row-list mt-3">
            {shownActions.map((a, i) => (
              <button
                key={a.key}
                onClick={() => setTab(a.tab)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:surface-2 sm:px-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full surface-3 font-display text-sm font-black text-accent">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-heading">{a.title}</div>
                  <div className="truncate text-xs text-secondary">{a.sub}</div>
                </div>
                <span className="shrink-0 text-tertiary">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Indicateurs clés */}
        <div className="border-t border-hair">
          <GroupLabel>{t('Tes indicateurs', 'Your stats')}</GroupLabel>
          <div className="mt-3 grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6" style={{ background: 'var(--border)' }}>
            {vitals.map((v) => (
              <button key={v.key} onClick={() => setTab(v.tab)} className="surface p-4 text-left transition-colors hover:surface-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-tertiary">{v.label}</div>
                <div className="mt-1 truncate font-display text-2xl font-black text-heading" style={v.color ? { color: v.color } : undefined}>{v.value}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Shortlist */}
        <div className="border-t border-hair">
          <GroupLabel action={<button onClick={() => setTab('ranking')} className="text-xs font-semibold text-accent">{t('Voir le classement', 'See rankings')} →</button>}>
            {t('Ta shortlist', 'Your shortlist')}
          </GroupLabel>
          <div className="row-list mt-3">
            {top.map((u, i) => (
              <button
                key={u.id}
                onClick={() => setTab('ranking')}
                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:surface-2 sm:px-5"
              >
                <span className="w-9 shrink-0 text-center font-display text-lg font-black text-accent">{u.match}</span>
                <span className="min-w-0 flex-1 truncate font-semibold text-heading">{u.shortName}</span>
                <span className="hidden text-xs text-secondary sm:block">{u.city}, {u.state}</span>
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: i === 0 ? '#16a34a' : '#94a3b8' }}>{u.division}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="px-1 text-xs text-secondary">
        {t(
          'Ta « préparation » mesure l’avancement de ton dossier dans l’app (démarches, chronos, GPA, shortlist, coachs) — pas une probabilité de recrutement. Tout se met à jour tout seul au fil de tes saisies.',
          'Your “readiness” tracks how complete your recruiting file is in the app (steps, times, GPA, shortlist, coaches) — not a recruiting probability. Everything updates itself as you go.',
        )}
      </p>
    </div>
  )
}
