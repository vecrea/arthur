import { useEffect, useMemo, useState } from 'react'
import AboutMe from './AboutMe.jsx'
import AthleteSheet from './AthleteSheet.jsx'
import Icon from './Icons.jsx'
import FitTool from './coach/FitTool.jsx'
import CoachMessageForm from './coach/CoachMessageForm.jsx'
import CoachRequests from './coach/CoachRequests.jsx'
import CoachFaq from './coach/CoachFaq.jsx'
import DownloadPacket from './coach/DownloadPacket.jsx'
import { Reveal, Counter, Marquee, PoolCanvas } from './coach/cine.jsx'
import PortraitReveal from './coach/PortraitReveal.jsx'
import { EVENTS, lcmToScy, formatTime, scyLevel, LEVELS, athleteLevel, STROKE_EN } from '../lib/convert.js'
import { loadAbout, loadProfileExtras } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// ---------------------------------------------------------------------------
// Vue coach « cinématique » (page ?coach) : expérience immersive sombre + néon
// aqua, typo géante, animations au scroll — inspirée des sites de sportifs
// premium. Garde et met en avant tous les outils (contact, test des temps,
// FAQ, demandes, mot, téléchargement) ; la fiche PDF reste imprimable.
// ---------------------------------------------------------------------------
export default function CoachView({ profile }) {
  const { t, lang, setLang } = useLang()

  // La page coach est toujours sombre (cinématique).
  useEffect(() => {
    const prev = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = 'dark'
    return () => { document.documentElement.dataset.theme = prev }
  }, [])

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

  const age = Math.floor((Date.now() - new Date(profile.birthDate)) / (365.25 * 864e5))
  const today = new Date()
  const target = new Date(`${profile.usEntryYear}-08-15`)
  const days = Math.max(0, Math.ceil((target - today) / 86400000))
  const months = Math.round(days / 30.44)

  const times = useMemo(
    () => EVENTS.filter((ev) => profile.times?.[ev.key] != null).map((ev) => {
      const lcm = profile.times[ev.key]
      return { ev, lcm, scy: lcmToScy(lcm, ev.distance) }
    }),
    [profile],
  )
  const bestFree = times.find((x) => x.ev.key === '50FR') || times[0]

  // Barre de progression du scroll.
  const [prog, setProg] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setProg(max > 0 ? (h.scrollTop / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#05070f] text-white" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Barre de progression */}
      <div className="no-print fixed left-0 top-0 z-50 h-[3px] bg-gradient-to-r from-cyan-400 to-sky-400 shadow-[0_0_12px_rgba(45,212,238,0.7)]" style={{ width: `${prog}%` }} />

      {/* En-tête fixe translucide */}
      <header className="no-print fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white ring-1 ring-white/15" style={{ background: 'linear-gradient(135deg,#22d3ee,#0a6bb0)' }}>
              <Wave />
            </div>
            <div className="font-display text-sm font-extrabold tracking-tight text-white">Road to <span className="text-cyan-300">NCAA</span></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scrollTo('contact')} className="hidden rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 sm:inline-block">
              {t('Contact', 'Contact')}
            </button>
            <div className="inline-flex rounded-lg border border-white/15 bg-white/5 p-0.5 text-xs font-semibold backdrop-blur">
              {['fr', 'en'].map((lg) => (
                <button key={lg} onClick={() => setLang(lg)} className={'rounded-md px-2.5 py-1 transition ' + (lang === lg ? 'bg-cyan-400 text-[#05070f]' : 'text-white/70 hover:text-white')}>{lg.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="no-print">
        {/* ============ HERO ============ */}
        <section className="grain relative flex min-h-[100svh] items-center overflow-hidden">
          <PoolCanvas className="absolute inset-0 h-full w-full" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#05070f]/30 via-transparent to-[#05070f]" />
          <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-4 px-6 pb-10 pt-24 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:pt-16">
            {/* Texte */}
            <div className="order-2 lg:order-1">
              <Reveal><div className="mb-4 text-[11px] font-bold uppercase tracking-[0.38em] text-cyan-300/90">Road to NCAA — Recruiting {profile.usEntryYear}</div></Reveal>
              <Reveal delay={0.08}>
                <h1 className="font-cine uppercase leading-[0.8] text-white cine-glow" style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}>{profile.name}</h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-4 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
                  {t('Nageur belge,', 'Belgian swimmer,')} {age} {t('ans', 'years old')} · {specialty}. <span className="text-cyan-300">{t('Cap sur la NCAA Division 1.', 'Aiming for NCAA Division 1.')}</span>
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button onClick={() => scrollTo('contact')} className="group inline-flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-3.5 text-sm font-bold text-[#05070f] shadow-[0_0_30px_rgba(45,212,238,0.5)] transition hover:shadow-[0_0_44px_rgba(45,212,238,0.85)]">
                    {t('Je suis intéressé(e)', 'I’m interested')} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </button>
                  <button onClick={() => scrollTo('file')} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">
                    <Icon name="doc" className="h-4 w-4" /> {t('Le dossier', 'The packet')}
                  </button>
                </div>
              </Reveal>
            </div>

            {/* Portrait à révélation (bonnet + lunettes au survol) */}
            <Reveal delay={0.12} className="order-1 lg:order-2">
              <div className="relative mx-auto h-[40vh] w-full max-w-xs sm:max-w-sm lg:h-[74vh] lg:max-w-none">
                <PortraitReveal className="h-full w-full" />
                <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center">
                  <span className="cine-float rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold text-white/85 ring-1 ring-white/15 backdrop-blur">
                    {t('Survolez / touchez le portrait', 'Hover / tap the portrait')} <span className="text-cyan-300">✦</span>
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
          {/* Indicateur de scroll */}
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
            <div className="flex h-9 w-5 justify-center rounded-full border border-white/25 pt-1.5">
              <span className="h-1.5 w-1 rounded-full bg-cyan-300 cine-scrolldot" />
            </div>
          </div>
        </section>

        {/* ============ MARQUEE ============ */}
        <div className="border-y border-white/10 bg-cyan-400/[0.04] py-4">
          <Marquee
            className="font-cine text-xl uppercase tracking-wide text-white/80 sm:text-2xl"
            items={[`${t('Promo', 'Class of')} ${profile.usEntryYear}`, t('Nageur belge', 'Belgian swimmer'), 'Sprint Free & Back', 'NCAA Division 1', `${lang === 'en' ? proj.shortEn : proj.short}`, 'Road to USA']}
          />
        </div>

        {/* ============ STATS ============ */}
        <section className="relative py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 text-center sm:grid-cols-4">
            <Stat text={String(age)} label={t('ans', 'years old')} />
            <Stat text={String(months)} label={t('mois avant la rentrée', 'months to enrollment')} count value={months} />
            {bestFree && <Stat value={bestFree.scy} decimals={2} label={`${t('meilleur', 'best')} ${t(bestFree.ev.label, bestFree.ev.labelEn)} · yards`} count />}
            <Stat text={lang === 'en' ? proj.shortEn : proj.short} label={t('objectif 2028', '2028 target')} glow={proj.color} />
          </div>
        </section>

        {/* ============ LE NAGEUR (présentation + progression) ============ */}
        <CineSection id="swimmer" eyebrow={t('Le nageur', 'The swimmer')} title={t('Qui est Arthur', 'Meet Arthur')}>
          <AboutMe profile={profile} coachView />
        </CineSection>

        {/* ============ LES TEMPS ============ */}
        <section className="relative py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle eyebrow={t('Performances', 'Performances')} title={t('Les chronos', 'The times')} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {times.map((x, i) => <TimeCard key={x.ev.key} {...x} delay={(i % 3) * 0.08} />)}
            </div>
            <Reveal className="mt-5 text-center text-sm text-white/50">
              {t('Temps grand bassin (50 m) — conversion yards (SCY) indicative pour les standards US.', 'Long-course (50 m) times — indicative yards (SCY) conversion for US standards.')}
            </Reveal>
          </div>
        </section>

        {/* ============ FIT TOOL ============ */}
        <CineSection id="fit" eyebrow={t('Compatibilité', 'Fit')} title={t('À votre niveau ?', 'Does he fit?')}>
          <div className="cine-card p-5 sm:p-7">
            <p className="mb-5 text-white/70">{t('Choisissez le niveau de votre programme (ou entrez vos temps de recrutement) — la comparaison est instantanée.', 'Pick your program’s level (or enter your recruiting cut times) — the comparison is instant.')}</p>
            <FitTool profile={profile} />
          </div>
        </CineSection>

        {/* ============ LE DOSSIER ============ */}
        <section id="file" className="relative py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-6">
            <SectionTitle eyebrow={t('Dossier', 'Packet')} title={t('Le dossier complet', 'The full packet')} />
            <Reveal>
              <div className="cine-card overflow-hidden p-7 text-center sm:p-10">
                <p className="mx-auto mb-6 max-w-xl text-white/70">{t('La fiche de recrutement en PDF (académique, natation, meilleurs temps) + le contact d’Arthur à enregistrer d’un geste.', 'The recruiting sheet as a PDF (academics, swimming, best times) + Arthur’s contact to save in one tap.')}</p>
                <div className="flex justify-center">
                  <DownloadPacket profile={profile} />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section id="contact" className="relative overflow-hidden py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(45,212,238,0.10), transparent 70%)' }} />
          <div className="relative mx-auto max-w-3xl px-6">
            <Reveal className="text-center">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">{t('Recrutement', 'Recruiting')}</div>
              <h2 className="font-cine text-5xl uppercase leading-none text-white sm:text-7xl cine-glow">{t('Parlons-en', 'Let’s talk')}</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/70">{t('Présentez-vous — votre message arrive directement à Arthur.', 'Introduce yourself — your message goes straight to Arthur.')}</p>
            </Reveal>

            {(ig || email || phone) && (
              <Reveal className="mt-7 flex flex-wrap justify-center gap-2.5">
                {ig && <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"><InstagramIcon /> @{ig}</a>}
                {email && <ContactChip href={`mailto:${email}`} value={email} icon={<MailIcon />} />}
                {phone && <ContactChip href={`tel:${phone}`} value={phone} icon={<PhoneIcon />} />}
              </Reveal>
            )}

            <Reveal delay={0.1} className="mt-8">
              <div className="cine-card p-5 sm:p-7">
                <CoachMessageForm type="interest" messagePlaceholder={t('Votre message (programme, intérêt, questions…)', 'Your message (program, interest, questions…)')} submitLabel={t('Envoyer à Arthur', 'Send to Arthur')} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ OUTILS SUPPLÉMENTAIRES ============ */}
        <section className="relative mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-5 lg:grid-cols-2">
            <ToolCard icon="steps" title={t('Demandes rapides', 'Quick requests')} subtitle={t('Vidéo, relevé, appel, temps récents.', 'Video, transcript, call, latest times.')}><CoachRequests /></ToolCard>
            <ToolCard icon="star" title={t('Laisser un mot', 'Leave a note')} subtitle={t('Un retour, un encouragement.', 'Feedback or encouragement.')}><CoachMessageForm type="note" minimal messagePlaceholder={t('Votre mot pour Arthur…', 'Your note for Arthur…')} submitLabel={t('Envoyer', 'Send')} /></ToolCard>
          </div>
          <div className="mt-5">
            <ToolCard icon="book" title={t('Questions fréquentes', 'Recruiting FAQ')} subtitle={t('Académique, éligibilité, visa — déjà répondu.', 'Academics, eligibility, visa — already answered.')}><CoachFaq profile={profile} /></ToolCard>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="border-t border-white/10 py-10 text-center">
          <div className="font-cine text-2xl uppercase tracking-wide text-white/90">Road to <span className="text-cyan-300">NCAA</span></div>
          <p className="mt-2 text-xs text-white/40">{t('Profil généré depuis les données de l’athlète', 'Profile generated from the athlete’s data')} · {profile.name} · {profile.usEntryYear}</p>
        </footer>
      </div>

      {/* Fiche imprimable (écran : cachée ; impression : seule visible) */}
      <div className="print-only">
        <AthleteSheet profile={profile} coachView />
      </div>
    </div>
  )
}

// ---- Sous-composants cinématiques ----------------------------------------

function SectionTitle({ eyebrow, title }) {
  return (
    <Reveal className="mb-10 text-center">
      {eyebrow && <div className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">{eyebrow}</div>}
      <h2 className="font-cine text-4xl uppercase leading-none tracking-tight text-white sm:text-6xl">{title}</h2>
    </Reveal>
  )
}

function CineSection({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
      <SectionTitle eyebrow={eyebrow} title={title} />
      <Reveal delay={0.08}>{children}</Reveal>
    </section>
  )
}

function Stat({ value, text, label, decimals = 0, count = false, glow }) {
  return (
    <Reveal>
      <div className="font-cine uppercase leading-none text-white cine-glow" style={{ fontSize: 'clamp(2.75rem, 7vw, 4.5rem)', color: glow || undefined, textShadow: glow ? `0 0 26px ${glow}66` : undefined }}>
        {count ? <Counter value={value} decimals={decimals} /> : text}
      </div>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">{label}</div>
    </Reveal>
  )
}

function TimeCard({ ev, lcm, scy, delay }) {
  const { t, lang } = useLang()
  const lv = LEVELS[scyLevel(scy, ev.key)]
  return (
    <Reveal delay={delay} className="cine-card group relative overflow-hidden p-5 transition hover:-translate-y-1">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40" style={{ background: lv.color }} />
      <div className="relative flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-cyan-300/70">{t(ev.label, ev.labelEn)}</div>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: lv.color }}>{lang === 'en' ? lv.shortEn : lv.short}</span>
      </div>
      <div className="relative mt-3 font-cine text-5xl text-white">{formatTime(lcm)}</div>
      <div className="relative mt-1 text-sm text-white/50">≈ {formatTime(scy)} yards · {t(ev.stroke, STROKE_EN[ev.stroke])}</div>
    </Reveal>
  )
}

function ToolCard({ icon, title, subtitle, children }) {
  return (
    <Reveal className="cine-card p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/25">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-lg font-extrabold leading-tight text-white">{title}</h3>
          <p className="text-sm text-white/55">{subtitle}</p>
        </div>
      </div>
      {children}
    </Reveal>
  )
}

function ContactChip({ href, value, icon }) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)
  return (
    <a
      href={href}
      onClick={() => { try { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* ignore */ } }}
      title={t('Cliquer pour copier', 'Click to copy')}
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      {icon}
      <span className="max-w-[13rem] truncate">{copied ? t('Copié ✓', 'Copied ✓') : value}</span>
    </a>
  )
}

function Wave() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8c1.6-1.7 3.2-1.7 4.8 0S11 9.7 12.6 8s3.2-1.7 4.8 0S20.6 9.7 22.2 8" />
      <path d="M3 13c1.6-1.7 3.2-1.7 4.8 0S11 14.7 12.6 13s3.2-1.7 4.8 0S20.6 14.7 22.2 13" />
      <path d="M3 18c1.6-1.7 3.2-1.7 4.8 0S11 19.7 12.6 18s3.2-1.7 4.8 0S20.6 19.7 22.2 18" />
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
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
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 6 10 7L22 6" />
    </svg>
  )
}
