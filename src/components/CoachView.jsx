import { useMemo } from 'react'
import AboutMe from './AboutMe.jsx'
import AthleteSheet from './AthleteSheet.jsx'
import Icon from './Icons.jsx'
import FitTool from './coach/FitTool.jsx'
import CoachMessageForm from './coach/CoachMessageForm.jsx'
import CoachRequests from './coach/CoachRequests.jsx'
import CoachFaq from './coach/CoachFaq.jsx'
import DownloadPacket from './coach/DownloadPacket.jsx'
import { athleteLevel, LEVELS } from '../lib/convert.js'
import { loadAbout, loadProfileExtras } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// Bloc d'action coach (carte, non imprimé) : icône + titre + contenu.
function Block({ icon, title, subtitle, id, children }) {
  const { t } = useLang()
  return (
    <section id={id} className="no-print panel p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent ring-1 ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-extrabold leading-tight text-heading">{title}</h3>
          {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Vue coach (page `?coach`) : atterrissage orienté ACTION pour un coach US.
// En-tête + présentation + progression + fiche (lecture seule), puis des outils :
// test des temps, contact/intérêt, demandes, FAQ, mot, téléchargement.
// Les messages des coachs arrivent dans la boîte de réception de l'athlète.
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
      {/* Barre du haut minimaliste : marque + thème + langue */}
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
              <div className="text-[11px] font-medium text-tertiary">{t('Profil recrutement · vue coach', 'Recruiting profile · coach view')}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(dark ? 'light' : 'dark')}
              aria-label={dark ? t('Passer en clair', 'Switch to light') : t('Passer en sombre', 'Switch to dark')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hair text-secondary transition hover:text-heading surface-2"
            >
              {dark ? <Sun /> : <Moon />}
            </button>
            <div className="inline-flex rounded-lg border border-hair surface-2 p-0.5 text-xs font-semibold">
              {['fr', 'en'].map((lg) => (
                <button key={lg} onClick={() => setLang(lg)} aria-label={lg === 'fr' ? 'Français' : 'English'} className={'rounded-md px-2.5 py-1 transition ' + (lang === lg ? 'pill-active shadow-sm' : 'text-secondary hover:text-heading')}>
                  {lg.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-5 py-6 lg:px-8">
        {/* En-tête (bandeau navy) + CTA */}
        <section className="no-print panel-dark grain relative overflow-hidden">
          <div className="relative z-10 bg-gradient-to-r from-navy-900 to-navy-800 p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-black leading-none tracking-tight sm:text-4xl">{profile.name}</h1>
                <p className="mt-2 text-white/90">
                  {t('Promo', 'Class of')} {profile.usEntryYear} · {t('Nageur belge', 'Belgian swimmer')} · {specialty}
                </p>
                {lvl && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: lvl.color }}>
                      {t('Niveau actuel', 'Current level')} : {lang === 'en' ? lvl.shortEn : lvl.short}
                    </span>
                    {proj && projLevel > curLevel && (
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ring-1 ring-white/25" style={{ background: proj.color }}>
                        {t('Objectif', 'Target')} {profile.usEntryYear} : {lang === 'en' ? proj.shortEn : proj.short}
                      </span>
                    )}
                  </div>
                )}
              </div>

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

            {/* Appels à l'action */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => scrollTo('contact')} className="inline-flex items-center gap-2 rounded-full bg-pool-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-pool-400">
                <Icon name="users" className="h-4 w-4" /> {t('Je suis intéressé(e)', 'I’m interested')}
              </button>
              <button onClick={() => scrollTo('download')} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20">
                <Icon name="doc" className="h-4 w-4" /> {t('Télécharger le dossier', 'Download the packet')}
              </button>
            </div>
          </div>
        </section>

        {/* Présentation + progression (lecture seule) */}
        <div className="no-print">
          <AboutMe profile={profile} coachView />
        </div>

        {/* #2 · Teste mes temps contre vos standards */}
        <Block icon="gauge" title={t('Teste mes temps contre vos standards', 'Test my times against your standards')} subtitle={t('Choisissez un niveau type ou entrez vos temps de recrutement — comparaison instantanée.', 'Pick a preset level or enter your recruiting cut times — instant comparison.')}>
          <FitTool profile={profile} />
        </Block>

        {/* Fiche de recrutement (IMPRIMABLE) */}
        <AthleteSheet profile={profile} coachView />

        {/* #1 · Contact / intérêt */}
        <Block id="contact" icon="users" title={t('Intéressé(e) ? Contactez Arthur', 'Interested? Contact Arthur')} subtitle={t('Présentez-vous et laissez un message — il arrive directement à Arthur.', 'Introduce yourself and leave a message — it goes straight to Arthur.')}>
          <CoachMessageForm type="interest" messagePlaceholder={t('Votre message (programme, intérêt, questions…)', 'Your message (program, interest, questions…)')} submitLabel={t('Envoyer à Arthur', 'Send to Arthur')} />
        </Block>

        {/* #3 · Demandes rapides */}
        <Block icon="steps" title={t('Demandes rapides', 'Quick requests')} subtitle={t('Cochez ce dont vous avez besoin — Arthur vous l’envoie.', 'Tick what you need — Arthur will send it over.')}>
          <CoachRequests />
        </Block>

        {/* #6 · FAQ */}
        <Block icon="book" title={t('Questions fréquentes', 'Recruiting FAQ')} subtitle={t('Académique, éligibilité, visa — l’essentiel déjà répondu.', 'Academics, eligibility, visa — the essentials already answered.')}>
          <CoachFaq profile={profile} />
        </Block>

        {/* #5 · Laisser un mot */}
        <Block icon="star" title={t('Laisser un mot à Arthur', 'Leave Arthur a note')} subtitle={t('Un retour, un encouragement — ça lui fera plaisir.', 'A bit of feedback or encouragement — he’ll appreciate it.')}>
          <CoachMessageForm type="note" minimal messagePlaceholder={t('Votre mot pour Arthur…', 'Your note for Arthur…')} submitLabel={t('Envoyer le mot', 'Send note')} />
        </Block>

        {/* #4 · Télécharger */}
        <Block id="download" icon="doc" title={t('Télécharger le dossier', 'Download the packet')} subtitle={t('La fiche de recrutement en PDF + le contact d’Arthur (vCard).', 'The recruiting sheet as PDF + Arthur’s contact (vCard).')}>
          <DownloadPacket profile={profile} />
        </Block>

        <p className="no-print pt-2 text-center text-xs text-tertiary">
          {t('Profil généré depuis les données de l’athlète · Road to NCAA', 'Profile generated from the athlete’s data · Road to NCAA')}
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
