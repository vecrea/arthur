import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Filters from './components/Filters.jsx'
import UniversityCard from './components/UniversityCard.jsx'
import ProfileCard from './components/ProfileCard.jsx'
import Compare from './components/Compare.jsx'
import AthleteSheet from './components/AthleteSheet.jsx'
import Dashboard from './components/Dashboard.jsx'
import Recruitable from './components/Recruitable.jsx'
import TimeTracker from './components/TimeTracker.jsx'
import Coaches from './components/Coaches.jsx'
import Steps from './components/Steps.jsx'
import Ia from './components/Ia.jsx'
import { profile } from './data/profile.js'
import { universities } from './data/schools.js'
import { computeMatches } from './lib/score.js'
import { loadFavorites, saveFavorites } from './lib/storage.js'
import { useLang } from './lib/i18n.jsx'
import { localizeUni } from './data/uni-en.js'

export default function App() {
  const { t, lang } = useLang()
  const [tab, setTab] = useState('home')
  const [favorites, setFavorites] = useState(() => loadFavorites())
  const [filters, setFilters] = useState({
    search: '',
    division: 'all',
    fit: 'all',
    sort: 'match',
    sunnyOnly: false,
    curatedOnly: false,
  })

  useEffect(() => saveFavorites(favorites), [favorites])

  const matches = useMemo(() => computeMatches(profile, universities), [])

  const toggleFav = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    let list = matches.filter((u) => {
      if (filters.division !== 'all' && u.division !== filters.division) return false
      if (filters.fit !== 'all' && u.fit.key !== filters.fit) return false
      if (filters.sunnyOnly && u.sunshine < 4) return false
      if (filters.curatedOnly && !u.curated) return false
      if (q) {
        const hay = `${u.name} ${u.shortName} ${u.city} ${u.state} ${u.conference}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    if (filters.sort === 'cost') list = [...list].sort((a, b) => a.costUSD - b.costUSD)
    else if (filters.sort === 'swim') list = [...list].sort((a, b) => b.swim - a.swim || b.match - a.match)
    return list
  }, [matches, filters])

  const favUnis = useMemo(() => matches.filter((u) => favorites.has(u.id)), [matches, favorites])

  // Versions localisées (FR/EN) pour l'affichage — le scoring/filtre reste neutre.
  const filteredLoc = useMemo(() => filtered.map((u) => localizeUni(u, lang)), [filtered, lang])
  const favLoc = useMemo(() => favUnis.map((u) => localizeUni(u, lang)), [favUnis, lang])
  const matchesLoc = useMemo(() => matches.map((u) => localizeUni(u, lang)), [matches, lang])

  const topMatch = matches[0]
  const counts = useMemo(
    () => ({
      safety: matches.filter((u) => u.fit.key === 'safety').length,
      target: matches.filter((u) => u.fit.key === 'target').length,
      reach: matches.filter((u) => u.fit.key === 'reach').length,
    }),
    [matches],
  )

  return (
    <div className="min-h-screen">
      <Header tab={tab} setTab={setTab} favCount={favorites.size} />

      <main className="mx-auto max-w-6xl px-5 py-6">
        {tab === 'home' && (
          <Dashboard profile={profile} matches={matchesLoc} favCount={favorites.size} setTab={setTab} />
        )}

        {tab === 'ranking' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label={t('Meilleur match', 'Best match')} value={`${topMatch.match}`} sub={topMatch.shortName} accent="#16a34a" />
              <StatCard label={t('✅ Réalistes', '✅ Safety')} value={counts.safety} sub={t('dans tes cordes', 'in your range')} accent="#16a34a" />
              <StatCard label={t('🎯 Objectifs', '🎯 Targets')} value={counts.target} sub={t('à ta portée', 'within reach')} accent="#0ea5e9" />
              <StatCard label={t('🔥 Ambitieux', '🔥 Reach')} value={counts.reach} sub={t('la Road to D1', 'the Road to D1')} accent="#f59e0b" />
            </div>

            <Filters filters={filters} setFilters={setFilters} count={filtered.length} />

            <div className="grid gap-3 lg:grid-cols-2">
              {filteredLoc.map((u) => (
                <UniversityCard key={u.id} u={u} profile={profile} isFav={favorites.has(u.id)} onToggleFav={toggleFav} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="rounded-2xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">
                {t('Aucune université ne correspond à ces filtres.', 'No university matches these filters.')}
              </p>
            )}
          </div>
        )}

        {tab === 'favorites' && (
          <div className="grid gap-3 lg:grid-cols-2">
            {favLoc.map((u) => (
              <UniversityCard key={u.id} u={u} profile={profile} isFav onToggleFav={toggleFav} />
            ))}
            {favUnis.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                <div className="text-4xl">⭐</div>
                <p className="mt-3 font-semibold text-navy-900">{t('Pas encore de favoris', 'No favorites yet')}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {t("Clique sur l'étoile d'une fac dans le classement pour la sauvegarder ici.", 'Click a school’s star in the rankings to save it here.')}
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'compare' && <Compare unis={favLoc} onToggleFav={toggleFav} />}

        {tab === 'sheet' && <AthleteSheet profile={profile} />}

        {tab === 'recruit' && <Recruitable profile={profile} />}

        {tab === 'times' && <TimeTracker profile={profile} />}

        {tab === 'coaches' && <Coaches unis={matchesLoc} favorites={favorites} profile={profile} />}

        {tab === 'steps' && <Steps />}

        {tab === 'ia' && <Ia />}

        {tab === 'profile' && <ProfileCard profile={profile} />}
      </main>

      <footer className="no-print mx-auto max-w-6xl px-5 pb-10">
        <div className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-200">
          {t(
            "⚠️ Données indicatives (MVP). La sélection d'universités, les coûts et la force des programmes de natation sont une première base à vérifier sur les rosters/sites officiels 2025-26. Prochaine étape : enrichissement via College Scorecard (données officielles US) + suivi des démarches et IA.",
            '⚠️ Indicative data (MVP). The university selection, costs and swim-program strength are a first basis to verify against official 2025-26 rosters/sites. Next step: enrichment via College Scorecard (official US data) + steps tracking and AI.',
          )}
        </div>
        <p className="mt-3 text-center text-xs text-white/70">
          Party in the USA — Road to D1 · {t('fait pour', 'made for')} {profile.name} 🏊‍♂️🇺🇸
        </p>
      </footer>
    </div>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 font-display text-3xl font-black" style={{ color: accent }}>{value}</div>
      <div className="truncate text-xs text-slate-500">{sub}</div>
    </div>
  )
}
