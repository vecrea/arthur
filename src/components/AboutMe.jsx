import { useMemo, useState } from 'react'
import { EVENTS, formatTime, STROKE_EN } from '../lib/convert.js'
import { loadAbout, saveAbout, loadTimes } from '../lib/storage.js'
import { useLang } from '../lib/i18n.jsx'

// Les 4 épreuves mises en avant : 50/100 nage libre + 50/100 dos.
const KEY_EVENTS = ['50FR', '100FR', '50BK', '100BK']
const EV = Object.fromEntries(EVENTS.map((e) => [e.key, e]))
const EV_COLOR = { '50FR': '#0e88d3', '100FR': '#0a6bb0', '50BK': '#7c3aed', '100BK': '#6d28d9' }

// Lecture d'une éventuelle « vue coach » encodée dans l'URL (#coach=...).
function parseCoachHash() {
  try {
    const m = (window.location.hash || '').match(/coach=([^&]+)/)
    if (!m) return null
    return JSON.parse(decodeURIComponent(atob(m[1])))
  } catch {
    return null
  }
}

// Petit graphe SVG de progression (temps de course tels quels, plus rapide = plus haut).
function ProgressionChart({ points, color, t }) {
  if (!points.length) {
    return (
      <div className="flex h-52 items-center justify-center rounded-xl surface-2 border border-hair p-6 text-center text-sm text-secondary">
        {t(
          'Enregistre plusieurs chronos (onglet « Chronos ») pour faire apparaître ta courbe de progression ici.',
          'Log several times (in the “Times” tab) to reveal your progression curve here.',
        )}
      </div>
    )
  }
  const W = 600, H = 196, padX = 14, padT = 16, padB = 16
  const plotW = W - padX * 2
  const plotH = H - padT - padB
  const vals = points.map((p) => p.secs)
  let vmin = Math.min(...vals)
  let vmax = Math.max(...vals)
  if (vmax - vmin < 0.01) { vmin -= 0.5; vmax += 0.5 } // évite la division par 0 (points égaux)
  const x = (i) => (points.length === 1 ? padX + plotW / 2 : padX + (i * plotW) / (points.length - 1))
  const y = (v) => padT + ((v - vmin) / (vmax - vmin)) * plotH // vmin (plus rapide) en haut
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.secs).toFixed(1)}`).join(' ')
  const area = `${line} L${x(points.length - 1).toFixed(1)},${padT + plotH} L${x(0).toFixed(1)},${padT + plotH} Z`
  const first = points[0]
  const last = points[points.length - 1]
  const delta = first.secs - last.secs // > 0 = amélioration (temps qui baisse)
  const fmtDate = (d) => (d ? d.slice(5).replace('-', '/') : '')
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('Courbe de progression', 'Progression curve')}>
        <defs>
          <linearGradient id={`progFill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.20" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={padX} x2={W - padX} y1={padT + f * plotH} y2={padT + f * plotH} stroke="var(--border)" strokeWidth="1" />
        ))}
        {points.length > 1 && <path d={area} fill={`url(#progFill-${color.replace('#', '')})`} />}
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.secs)} r={i === points.length - 1 ? 5 : 3.5} fill={color} stroke="var(--surface)" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className="text-tertiary">{fmtDate(first.date)} · {formatTime(first.secs)}</span>
        {points.length > 1 && delta > 0.01 && (
          <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: color }}>−{delta.toFixed(2)} s</span>
        )}
        <span className="font-semibold text-heading">{fmtDate(last.date)} · {formatTime(last.secs)}</span>
      </div>
    </div>
  )
}

