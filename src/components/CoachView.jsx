import { useMemo } from 'react'
import AboutMe from './AboutMe.jsx'
import AthleteSheet from './AthleteSheet.jsx'
import { athleteLevel, LEVELS } from '../lib/convert.js'
import { loadAbout, loadProfileExtras } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

// ---------------------------------------------------------------------------
// Vue coach (mode lecture seule). Atterrissage pour un coach US : en-tête,
// présentation, progression (meilleurs temps + courbe) et fiche — sans aucune
// commande d'édition. Les données viennent du stockage (local aujourd'hui,
// synchronisé via le cloud une fois Firebase branché).
// ---------------------------------------------------------------------------
export default function CoachView({ profile, theme, setTheme }) {
  const { t, lang, setLang } = useLang()
  const dark = theme === 'dark'

  const about = useMemo(() => loadAbout(), [])
  const extras = useMemo(() => loadProfileExtras(), [])
  const curLevel = athleteLevel(profile).level
  const projLevel = Math.min(5, curLevel + (profile.recruitHorizonBonus || 0))
  const lvl = LEVELS[curLevel]
  const proj = LEVELS[projLevel]

  const ig = about.instagram ? String(about.instagram).replace(/^@/, '') : ''
  const email = about.email || extras.email || ''
  const phone = about.phone || extras.phone || ''

  const specialty = lang === 'en' ? profile.specialtyEn : profile.specialty

  return (
    <div className="min-h-screen">
      {/* Barre du haut minimaliste : marque + thème + langue (pas d'onglets) */}
      <header className="no-print topbar sticky top-0 z-30">
        <div className="mx-auto flex items-center justify-between gap-4 px-5 py-4 lg:px-8 xl:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ring-1 ring-white/10" style={{ background: 'linear-gradient(135deg,#0e88d3,#0b1524)' }}>
              <Wave />
            </div>
            <div className="leading-tight">
              <div className="font-display text-xl font-extrabold tracking-tight text-heading sm:text-2xl">
                Road to <span className="text-pool-500">NCAA</span>
              </div>
              <div className="text-[11px] font-medium text-tertiary">
                {t('Profil recrutement · vue coach', 'Recruiting profile · coach view')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(dark ? 'light' : 'dark')}
              aria-label={dark ? t('Passer en clair', 'Switch to light') : t('Passer en sombre', 'Switch to dark')}
              title={dark ? t('Mode clair', 'Light mode') : t('Mode sombre', 'Dark mode')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hair text-secondary transition hover:text-heading surface-2"
            >
              {dark ? <Sun /> : <Moon />}
            </button>
            <div className="inline-flex rounded-lg border border-hair surface-2 p-0.5 text-xs font-semibold">
              {['fr', 'en'].map((lg) => (
                <button
                  key={lg}
                  onClick={() => setLang(lg)}
                  aria-label={lg === 'fr' ? 'Français' : 'English'}
                  className={'rounded-md px-2.5 py-1 transition ' + (lang === lg ? 'pill-active shadow-sm' : 'text-secondary hover:text-heading')}
                >
                  {lg.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-5 py-6 lg:px-8">
        {/* 1 · En-tête (bandeau navy) */}
        <section className="panel-dark overflow-hidden">
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-black leading-none sm:text-4xl">{profile.name}</h1>
                <p className="mt-2 text-white/90">
                  {t('Promo', 'Class of')} {profile.usEntryYear} · {t('Nageur belge', 'Belgian swimmer')} · {specialty}
                </p>
                {lvl && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: lvl.color }}>
                      {t('Niveau actuel', 'Current level')} : {lang === 'en' ? lvl.shortEn : lvl.short}
                    </span>
                    {proj && projLevel > curLevel && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white ring-1 ring-white/25" style={{ background: proj.color }}>
                        {t('Objectif', 'Target')} {profile.usEntryYear} : {lang === 'en' ? proj.shortEn : proj.short}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Coordonnées rapides */}
              <div className="flex flex-wrap gap-2">
                {ig && (
                  <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20">
                    <InstagramIcon /> @{ig}
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20">
                    <MailIcon /> Email
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20">
                    <PhoneIcon /> {t('Appeler', 'Call')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2 · Présentation + 3 · Progression (meilleurs temps + courbe), lecture seule */}
        <AboutMe profile={profile} coachView />

        {/* 4 · Fiche de recrutement (imprimable), lecture seule */}
        <AthleteSheet profile={profile} coachView />

        <p className="no-print pt-2 text-center text-xs text-tertiary">
          {t(
            'Vue en lecture seule générée depuis le profil de l’athlète · Road to NCAA',
            'Read-only view generated from the athlete’s profile · Road to NCAA',
          )}
        </p>
      </main>
    </div>
  )
}

function Wave() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
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
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 6 10 7L22 6" />
    </svg>
  )
}
