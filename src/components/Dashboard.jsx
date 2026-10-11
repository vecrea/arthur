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
      <span className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{children}</span>
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
        <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="11" />
        <circle
          cx="64" cy="64" r={R} fill="none" stroke="url(#ready)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <defs>
          <linearGradient id="ready" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-black tracking-tight text-white">{pct}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/55">{t('préparation', 'ready')}</span>
      </div>
    </div>
  )
}

// Jeu d'icônes (inline, 2px, arrondies — cohérent avec le reste de l'app).
function Icon({ name, className = 'h-4 w-4' }) {
  const P = {
    award: <><circle cx="12" cy="8" r="5" /><path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
    watch: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5" /><path d="M9 2h6" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    star: <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.4 6.2 20.9l1.1-6.5-4.7-4.6 6.5-.95z" />,
    flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22V4" /></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill={name === 'star' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {P[name] || null}
    </svg>
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

  // Indicateurs clés (avec icône).
  const vitals = [
    { key: 'lvl', icon: 'award', label: t('Niveau', 'Level'), value: t(lvl.short, lvl.shortEn), tab: 'recruit', color: lvl.color },
    { key: 'gpa', icon: 'book', label: t('Moyenne', 'GPA'), value: extras.average ? extras.average.split(' ')[0] : '—', tab: 'gpa' },
    { key: 'times', icon: 'watch', label: t('Chronos', 'Times'), value: times.length, tab: 'times' },
    { key: 'goals', icon: 'target', label: t('Objectifs', 'Goals'), value: goals.length ? `${goalsAchieved}/${goals.length}` : '—', tab: 'goals' },
    { key: 'coaches', icon: 'users', label: t('Coachs', 'Coaches'), value: coaches.length, tab: 'coaches' },
    { key: 'fav', icon: 'star', label: t('Favoris', 'Favorites'), value: favCount, tab: 'favorites' },
  ]

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden">
        {/* Hero — cockpit : objectif, compte à rebours, jauge de préparation */}
        <div className="panel-dark grain relative overflow-hidden p-6 text-white sm:p-8">
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium text-white/65">{t('Salut', 'Hi')} {profile.name}</div>
              <h2 className="mt-1 font-display text-3xl font-black leading-[1.05] tracking-tight sm:text-[2.6rem]">
                {t('Cap sur la ', 'Aiming for ')}<span className="text-pool-400">NCAA Division 1</span>
              </h2>

              {/* Chips : rentrée + niveau actuel → objectif */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/15">
                  {t('Rentrée', 'Fall')} {profile.usEntryYear}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: lvl.color }}>
                  {t('Niveau', 'Level')} : {t(lvl.short, lvl.shortEn)}
                </span>
                <span className="text-white/40">→</span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white ring-1 ring-white/25" style={{ background: projected.color }}>
                  {t('Objectif', 'Target')} : {t(projected.short, projected.shortEn)}
                </span>
              </div>

              {/* Compte à rebours */}
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-5xl font-black tracking-tight text-spark-400 sm:text-6xl">{months}</span>
                <span className="text-sm text-white/65">{t('mois restants', 'months left')} · ≈ {days} {t('jours', 'days')}</span>
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
                className="group flex w-full items-center gap-4 p-4 text-left transition-colors hover:surface-2 sm:px-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-black text-accent ring-1 ring-[var(--accent)]/20 transition group-hover:scale-105">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-heading">{a.title}</div>
                  <div className="truncate text-xs text-secondary">{a.sub}</div>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-tertiary transition-all group-hover:bg-accent-soft group-hover:text-accent group-hover:translate-x-0.5">
                  <Icon name="arrow" className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Indicateurs clés */}
        <div className="border-t border-hair">
          <GroupLabel>{t('Tes indicateurs', 'Your stats')}</GroupLabel>
          <div className="mt-3 grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6" style={{ background: 'var(--border)' }}>
            {vitals.map((v) => (
              <button key={v.key} onClick={() => setTab(v.tab)} className="group surface p-4 text-left transition-colors hover:surface-2">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent transition group-hover:scale-110"
                    style={v.color ? { color: v.color, background: `color-mix(in srgb, ${v.color} 14%, transparent)` } : undefined}
                  >
                    <Icon name={v.icon} className="h-3.5 w-3.5" />
                  </span>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{v.label}</div>
                </div>
                <div className="mt-2 truncate font-display text-2xl font-black tracking-tight text-heading" style={v.color ? { color: v.color } : undefined}>{v.value}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Shortlist */}
        <div className="border-t border-hair">
          <GroupLabel action={<button onClick={() => setTab('ranking')} className="text-xs font-semibold text-accent transition hover:underline">{t('Voir le classement', 'See rankings')} →</button>}>
            {t('Ta shortlist', 'Your shortlist')}
          </GroupLabel>
          <div className="row-list mt-3">
            {top.map((u, i) => (
              <button
                key={u.id}
                onClick={() => setTab('ranking')}
                className="group flex w-full items-center gap-3 p-3 text-left transition-colors hover:surface-2 sm:px-5"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-black text-white shadow-sm"
                  style={{ background: i === 0 ? 'linear-gradient(135deg,#f6c445,#d1971f)' : i === 1 ? 'linear-gradient(135deg,#cbd5e1,#94a3b8)' : 'linear-gradient(135deg,#e5b488,#b7794a)' }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-heading">{u.shortName}</div>
                  <div className="truncate text-xs text-secondary">{u.city}, {u.state}</div>
                </div>
                <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: i === 0 ? '#16a34a' : '#94a3b8' }}>{u.division}</span>
                <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-accent-soft">
                  <span className="font-display text-lg font-black leading-none text-accent">{u.match}</span>
                  <span className="text-[8px] font-semibold uppercase tracking-wide text-accent/70">match</span>
                </span>
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