export default function AboutMe({ profile }) {
  const { t, lang } = useLang()
  const coach = useMemo(() => parseCoachHash(), [])
  const isCoach = !!coach

  const [about, setAbout] = useState(() => loadAbout())
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selected, setSelected] = useState('50FR')
  const [contactOpen, setContactOpen] = useState(false)

  // Source des données : la vue coach lit l'URL ; sinon le stockage local.
  const A = isCoach ? coach.about || {} : about
  const times = isCoach ? coach.times || [] : loadTimes()

  const age = Math.floor((Date.now() - new Date(profile.birthDate)) / (365.25 * 864e5))
  const defaultMsg = t(
    `Je m'appelle ${profile.name}, nageur belge de ${age} ans spécialisé en sprint (nage libre & dos). Je m'entraîne au ${profile.homeClub} avec ${profile.coach}, et j'ai récemment participé à un stage au Cercle des Nageurs de Marseille. Objectif : rejoindre un programme universitaire NCAA à la rentrée ${profile.usEntryYear} et progresser au plus haut niveau tout en étudiant l'économie.`,
    `My name is ${profile.name}, a 16-year-old Belgian swimmer specializing in sprint (freestyle & backstroke). I train at ${profile.homeClub} with ${profile.coach}, and recently attended a camp at Cercle des Nageurs de Marseille. Goal: join an NCAA college program in fall ${profile.usEntryYear} and reach the highest level while studying economics.`,
  )
  const message = A.message || defaultMsg

  const set = (patch) => {
    const next = { ...about, ...patch }
    setAbout(next)
    saveAbout(next)
  }

  const shareLink = () => {
    try {
      const payload = { about: loadAbout(), times: loadTimes() }
      const enc = btoa(encodeURIComponent(JSON.stringify(payload)))
      const url = `${window.location.origin}${window.location.pathname}#coach=${enc}`
      navigator.clipboard?.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      /* ignore */
    }
  }

  const igUrl = A.instagram ? `https://instagram.com/${String(A.instagram).replace(/^@/, '')}` : null

  // Points de progression de l'épreuve sélectionnée (temps tels qu'enregistrés).
  const evObj = EV[selected]
  const points = useMemo(
    () =>
      times
        .filter((x) => x.eventKey === selected && x.date)
        .map((x) => ({ date: x.date, secs: x.seconds }))
        .filter((p) => !Number.isNaN(p.secs))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [times, selected],
  )

  const contactField = 'field'

  return (
    <div className="panel overflow-hidden">
      {/* En-tête + outils (masqués en vue coach) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair p-5">
        <div>
          <h2 className="font-display text-xl font-extrabold text-heading">{t('Ma présentation', 'About me')}</h2>
          <p className="text-sm text-secondary">{t('Pour mieux me connaître', 'Get to know me')}</p>
        </div>
        {!isCoach && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing((e) => !e)}
              className="rounded-full surface-2 border border-hair px-4 py-1.5 text-sm font-semibold text-primary transition hover:surface-3"
            >
              {editing ? t('Terminer', 'Done') : t('Éditer', 'Edit')}
            </button>
            <button
              onClick={shareLink}
              className="rounded-full bg-pool-500 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-pool-600"
              title={t('Copie un lien qui contient tes infos, à envoyer aux coachs', 'Copies a link containing your info, to send to coaches')}
            >
              {copied ? t('Lien copié ✓', 'Link copied ✓') : t('Lien pour un coach', 'Coach link')}
            </button>
          </div>
        )}
      </div>

      {/* 1 · À propos de moi */}
      <div className="p-5 sm:p-6">
        {editing && !isCoach ? (
          <textarea
            value={about.message ?? ''}
            onChange={(e) => set({ message: e.target.value })}
            placeholder={defaultMsg}
            rows={4}
            className={contactField + ' leading-relaxed'}
          />
        ) : (
          <p className="max-w-3xl whitespace-pre-line leading-relaxed text-primary">{message}</p>
        )}

        {/* Instagram */}
        <div className="mt-4">
          {editing && !isCoach ? (
            <label className="block max-w-xs">
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">Instagram</span>
              <input value={about.instagram ?? ''} onChange={(e) => set({ instagram: e.target.value })} placeholder="@ton_pseudo" className={contactField + ' mt-1'} />
            </label>
          ) : igUrl ? (
            <a href={igUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full surface-2 border border-hair px-4 py-2 text-sm font-semibold text-primary transition hover:surface-3">
              <InstagramIcon />
              @{String(A.instagram).replace(/^@/, '')}
            </a>
          ) : (
            !isCoach && <p className="text-sm text-tertiary">{t('Ajoute ton Instagram via « Éditer ».', 'Add your Instagram via “Edit”.')}</p>
          )}
        </div>
      </div>

      {/* 2 · Progression : temps clés à gauche, courbe à droite */}
      <div className="border-t border-hair p-5 sm:p-6">
        <h3 className="mb-4 font-display text-lg font-extrabold text-heading">{t('Ma progression', 'My progression')}</h3>
        <div className="grid gap-5 md:grid-cols-[minmax(0,300px)_1fr]">
          {/* Meilleurs temps (cliquables → sélectionnent la courbe) */}
          <div className="flex flex-col gap-2">
            {KEY_EVENTS.map((k) => {
              const ev = EV[k]
              const lcm = profile.times?.[k]
              const on = selected === k
              return (
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  className={
                    'flex items-center justify-between rounded-xl border p-3 text-left transition ' +
                    (on ? 'surface-2 border-hair-strong' : 'surface border-hair hover:surface-2')
                  }
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t(ev.label, ev.labelEn)}</div>
                    <div className="text-[11px] text-tertiary">{t(ev.stroke, STROKE_EN[ev.stroke])}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl font-black" style={{ color: EV_COLOR[k] }}>{lcm != null ? formatTime(lcm) : '—'}</div>
                    <div className="text-[11px] text-tertiary">{lcm != null ? t('grand bassin', 'long course') : t('à renseigner', 'to add')}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Courbe */}
          <div className="min-w-0">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-heading">{t(evObj.label, evObj.labelEn)}</span>
              <span className="text-[11px] text-tertiary">{t('temps de course · plus rapide en haut', 'race time · faster at top')}</span>
            </div>
            <ProgressionChart points={points} color={EV_COLOR[selected]} t={t} />
          </div>
        </div>
      </div>

      {/* 3 · Contact */}
      <div className="border-t border-hair p-5 sm:p-6">
        {editing && !isCoach ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">Email</span>
              <input value={about.email ?? ''} onChange={(e) => set({ email: e.target.value })} placeholder="arthur@email.com" className={contactField + ' mt-1'} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Téléphone', 'Phone')}</span>
              <input value={about.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} placeholder="+32 ..." className={contactField + ' mt-1'} />
            </label>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setContactOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-800 dark:bg-pool-500 dark:hover:bg-pool-600"
            >
              {t('Contacter-moi', 'Contact me')}
              <span className={'transition ' + (contactOpen ? 'rotate-180' : '')}>⌄</span>
            </button>

            {contactOpen && (
              <div className="mt-3 flex flex-wrap gap-2">
                {igUrl && (
                  <a href={igUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full surface-2 border border-hair px-4 py-2 text-sm font-semibold text-primary transition hover:surface-3">
                    <InstagramIcon /> Instagram
                  </a>
                )}
                {A.phone && (
                  <a href={`tel:${A.phone}`} className="inline-flex items-center gap-2 rounded-full surface-2 border border-hair px-4 py-2 text-sm font-semibold text-primary transition hover:surface-3">
                    <PhoneIcon /> {t('Appeler', 'Call')}
                  </a>
                )}
                {A.email && (
                  <a href={`mailto:${A.email}`} className="inline-flex items-center gap-2 rounded-full surface-2 border border-hair px-4 py-2 text-sm font-semibold text-primary transition hover:surface-3">
                    <MailIcon /> Email
                  </a>
                )}
                {!igUrl && !A.phone && !A.email && (
                  <p className="text-sm text-tertiary">{isCoach ? '' : t('Ajoute tes coordonnées via « Éditer ».', 'Add your contact details via “Edit”.')}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
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
