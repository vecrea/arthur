import { useState } from 'react'
import { submitCoachMessage } from '../../lib/cloud.js'
import { useLang } from '../../lib/i18n.jsx'
import Icon from '../Icons.jsx'

// Demandes rapides : le coach coche ce qu'il veut, laisse ses coordonnées, ça part dans la boîte.
export default function CoachRequests() {
  const { t } = useLang()
  const KINDS = [
    { key: 'video', icon: 'watch', fr: 'Une vidéo de course', en: 'A race video' },
    { key: 'transcript', icon: 'book', fr: 'Le relevé de notes / GPA', en: 'Transcript / GPA' },
    { key: 'call', icon: 'users', fr: 'Un appel (visio ou tél.)', en: 'A call (video or phone)' },
    { key: 'times', icon: 'watch', fr: 'Des temps récents à jour', en: 'Latest updated times' },
  ]
  const [picked, setPicked] = useState(() => new Set())
  const [f, setF] = useState({ coachName: '', coachEmail: '', team: '', slots: '' })
  const [status, setStatus] = useState('idle')
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }))
  const toggle = (k) => setPicked((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
  const wantsCall = picked.has('call')
  const valid = picked.size > 0 && f.coachName.trim() && f.coachEmail.trim()

  const submit = async (e) => {
    e.preventDefault()
    if (!valid || status === 'sending') return
    setStatus('sending')
    const labels = KINDS.filter((k) => picked.has(k.key)).map((k) => k.fr)
    try {
      await submitCoachMessage({
        type: 'request',
        coachName: f.coachName,
        coachEmail: f.coachEmail,
        team: f.team,
        requestKinds: labels,
        slots: f.slots,
        message: `${t('Demande', 'Request')} : ${labels.join(', ')}${f.slots ? ` · ${t('créneaux', 'slots')} : ${f.slots}` : ''}`,
      })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/30">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><Icon name="arrow" className="h-5 w-5" /></span>
        <div>
          <div className="font-bold text-emerald-700 dark:text-emerald-300">{t('Demande envoyée ✓', 'Request sent ✓')}</div>
          <div className="text-sm text-secondary">{t('Arthur te recontacte vite.', 'Arthur will get back to you soon.')}</div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {KINDS.map((k) => {
          const on = picked.has(k.key)
          return (
            <button
              type="button"
              key={k.key}
              onClick={() => toggle(k.key)}
              className={'flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-semibold transition ' + (on ? 'border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-accent-soft text-accent' : 'border-hair surface-2 text-secondary hover:text-heading')}
            >
              <span className={'flex h-8 w-8 items-center justify-center rounded-lg ' + (on ? 'bg-accent-soft text-accent' : 'surface-3 text-tertiary')}>
                <Icon name={on ? 'arrow' : k.icon} className="h-4 w-4" />
              </span>
              {t(k.fr, k.en)}
            </button>
          )
        })}
      </div>

      {wantsCall && (
        <input value={f.slots} onChange={(e) => set('slots', e.target.value)} placeholder={t('Tes créneaux pour l’appel (ex : mar/jeu 18h-20h CET)', 'Your call slots (e.g. Tue/Thu 6-8pm CET)')} className="field" />
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <input value={f.coachName} onChange={(e) => set('coachName', e.target.value)} placeholder={t('Ton nom *', 'Your name *')} className="field" />
        <input type="email" value={f.coachEmail} onChange={(e) => set('coachEmail', e.target.value)} placeholder={t('Ton email *', 'Your email *')} className="field" />
        <input value={f.team} onChange={(e) => set('team', e.target.value)} placeholder={t('Université / équipe', 'University / team')} className="field" />
      </div>

      <div className="flex items-center justify-end">
        <button type="submit" disabled={!valid || status === 'sending'} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
          {status === 'sending' ? t('Envoi…', 'Sending…') : t('Envoyer la demande', 'Send request')}
        </button>
      </div>
      {status === 'error' && <p className="text-sm font-semibold text-flag-600 dark:text-flag-400">{t('Envoi impossible pour le moment.', 'Could not send right now.')}</p>}
    </form>
  )
}
