import { athleteLevel, LEVELS } from '../lib/convert.js'
import { CHECKLIST, ROADMAP } from '../data/checklist.js'
import { loadChecklist, loadCoaches, loadTimes, loadGoals, loadProfileExtras } from '../lib/storage.js'
import { goalStatus } from '../lib/goals.js'
import { useLang } from '../lib/i18n.jsx'
import Icon from './Icons.jsx'

const ALL_IDS = CHECKLIST.flatMap((p) => p.items.map((i) => i.id))

// Jauge circulaire « préparation » — thème-consciente (fonctionne clair + sombre).
function ReadinessRing({ pct }) {
  const R = 52
  const C = 2 * Math.PI * R
  const clamped = Math.max(0, Math.min(100, pct))
  const offset = C * (1 - clamped / 100)
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
        <circle cx="64" cy="64" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="11" />
        <circle cx="64" cy="64" r={R} fill="none" stroke="url(#ready)" strokeWidth="11" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)' }} />
        <defs>
          <linearGradient id="ready" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl font-black tracking-tight text-heading">{pct}%</span>
      </div>
    </div>
  )
}

function CardHead({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-tertiary">{children}</h3>
      {action}
    </div>
  )
}

export default function Dashboard({ profile, matches, favCount, setTab }) {
  const { t } = useLang()
  const { level } = athleteLevel(profile)
  const lvl = LEVELS[level]
  const projected = LEVELS[Math.min(5, level + (profile.recruitHorizonBonus || 0))]

  const today = new Date()
  const target = new Date(`${profile.usEntryYear}-08-15`)
  const days = Math.max(0, Math.ceil((target - today) / 86400000))
  const months = Math.round(days / 30.44)

  const done = loadChecklist()
  const doneCount = ALL_IDS.filter((id) => done.has(id)).length
  const todayISO = today.toISOString().slice(0, 10)
  const nextMile = ROADMAP.find((m) => m.iso >= todayISO) || ROADMAP[ROADMAP.length - 1]
  const coaches = loadCoaches()
  const times = loadTimes()
  const goals = loadGoals()
  const goalsAchieved = goals.filter((g) => goalStatus(g, times, profile).achieved).length
  const extras = loadProfileExtras()
  const topList = (matches || []).slice(0, 3)

  const signals = [
    doneCount / ALL_IDS.length,
    Math.min(times.length / 6, 1),
    goals.length ? 1 : 0,
    extras.average ? 1 : 0,
    Math.min(favCount / 5, 1),
    Math.min(coaches.length / 5, 1),
  ]
  const readiness = Math.round((100 * signals.reduce((a, b) => a + b, 0)) / signals.length)

  const actions = [
    { key: 'mile', title: `${t('Prochaine étape', 'Next step')} — ${t(nextMile.title, nextMile.titleEn)}`, sub: t(nextMile.date, nextMile.dateEn), tab: 'steps' },
  ]
  if (times.length === 0) actions.push({ key: 'times', title: t('Enregistre tes premiers chronos', 'Log your first times'), sub: t('pour situer ton niveau réel', 'to gauge your real level'), tab: 'times' })
  if (!extras.average) actions.push({ key: 'gpa', title: t('Calcule ton GPA', 'Compute your GPA'), sub: t('les coachs le demandent tôt', 'coaches ask for it early'), tab: 'gpa' })
  if (favCount === 0) actions.push({ key: 'fav', title: t('Constitue ta shortlist de facs', 'Build your school shortlist'), sub: t('mets des favoris depuis le classement', 'star schools from the rankings'), tab: 'ranking' })
  if (goals.length === 0) actions.push({ key: 'goals', title: t('Fixe un objectif de temps', 'Set a target time'), sub: t('un cap chiffré à viser', 'a concrete target to chase'), tab: 'goals' })
  if (coaches.length === 0) actions.push({ key: 'coaches', title: t('Commence à contacter des coachs', 'Start reaching out to coaches'), sub: t('et suis tes échanges', 'and track your outreach'), tab: 'coaches' })
  const shownActions = actions.slice(0, 4)

  const vitals = [
    { key: 'lvl', icon: 'award', label: t('Niveau', 'Level'), value: t(lvl.short, lvl.shortEn), tab: 'recruit', color: lvl.color },
    { key: 'gpa', icon: 'book', label: t('Moyenne', 'GPA'), value: extras.average ? extras.average.split(' ')[0] : '—', tab: 'gpa' },
    { key: 'times', icon: 'watch', label: t('Chronos', 'Times'), value: times.length, tab: 'times' },
    { key: 'goals', icon: 'target', label: t('Objectifs', 'Goals'), value: goals.length ? `${goalsAchieved}/${goals.length}` : '—', tab: 'goals' },
    { key: 'coaches', icon: 'users', label: t('Coachs', 'Coaches'), value: coaches.length, tab: 'coaches' },
    { key: 'fav', icon: 'star', label: t('Favoris', 'Favorites'), value: favCount, tab: 'favorites' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
      {/* HERO — col-span-4, carte sombre premium */}
      <section className="panel-dark grain relative col-span-2 overflow-hidden p-6 text-white sm:p-7 lg:col-span-4">
        {/* vague décorative en bas */}
        <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full opacity-[0.12]" aria-hidden="true">
          <path d="M0 30 C 60 10 120 50 200 30 S 340 10 400 30 V60 H0 Z" fill="#38bdf8" />
        </svg>
        <div className="relative z-10">
          <div className="text-sm font-medium text-white/65">{t('Salut', 'Hi')} {profile.name}</div>
          <h2 className="mt-1 font-display text-3xl font-black leading-[1.05] tracking-tight sm:text-[2.5rem]">
            {t('Cap sur la ', 'Aiming for ')}<span className="text-pool-400">NCAA Division 1</span>
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/15">{t('Rentrée', 'Fall')} {profile.usEntryYear}</span>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: lvl.color }}>{t('Niveau', 'Level')} : {t(lvl.short, lvl.shortEn)}</span>
            <span className="text-white/40">→</span>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ring-1 ring-white/25" style={{ background: projected.color }}>{t('Objectif', 'Target')} : {t(projected.short, projected.shortEn)}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-5xl font-black tracking-tight text-spark-400 sm:text-6xl">{months}</span>
            <span className="text-sm text-white/65">{t('mois avant la rentrée', 'months to enrollment')} · ≈ {days} {t('jours', 'days')}</span>
          </div>
        </div>
      </section>

      {/* PRÉPARATION — col-span-2 */}
      <section className="panel col-span-2 flex flex-col items-center justify-center p-5 text-center">
        <CardHead>{t('Préparation', 'Readiness')}</CardHead>
        <ReadinessRing pct={readiness} />
        <p className="mt-3 text-xs text-secondary">{t('Avancement de ton dossier', 'How complete your file is')}</p>
      </section>

      {/* INDICATEURS — 6 tuiles bento */}
      {vitals.map((v) => (
        <button key={v.key} onClick={() => setTab(v.tab)} className="panel lift group col-span-1 p-4 text-left">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent transition group-hover:scale-110" style={v.color ? { color: v.color, background: `color-mix(in srgb, ${v.color} 14%, transparent)` } : undefined}>
            <Icon name={v.icon} className="h-4 w-4" />
          </span>
          <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-tertiary">{v.label}</div>
          <div className={'mt-0.5 font-display font-black leading-tight tracking-tight text-heading ' + (String(v.value).length > 5 ? 'text-base' : 'text-2xl')} style={v.color ? { color: v.color } : undefined}>{v.value}</div>
        </button>
      ))}

      {/* PROCHAINES ACTIONS — col-span-3 */}
      <section className="panel col-span-2 overflow-hidden p-5 lg:col-span-3">
        <CardHead>{t('Prochaines actions', 'Next actions')}</CardHead>
        <div className="-mx-2">
          {shownActions.map((a, i) => (
            <button key={a.key} onClick={() => setTab(a.tab)} className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:surface-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-black text-accent ring-1 ring-[var(--accent)]/20 transition group-hover:scale-105">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-heading">{a.title}</div>
                <div className="truncate text-xs text-secondary">{a.sub}</div>
              </div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-tertiary transition-all group-hover:bg-accent-soft group-hover:text-accent group-hover:translate-x-0.5"><Icon name="arrow" className="h-4 w-4" /></span>
            </button>
          ))}
        </div>
      </section>

      {/* SHORTLIST — col-span-3 */}
      <section className="panel col-span-2 overflow-hidden p-5 lg:col-span-3">
        <CardHead action={<button onClick={() => setTab('ranking')} className="text-xs font-semibold text-accent transition hover:underline">{t('Tout voir', 'See all')} →</button>}>
          {t('Ta shortlist', 'Your shortlist')}
        </CardHead>
        <div className="-mx-2">
          {topList.map((u, i) => (
            <button key={u.id} onClick={() => setTab('ranking')} className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:surface-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-black text-white shadow-sm" style={{ background: i === 0 ? 'linear-gradient(135deg,#f6c445,#d1971f)' : i === 1 ? 'linear-gradient(135deg,#cbd5e1,#94a3b8)' : 'linear-gradient(135deg,#e5b488,#b7794a)' }}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-heading">{u.shortName}</div>
                <div className="truncate text-xs text-secondary">{u.city}, {u.state}</div>
              </div>
              <span className="hidden shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold text-white sm:inline" style={{ background: i === 0 ? '#16a34a' : '#94a3b8' }}>{u.division}</span>
              <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-accent-soft">
                <span className="font-display text-base font-black leading-none text-accent">{u.match}</span>
                <span className="text-[8px] font-semibold uppercase tracking-wide text-accent/70">match</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <p className="col-span-2 px-1 text-xs text-secondary lg:col-span-6">
        {t(
          'Ta « préparation » mesure l’avancement de ton dossier dans l’app (démarches, chronos, GPA, shortlist, coachs) — pas une probabilité de recrutement. Tout se met à jour tout seul au fil de tes saisies.',
          'Your “readiness” tracks how complete your recruiting file is in the app (steps, times, GPA, shortlist, coaches) — not a recruiting probability. Everything updates itself as you go.',
        )}
      </p>
    </div>
  )
}
