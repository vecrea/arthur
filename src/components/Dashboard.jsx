import { athleteLevel, LEVELS, EVENTS, formatTime } from '../lib/convert.js'
import { CHECKLIST, ROADMAP } from '../data/checklist.js'
import { loadChecklist, loadCoaches, loadTimes, loadGoals } from '../lib/storage.js'
import { goalStatus } from '../lib/goals.js'
import { useLang } from '../lib/i18n.jsx'

const ALL_IDS = CHECKLIST.flatMap((p) => p.items.map((i) => i.id))
const EV_BY_KEY = Object.fromEntries(EVENTS.map((e) => [e.key, e]))

// Cellule-widget cliquable qui amène vers un onglet (pas une carte : une cellule du panneau).
function Tile({ onClick, title, cta, children }) {
  return (
    <button
      onClick={onClick}
      className="group surface flex flex-col p-5 text-left transition-colors hover:surface-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-tertiary">{title}</span>
      </div>
      <div className="mt-1 flex-1">{children}</div>
      <div className="mt-3 text-xs font-semibold text-accent">{cta} →</div>
    </button>
  )
}

// Petit intitulé de groupe de sections.
function GroupLabel({ children }) {
  return <div className="px-5 pt-4 text-[11px] font-semibold uppercase tracking-wide text-tertiary">{children}</div>
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

  // Démarches.
  const done = loadChecklist()
  const doneCount = ALL_IDS.filter((id) => done.has(id)).length
  const pct = Math.round((doneCount / ALL_IDS.length) * 100)

  // Prochaine étape de la roadmap.
  const todayISO = today.toISOString().slice(0, 10)
  const nextMile = ROADMAP.find((m) => m.iso >= todayISO) || ROADMAP[ROADMAP.length - 1]

  // Coachs.
  const coaches = loadCoaches()
  const offers = coaches.filter((c) => c.status === 'offer').length
  const active = coaches.filter((c) => ['emailed', 'replied', 'interested'].includes(c.status)).length

  // Chronos : dernier enregistré.
  const times = loadTimes()
  const lastEntry = times.length ? [...times].sort((a, b) => b.date.localeCompare(a.date))[0] : null
  const lastEv = lastEntry ? EV_BY_KEY[lastEntry.eventKey] : null

  // Objectifs.
  const goals = loadGoals()
  const goalsAchieved = goals.filter((g) => goalStatus(g, times, profile).achieved).length

  const top = (matches || []).slice(0, 3)

  const gridCls = 'grid gap-px grid-cols-1 md:grid-cols-3'
  const gridStyle = { background: 'var(--border)' }

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden">
        {/* Hero : salutation + compte à rebours + niveau */}
        <div className="panel-dark p-6 text-white">
          <h2 className="font-display text-2xl font-black">{t('Salut', 'Hi')} {profile.name}</h2>
          <p className="mt-1 text-sm text-white/80">{t('Voici où tu en es sur ta Road to D1.', 'Here’s where you stand on your Road to D1.')}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Avant la rentrée', 'Until enrollment')}</div>
              <div className="font-display text-3xl font-black text-spark-400">≈ {months} {t('mois', 'months')}</div>
              <div className="text-xs text-white/70">{t('rentrée automne', 'fall')} {profile.usEntryYear}</div>
            </div>
            <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Niveau actuel', 'Current level')}</div>
              <div className="mt-1 font-display text-xl font-black" style={{ color: lvl.color }}>{t(lvl.label, lvl.labelEn)}</div>
            </div>
            <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Projection 2028', '2028 projection')}</div>
              <div className="mt-1 font-display text-xl font-black" style={{ color: projected.color }}>{t(projected.label, projected.labelEn)}</div>
            </div>
          </div>
        </div>

        {/* Démarches — barre de progression pleine largeur, mise en avant */}
        <button
          onClick={() => setTab('steps')}
          className="block w-full border-t border-hair p-5 text-left transition-colors hover:surface-2"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-tertiary">{t('Démarches — Road to 2028', 'Steps — Road to 2028')}</span>
            <span className="text-xs font-semibold text-accent">{t('Continuer', 'Continue')} →</span>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <span className="font-display text-3xl font-black text-accent">{pct}%</span>
            <div className="min-w-0 flex-1">
              <div className="h-2.5 w-full overflow-hidden rounded-full surface-3">
                <div className="h-full rounded-full bg-gradient-to-r from-pool-500 to-emerald-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 truncate text-xs text-secondary">
                {t('Prochaine étape', 'Next step')} : <span className="font-semibold text-heading">{t(nextMile.date, nextMile.dateEn)}</span> — {t(nextMile.title, nextMile.titleEn)}
              </p>
            </div>
            <span className="shrink-0 text-xs text-tertiary">{doneCount}/{ALL_IDS.length}</span>
          </div>
        </button>

        {/* Groupe : progression natation */}
        <div className="border-t border-hair">
          <GroupLabel>{t('Ta progression natation', 'Your swimming progress')}</GroupLabel>
          <div className={'mt-3 ' + gridCls} style={gridStyle}>
            <Tile onClick={() => setTab('recruit')} title={t('Recrutabilité', 'Recruitability')} cta={t('Voir le détail', 'See details')}>
              <div className="mt-1 inline-block rounded-full px-3 py-1 font-display text-sm font-extrabold text-white" style={{ background: lvl.color }}>
                {t(lvl.short, lvl.shortEn)}
              </div>
              <p className="mt-2 text-sm text-secondary">
                {t('Objectif 2028', '2028 goal')} : <span className="font-semibold text-heading">{t(projected.short, projected.shortEn)}</span>
              </p>
            </Tile>

            <Tile onClick={() => setTab('times')} title={t('Mes chronos', 'My times')} cta={t('Ajouter / voir', 'Add / view')}>
              {lastEntry ? (
                <>
                  <div className="font-display text-2xl font-black text-heading">{times.length} <span className="text-sm font-semibold text-tertiary">{t('chronos', 'times')}</span></div>
                  <p className="mt-1 text-sm text-secondary">
                    {t('Dernier', 'Latest')} : <span className="font-semibold text-heading">{t(lastEv?.label, lastEv?.labelEn)}</span> {formatTime(lastEntry.seconds)} <span className="text-[10px] font-bold uppercase text-tertiary">{lastEntry.course}</span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-tertiary">{t('Aucun chrono enregistré.', 'No times logged yet.')}</p>
              )}
            </Tile>

            <Tile onClick={() => setTab('goals')} title={t('Objectifs', 'Goals')} cta={t('Définir / suivre', 'Set / track')}>
              {goals.length ? (
                <>
                  <div className="font-display text-2xl font-black text-heading">{goals.length} <span className="text-sm font-semibold text-tertiary">{t('objectif(s)', 'goal(s)')}</span></div>
                  <p className="mt-1 text-sm text-secondary">{goalsAchieved} {t('atteint(s)', 'achieved')}</p>
                </>
              ) : (
                <p className="text-sm text-tertiary">{t('Aucun objectif fixé.', 'No goals set.')}</p>
              )}
            </Tile>
          </div>
        </div>

        {/* Groupe : universités */}
        <div className="border-t border-hair">
          <GroupLabel>{t('Tes universités', 'Your schools')}</GroupLabel>
          <div className={'mt-3 ' + gridCls} style={gridStyle}>
            <Tile onClick={() => setTab('ranking')} title={t('Top facs pour toi', 'Your top schools')} cta={t('Voir le classement', 'See rankings')}>
              <ul className="mt-1 space-y-1">
                {top.map((u, i) => (
                  <li key={u.id} className="flex items-center gap-2 text-sm">
                    <span className="font-display text-base font-black text-accent">{u.match}</span>
                    <span className="truncate font-semibold text-heading">{u.shortName}</span>
                    <span className="ml-auto rounded px-1.5 text-[10px] font-bold text-white" style={{ background: i === 0 ? '#16a34a' : '#94a3b8' }}>{u.division}</span>
                  </li>
                ))}
              </ul>
            </Tile>

            <Tile onClick={() => setTab('favorites')} title={t('Mes favoris', 'My favorites')} cta={t('Comparer', 'Compare')}>
              <div className="font-display text-3xl font-black text-spark-500">{favCount}</div>
              <p className="mt-1 text-sm text-secondary">{favCount > 0 ? t('facs en shortlist', 'schools shortlisted') : t('Ajoute des facs en favoris.', 'Add schools to favorites.')}</p>
            </Tile>

            <Tile onClick={() => setTab('coaches')} title={t('Coachs', 'Coaches')} cta={t('Suivre', 'Track')}>
              {coaches.length ? (
                <>
                  <div className="font-display text-2xl font-black text-heading">{coaches.length} <span className="text-sm font-semibold text-tertiary">{t('suivis', 'tracked')}</span></div>
                  <p className="mt-1 text-sm text-secondary">
                    {active} {t('en cours', 'in progress')} · {offers} {t('offre(s)', 'offer(s)')}
                  </p>
                </>
              ) : (
                <p className="text-sm text-tertiary">{t('Aucun coach suivi.', 'No coaches tracked yet.')}</p>
              )}
            </Tile>
          </div>
        </div>
      </div>

      <p className="px-1 text-xs text-secondary">
        {t(
          'Ton tableau de bord se met à jour tout seul au fil de tes chronos, démarches et contacts. Clique une cellule pour aller à la section.',
          'Your dashboard updates itself as you add times, steps and contacts. Click a cell to jump to that section.',
        )}
      </p>
    </div>
  )
}
