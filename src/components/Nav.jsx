import { useState } from 'react'
import { useLang } from '../lib/i18n.jsx'
import Icon, { Wave } from './Icons.jsx'
import CloudSync from './CloudSync.jsx'

// Navigation groupée (partagée bureau + mobile).
export const NAV = [
  { items: [{ key: 'home', icon: 'home', fr: 'Tableau de bord', en: 'Dashboard' }] },
  {
    title: ['Universités', 'Universities'],
    items: [
      { key: 'ranking', icon: 'trophy', fr: 'Classement', en: 'Rankings' },
      { key: 'favorites', icon: 'star', fr: 'Favoris', en: 'Favorites' },
      { key: 'compare', icon: 'compare', fr: 'Comparer', en: 'Compare' },
      { key: 'budget', icon: 'wallet', fr: 'Budget', en: 'Budget' },
      { key: 'coaches', icon: 'users', fr: 'Coachs', en: 'Coaches' },
    ],
  },
  {
    title: ['Ma natation', 'My swimming'],
    items: [
      { key: 'times', icon: 'watch', fr: 'Chronos', en: 'Times' },
      { key: 'goals', icon: 'target', fr: 'Objectifs', en: 'Goals' },
      { key: 'recruit', icon: 'gauge', fr: 'Recrutabilité', en: 'Recruitability' },
      { key: 'gpa', icon: 'cap', fr: 'GPA', en: 'GPA' },
    ],
  },
  {
    title: ['Mon dossier', 'My file'],
    items: [
      { key: 'sheet', icon: 'doc', fr: 'Ma fiche', en: 'My sheet' },
      { key: 'steps', icon: 'steps', fr: 'Démarches', en: 'Steps' },
      { key: 'ia', icon: 'sparkles', fr: 'Assistant IA', en: 'AI' },
      { key: 'profile', icon: 'user', fr: 'Profil', en: 'Profile' },
    ],
  },
]

function Brand() {
  const { t } = useLang()
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md ring-1 ring-white/10" style={{ background: 'linear-gradient(135deg,#38bdf8,#0a6bb0 60%,#0b1524)' }}>
        <Wave className="h-6 w-6" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg font-extrabold tracking-tight text-heading">
          Road to <span className="text-gradient">NCAA</span>
        </div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-tertiary">{t('Recrutement natation', 'Swim recruiting')}</div>
      </div>
    </div>
  )
}

function NavList({ tab, setTab, favCount, onNavigate }) {
  const { t, lang } = useLang()
  const go = (k) => {
    setTab(k)
    onNavigate && onNavigate()
  }
  return (
    <nav className="flex flex-col gap-5">
      {NAV.map((group, gi) => (
        <div key={gi}>
          {group.title && (
            <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-tertiary">{t(group.title[0], group.title[1])}</div>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = tab === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => go(item.key)}
                  className={
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ' +
                    (active ? 'bg-accent-soft text-accent' : 'text-secondary hover:surface-2 hover:text-heading')
                  }
                >
                  {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full" style={{ background: 'var(--accent)' }} />}
                  <Icon name={item.icon} className={'h-[18px] w-[18px] shrink-0 transition ' + (active ? '' : 'text-tertiary group-hover:text-heading')} />
                  <span className="truncate">{t(item.fr, item.en)}</span>
                  {item.key === 'favorites' && favCount > 0 && (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pool-500 px-1.5 text-[10px] font-bold text-white">{favCount}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

function Controls({ theme, setTheme }) {
  const { t, lang, setLang } = useLang()
  const dark = theme === 'dark'
  return (
    <div className="flex items-center gap-2">
      <CloudSync />
      <button
        onClick={() => setTheme(dark ? 'light' : 'dark')}
        aria-label={dark ? t('Passer en clair', 'Switch to light') : t('Passer en sombre', 'Switch to dark')}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-hair text-secondary transition hover:text-heading surface-2"
      >
        <Icon name={dark ? 'sun' : 'moon'} className="h-4 w-4" />
      </button>
      <div className="inline-flex rounded-lg border border-hair surface-2 p-0.5 text-xs font-semibold">
        {['fr', 'en'].map((lg) => (
          <button key={lg} onClick={() => setLang(lg)} aria-label={lg === 'fr' ? 'Français' : 'English'} className={'rounded-md px-2 py-1 transition ' + (lang === lg ? 'pill-active shadow-sm' : 'text-secondary hover:text-heading')}>
            {lg.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

// Barre latérale (bureau ≥ lg).
export function Sidebar({ tab, setTab, favCount, theme, setTheme }) {
  return (
    <aside className="no-print sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-hair px-4 py-5 lg:flex" style={{ background: 'color-mix(in srgb, var(--surface) 70%, var(--canvas))' }}>
      <div className="px-2">
        <Brand />
      </div>
      <div className="mt-7 flex-1 overflow-y-auto pr-1">
        <NavList tab={tab} setTab={setTab} favCount={favCount} />
      </div>
      <div className="mt-4 border-t border-hair pt-4">
        <Controls theme={theme} setTheme={setTheme} />
      </div>
    </aside>
  )
}

// Barre du haut (mobile < lg) + tiroir de navigation.
export function TopBar({ tab, setTab, favCount, theme, setTheme }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <header className="no-print topbar sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Menu" className="flex h-9 w-9 items-center justify-center rounded-lg border border-hair text-secondary surface-2">
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <Brand />
        <div className="w-9" aria-hidden="true" />
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[280px] max-w-[84vw] flex-col px-4 py-5 shadow-2xl surface">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-hair text-secondary surface-2">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto pr-1">
              <NavList tab={tab} setTab={setTab} favCount={favCount} onNavigate={() => setOpen(false)} />
            </div>
            <div className="mt-4 border-t border-hair pt-4">
              <Controls theme={theme} setTheme={setTheme} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
