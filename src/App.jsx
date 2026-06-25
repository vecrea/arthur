import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Filters from './components/Filters.jsx'
import UniversityCard from './components/UniversityCard.jsx'
import ProfileCard from './components/ProfileCard.jsx'
import Compare from './components/Compare.jsx'
import AthleteSheet from './components/AthleteSheet.jsx'
import Recruitable from './components/Recruitable.jsx'
import TimeTracker from './components/TimeTracker.jsx'
import Coaches from './components/Coaches.jsx'
import Steps from './components/Steps.jsx'
import Ia from './components/Ia.jsx'
import { profile } from './data/profile.js'
import { universities } from './data/schools.js'
import { computeMatches } from './lib/score.js'
import { loadFavorites, saveFavorites } from './lib/storage.js'

export default function App() {
  const [tab, setTab] = useState('ranking')
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
        {tab === 'ranking' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Meilleur match" value={`${topMatch.match}`} sub={topMatch.shortName} accent="#16a34a" />
              <StatCard label="✅ Réalistes" value={counts.safety} sub="dans tes cordes" accent="#16a34a" />
              <StatCard label="🎯 Objectifs" value={counts.target} sub="à ta portée" accent="#0ea5e9" />
              <StatCard label="🔥 Ambitieux" value={counts.reach} sub="la Road to D1" accent="#f59e0b" />
            </div>

            <Filters filters={filters} setFilters={setFilters} count={filtered.length} />

            <div className="grid gap-3 lg:grid-cols-2">
              {filtered.map((u) => (
                <UniversityCard key={u.id} u={u} profile={profile} isFav={favorites.has(u.id)} onToggleFav={toggleFav} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="rounded-2xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">
                Aucune université ne correspond à ces filtres.
              </p>
            )}
          </div>
        )}

        {tab === 'favorites' && (
          <div className="grid gap-3 lg:grid-cols-2">
            {favUnis.map((u) => (
              <UniversityCard key={u.id} u={u} profile={profile} isFav onToggleFav={toggleFav} />
            ))}
            {favUnis.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                <div className="text-4xl">⭐</div>
                <p className="mt-3 font-semibold text-navy-900">Pas encore de favoris</p>
                <p className="mt-1 text-sm text-slate-500">Clique sur l'étoile d'une fac dans le classement pour la sauvegarder ici.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'compare' && <Compare unis={favUnis} onToggleFav={toggleFav} />}

        {tab === 'sheet' && <AthleteSheet profile={profile} />}

        {tab === 'recruit' && <Recruitable profile={profile} />}

        {tab === 'times' && <TimeTracker profile={profile} />}

        {tab === 'coaches' && <Coaches unis={matches} favorites={favorites} profile={profile} />}

        {tab === 'steps' && <Steps />}

        {tab === 'ia' && <Ia />}

        {tab === 'profile' && <ProfileCard profile={profile} />}
      </main>

      <footer className="no-print mx-auto max-w-6xl px-5 pb-10">
        <div className="rounded-xl bg-white/80 p-4 text-xs text-slate-500 ring-1 ring-slate-200">
          ⚠️ <strong>Données indicatives (MVP).</strong> La sélection d'universités, les coûts et la force des
          programmes de natation sont une première base à vérifier sur les rosters/sites officiels 2025-26. Prochaine
          étape : enrichissement via College Scorecard (données officielles US) + suivi des démarches et IA.
        </div>
        <p className="mt-3 text-center text-xs text-white/70">Party in the USA — Road to D1 · fait pour {profile.name} 🏊‍♂️🇺🇸</p>
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
