const TABS = [
  { key: 'ranking', label: 'Classement', icon: '🏆' },
  { key: 'favorites', label: 'Mes favoris', icon: '⭐' },
  { key: 'compare', label: 'Comparer', icon: '⚖️' },
  { key: 'sheet', label: 'Ma fiche', icon: '📄' },
  { key: 'profile', label: 'Mon profil', icon: '🏊' },
]

export default function Header({ tab, setTab, favCount }) {
  return (
    <header className="no-print relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
      <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-pool-500/20 blur-3xl" />
      <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-flag-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🇺🇸</span>
          <div>
            <h1
              className="font-display text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Party in the USA
            </h1>
            <p className="mt-1 font-display text-sm font-bold uppercase tracking-[0.25em] text-spark-400">
              Road to D1 🏊‍♂️
            </p>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-pool-100/80">
          Ton tableau de bord pour trouver l'université américaine idéale : natation,
          diplôme d'économie et soleil. Chaque fac reçoit un{' '}
          <span className="font-semibold text-white">score de compatibilité</span> selon ton profil.
        </p>

        <nav className="mt-5 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  'group relative rounded-full px-4 py-2 text-sm font-semibold transition ' +
                  (active
                    ? 'bg-white text-navy-900 shadow-lg shadow-pool-500/20'
                    : 'bg-white/10 text-white/80 hover:bg-white/20')
                }
              >
                <span className="mr-1.5">{t.icon}</span>
                {t.label}
                {t.key === 'favorites' && favCount > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-flag-500 px-1.5 text-xs font-bold text-white">
                    {favCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
