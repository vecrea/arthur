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

export default function Header({ tab, setTab, favCount }) {
  const { t, lang, setLang } = useLang()
  return (
    <header className="no-print border-b border-slate-200 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur">
      <div className="mx-auto max-w-6xl px-5">
        {/* Marque + langue */}
        <div className="flex items-center justify-between gap-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm">
              <Wave />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[19px] font-extrabold tracking-tight text-navy-900">
                Road to <span className="text-pool-600">NCAA</span>
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                {t('Recrutement natation universitaire · USA', 'US college swimming recruiting')}
              </div>
            </div>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
            {['fr', 'en'].map((lg) => (
              <button
                key={lg}
                onClick={() => setLang(lg)}
                aria-label={lg === 'fr' ? 'Français' : 'English'}
                className={
                  'rounded-md px-2.5 py-1 transition ' +
                  (lang === lg ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-500 hover:text-navy-900')
                }
              >
                {lg.toUpperCase()}
              </button>
            ))}
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
                    ? 'bg-navy-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-navy-900')
                }
              >
                {t(item.label, item.labelEn)}
                {item.key === 'favorites' && favCount > 0 && (
                  <span
                    className={
                      'ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ' +
                      (active ? 'bg-white/20 text-white' : 'bg-navy-900 text-white')
                    }
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
