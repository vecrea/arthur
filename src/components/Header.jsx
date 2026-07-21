import { useLang } from '../lib/i18n.jsx'

const TABS = [
  { key: 'home', label: 'Tableau de bord', labelEn: 'Dashboard', icon: '📊' },
  { key: 'ranking', label: 'Classement', labelEn: 'Rankings', icon: '🏆' },
  { key: 'favorites', label: 'Mes favoris', labelEn: 'Favorites', icon: '⭐' },
  { key: 'compare', label: 'Comparer', labelEn: 'Compare', icon: '⚖️' },
  { key: 'budget', label: 'Budget', labelEn: 'Budget', icon: '💶' },
  { key: 'sheet', label: 'Ma fiche', labelEn: 'My sheet', icon: '📄' },
  { key: 'gpa', label: 'Notes → GPA', labelEn: 'Grades → GPA', icon: '🎓' },
  { key: 'recruit', label: 'Recrutable ?', labelEn: 'Recruitable?', icon: '🎯' },
  { key: 'times', label: 'Mes chronos', labelEn: 'My times', icon: '⏱️' },
  { key: 'goals', label: 'Objectifs', labelEn: 'Goals', icon: '🏁' },
  { key: 'coaches', label: 'Coachs', labelEn: 'Coaches', icon: '📇' },
  { key: 'steps', label: 'Démarches', labelEn: 'Steps', icon: '🗓️' },
  { key: 'ia', label: 'IA', labelEn: 'AI', icon: '🤖' },
  { key: 'profile', label: 'Mon profil', labelEn: 'My profile', icon: '🏊' },
]

export default function Header({ tab, setTab, favCount }) {
  const { t, lang, setLang } = useLang()
  return (
    <header className="no-print relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
      <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-pool-500/20 blur-3xl" />
      <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-flag-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 pt-8 pb-4">
        {/* Interrupteur de langue : bascule toute l'appli FR <-> EN */}
        <div className="absolute right-5 top-6 z-10 inline-flex rounded-full bg-white/10 p-1 text-xs font-bold ring-1 ring-white/20">
          {['fr', 'en'].map((lg) => (
            <button
              key={lg}
              onClick={() => setLang(lg)}
              aria-label={lg === 'fr' ? 'Français' : 'English'}
              className={
                'rounded-full px-2.5 py-1 transition ' +
                (lang === lg ? 'bg-white text-navy-900' : 'text-white/70 hover:text-white')
              }
            >
              {lg === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
            </button>
          ))}
        </div>

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
        <p className="mt-3 max-w-2xl text-sm text-white/90">
          {t(
            "Ton tableau de bord pour trouver l'université américaine idéale : natation, diplôme d'économie et soleil. Chaque fac reçoit un ",
            'Your dashboard to find the ideal US university: swimming, an economics degree and sunshine. Each school gets a ',
          )}
          <span className="font-semibold text-white">{t('score de compatibilité', 'compatibility score')}</span>
          {t(' selon ton profil.', ' based on your profile.')}
        </p>

        <nav className="mt-5 flex flex-wrap gap-2">
          {TABS.map((item) => {
            const active = tab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={
                  'group relative rounded-full px-4 py-2 text-sm font-semibold transition ' +
                  (active
                    ? 'bg-white text-navy-900 shadow-lg shadow-pool-500/20'
                    : 'bg-white/10 text-white/80 hover:bg-white/20')
                }
              >
                <span className="mr-1.5">{item.icon}</span>
                {t(item.label, item.labelEn)}
                {item.key === 'favorites' && favCount > 0 && (
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
