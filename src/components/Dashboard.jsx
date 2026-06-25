import { athleteLevel, LEVELS, EVENTS, formatTime } from '../lib/convert.js'
import { CHECKLIST, ROADMAP } from '../data/checklist.js'
import { loadChecklist, loadCoaches, loadTimes } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

const ALL_IDS = CHECKLIST.flatMap((p) => p.items.map((i) => i.id))
const EV_BY_KEY = Object.fromEntries(EVENTS.map((e) => [e.key, e]))

// Carte-widget cliquable qui amène vers un onglet.
function Tile({ onClick, icon, title, cta, children }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-pool-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="mt-1 flex-1">{children}</div>
      <div className="mt-3 text-xs font-semibold text-pool-600">{cta} →</div>
    </button>
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

  const top = (matches || []).slice(0, 3)

  return (
    <div className="space-y-5">
      {/* Hero : salutation + compte à rebours + niveau */}
      <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200">
        <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 text-white">
          <h2 className="font-display text-2xl font-black">{t('Salut', 'Hi')} {profile.name} 👋</h2>
          <p className="mt-1 text-sm text-white/80">{t('Voici où tu en es sur ta Road to D1.', 'Here’s where you stand on your Road to D1.')}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Avant la rentrée', 'Until enrollment')}</div>
              <div className="font-display text-3xl font-black text-spark-400">≈ {months} {t('mois', 'months')}</div>
              <div className="text-xs text-white/70">{t('rentrée automne', 'fall')} {profile.usEntryYear}</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Niveau actuel', 'Current level')}</div>
              <div className="mt-1 font-display text-xl font-black" style={{ color: lvl.color }}>{t(lvl.label, lvl.labelEn)}</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t('Projection 2028', '2028 projection')}</div>
              <div className="mt-1 font-display text-xl font-black" style={{ color: projected.color }}>{t(projected.label, projected.labelEn)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Tile onClick={() => setTab('recruit')} icon="🎯" title={t('Recrutabilité', 'Recruitability')} cta={t('Voir le détail', 'See details')}>
          <div className="mt-1 inline-block rounded-full px-3 py-1 font-display text-sm font-extrabold text-white" style={{ background: lvl.color }}>
            {t(lvl.short, lvl.shortEn)}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {t('Objectif 2028', '2028 goal')} : <span className="font-semibold text-navy-900">{t(projected.short, projected.shortEn)}</span>
          </p>
        </Tile>

        <Tile onClick={() => setTab('steps')} icon="🗓️" title={t('Démarches', 'Steps')} cta={t('Continuer', 'Continue')}>
          <div className="flex items-end gap-2">
            <span className="font-display text-3xl font-black text-pool-600">{pct}%</span>
            <span className="pb-1 text-xs text-slate-400">{doneCount}/{ALL_IDS.length}</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-pool-500 to-emerald-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {t('Prochaine étape', 'Next step')} : <span className="font-semibold text-navy-900">{t(nextMile.date, nextMile.dateEn)}</span> — {t(nextMile.title, nextMile.titleEn)}
          </p>
        </Tile>

        <Tile onClick={() => setTab('times')} icon="⏱️" title={t('Mes chronos', 'My times')} cta={t('Ajouter / voir', 'Add / view')}>
          {lastEntry ? (
            <>
              <div className="font-display text-2xl font-black text-navy-900">{times.length} <span className="text-sm font-semibold text-slate-400">{t('chronos', 'times')}</span></div>
              <p className="mt-1 text-sm text-slate-500">
                {t('Dernier', 'Latest')} : <span className="font-semibold text-navy-900">{t(lastEv?.label, lastEv?.labelEn)}</span> {formatTime(lastEntry.seconds)} <span className="text-[10px] font-bold uppercase text-slate-400">{lastEntry.course}</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">{t('Aucun chrono enregistré.', 'No times logged yet.')}</p>
          )}
        </Tile>

        <Tile onClick={() => setTab('ranking')} icon="🏆" title={t('Top facs pour toi', 'Your top schools')} cta={t('Voir le classement', 'See rankings')}>
          <ul className="mt-1 space-y-1">
            {top.map((u, i) => (
              <li key={u.id} className="flex items-center gap-2 text-sm">
                <span className="font-display text-base font-black text-pool-600">{u.match}</span>
                <span className="truncate font-semibold text-navy-900">{u.shortName}</span>
                <span className="ml-auto rounded px-1.5 text-[10px] font-bold text-white" style={{ background: i === 0 ? '#16a34a' : '#94a3b8' }}>{u.division}</span>
              </li>
            ))}
          </ul>
        </Tile>

        <Tile onClick={() => setTab('favorites')} icon="⭐" title={t('Mes favoris', 'My favorites')} cta={t('Comparer', 'Compare')}>
          <div className="font-display text-3xl font-black text-spark-500">{favCount}</div>
          <p className="mt-1 text-sm text-slate-500">{favCount > 0 ? t('facs en shortlist', 'schools shortlisted') : t('Ajoute des facs en favoris.', 'Add schools to favorites.')}</p>
        </Tile>

        <Tile onClick={() => setTab('coaches')} icon="📇" title={t('Coachs', 'Coaches')} cta={t('Suivre', 'Track')}>
          {coaches.length ? (
            <>
              <div className="font-display text-2xl font-black text-navy-900">{coaches.length} <span className="text-sm font-semibold text-slate-400">{t('suivis', 'tracked')}</span></div>
              <p className="mt-1 text-sm text-slate-500">
                📨 {active} {t('en cours', 'in progress')} · 🎉 {offers} {t('offre(s)', 'offer(s)')}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">{t('Aucun coach suivi.', 'No coaches tracked yet.')}</p>
          )}
        </Tile>
      </div>

      <p className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-200">
        {t(
          '💡 Ton tableau de bord se met à jour tout seul au fil de tes chronos, démarches et contacts. Clique une carte pour aller à la section.',
          '💡 Your dashboard updates itself as you add times, steps and contacts. Click a card to jump to that section.',
        )}
      </p>
    </div>
  )
}
