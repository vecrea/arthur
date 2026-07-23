import { useLang } from '../lib/i18n.jsx'

const TABS = [
  { key: 'home', label: 'Tableau de bord', labelEn: 'Dashboard' },
  { key: 'ranking', label: 'Classement', labelEn: 'Rankings' },
  { key: 'favorites', label: 'Favoris', labelEn: 'Favorites' },
  { key: 'compare', label: 'Comparer', labelEn: 'Compare' },
  { key: 'budget', label: 'Budget', labelEn: 'Budget' },
  { key: 'sheet', label: 'Ma fiche', labelEn: 'My sheet' },
  { key: 'gpa', label: 'GPA', labelEn: 'GPA' },
  { key: 'recruit', label: 'Recrutabilité', labelEn: 'Recruitability' },
  { key: 'times', label: 'Chronos', labelEn: 'Times' },
  { key: 'goals', label: 'Objectifs', labelEn: 'Goals' },
  { key: 'coaches', label: 'Coachs', labelEn: 'Coaches' },
  { key: 'steps', label: 'Démarches', labelEn: 'Steps' },
  { key: 'ia', label: 'Assistant IA', labelEn: 'AI' },
  { key: 'profile', label: 'Profil', labelEn: 'Profile' },
]

// Petit monogramme « vagues » (natation) — pas d'emoji, sobre.
function Wave() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8c1.6-1.7 3.2-1.7 4.8 0S11 9.7 12.6 8s3.2-1.7 4.8 0S20.6 9.7 22.2 8" />
      <path d="M3 13c1.6-1.7 3.2-1.7 4.8 0S11 14.7 12.6 13s3.2-1.7 4.8 0S20.6 14.7 22.2 13" />
      <path d="M3 18c1.6-1.7 3.2-1.7 4.8 0S11 19.7 12.6 18s3.2-1.7 4.8 0S20.6 19.7 22.2 18" />
    </svg>
  )
}

function Sun() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

export default function Header({ tab, setTab, favCount, theme, setTheme }) {
  const { t, lang, setLang } = useLang()
  const dark = theme === 'dark'
  return (
    <header className="no-print topbar sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-5">
        {/* Marque + langue + thème */}
        <div className="flex items-center justify-between gap-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm ring-1 ring-white/10" style={{ background: 'linear-gradient(135deg,#0e88d3,#0b1524)' }}>
              <Wave />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[19px] font-extrabold tracking-tight text-heading">
                Road to <span className="text-pool-500">NCAA</span>
              </div>
              <div className="text-[11px] font-medium text-tertiary">
                {t('Recrutement natation universitaire · USA', 'US college swimming recruiting')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bascule thème clair / sombre */}
            <button
              onClick={() => setTheme(dark ? 'light' : 'dark')}
              aria-label={dark ? t('Passer en clair', 'Switch to light') : t('Passer en sombre', 'Switch to dark')}
              title={dark ? t('Mode clair', 'Light mode') : t('Mode sombre', 'Dark mode')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hair text-secondary transition hover:text-heading surface-2"
            >
              {dark ? <Sun /> : <Moon />}
            </button>

            {/* Bascule langue */}
            <div className="inline-flex rounded-lg border border-hair surface-2 p-0.5 text-xs font-semibold">
              {['fr', 'en'].map((lg) => (
                <button
                  key={lg}
                  onClick={() => setLang(lg)}
                  aria-label={lg === 'fr' ? 'Français' : 'English'}
                  className={
                    'rounded-md px-2.5 py-1 transition ' +
                    (lang === lg ? 'pill-active shadow-sm' : 'text-secondary hover:text-heading')
                  }
                >
                  {lg.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap gap-1 pb-2.5">
          {TABS.map((item) => {
            const active = tab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={
                  'rounded-md px-3 py-1.5 text-sm font-medium transition ' +
                  (active
                    ? 'pill-active'
                    : 'text-secondary hover:text-heading')
                }
              >
                {t(item.label, item.labelEn)}
                {item.key === 'favorites' && favCount > 0 && (
                  <span
                    className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-pool-500 px-1 text-[10px] font-bold text-white"
                  >
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
