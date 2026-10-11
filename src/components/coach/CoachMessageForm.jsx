import { useState } from 'react'
import { submitCoachMessage } from '../../lib/cloud.js'
import { useLang } from '../../lib/i18n.jsx'
import Icon from '../Icons.jsx'

// Formulaire réutilisable : un coach dépose un message dans la boîte de réception.
// type: 'interest' | 'note' | 'question' | 'request'
// minimal: n'affiche que Nom + Email + message (pour « laisser un mot »).
export default function CoachMessageForm({ type = 'interest', minimal = false, messagePlaceholder, messageLabel, submitLabel }) {
  const { t } = useLang()
  const [f, setF] = useState({ coachName: '', team: '', position: '', coachEmail: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }))
  const valid = f.coachName.trim() && f.coachEmail.trim() && f.message.trim()

  const submit = async (e) => {
    e.preventDefault()
    if (!valid || status === 'sending') return
    setStatus('sending')
    try {
      await submitCoachMessage({ ...f, type })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/30">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Icon name="arrow" className="h-5 w-5" />
        </span>
        <div>
          <div className="font-bold text-emerald-700 dark:text-emerald-300">{t('Message envoyé ✓', 'Message sent ✓')}</div>
          <div className="text-sm text-secondary">{t('Arthur le verra et te répondra à ton adresse.', 'Arthur will see it and reply to your email.')}</div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={f.coachName} onChange={(e) => set('coachName', e.target.value)} placeholder={t('Ton nom *', 'Your name *')} className="field" autoComplete="name" />
        <input type="email" value={f.coachEmail} onChange={(e) => set('coachEmail', e.target.value)} placeholder={t('Ton email *', 'Your email *')} className="field" autoComplete="email" />
        {!minimal && <input value={f.team} onChange={(e) => set('team', e.target.value)} placeholder={t('Université / équipe', 'University / team')} className="field" />}
        {!minimal && <input value={f.position} onChange={(e) => set('position', e.target.value)} placeholder={t('Ton poste (head coach, recruteur…)', 'Your role (head coach, recruiter…)')} className="field" />}
      </div>
      <textarea
        value={f.message}
        onChange={(e) => set('message', e.target.value)}
        rows={minimal ? 2 : 4}
        placeholder={messagePlaceholder || t('Ton message *', 'Your message *')}
        className="field"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] text-tertiary">{t('* obligatoire. Tes coordonnées servent à te répondre.', '* required. Your details are only used to reply to you.')}</span>
        <button type="submit" disabled={!valid || status === 'sending'} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
          {status === 'sending' ? t('Envoi…', 'Sending…') : submitLabel || t('Envoyer', 'Send')}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-sm font-semibold text-flag-600 dark:text-flag-400">
          {t('Envoi impossible pour le moment. Réessaie, ou écris directement à Arthur.', 'Could not send right now. Try again, or email Arthur directly.')}
        </p>
      )}
    </form>
  )
}
