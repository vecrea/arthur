import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { onCloudState, cloudSignIn, cloudSignOut } from '../lib/cloud.js'
import { useLang } from '../lib/i18n.jsx'

// Contrôle de synchronisation cloud (dans l'en-tête) : connexion + statut.
// Déconnecté → bouton « Synchroniser » (formulaire email/mot de passe).
// Connecté → pastille verte « Synchronisé » + déconnexion.
export default function CloudSync() {
  const { t } = useLang()
  const [state, setState] = useState({ user: null, pushedAt: 0, error: null })
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const wrapRef = useRef(null)

  useEffect(() => onCloudState(setState), [])

  // Ferme la fenêtre avec la touche Échap.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const user = state.user
  const signedIn = !!user

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await cloudSignIn(email, pass)
      setOpen(false)
      setEmail('')
      setPass('')
    } catch {
      setErr(t('Email ou mot de passe incorrect.', 'Wrong email or password.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        title={signedIn ? t('Synchronisé', 'Synced') : t('Se connecter pour synchroniser', 'Sign in to sync')}
        className={
          'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition ' +
          (signedIn
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : 'border-hair surface-2 text-secondary hover:text-heading')
        }
      >
        {signedIn ? <CloudCheck /> : <CloudIcon />}
        <span className="hidden sm:inline">{signedIn ? t('Synchro', 'Synced') : t('Synchro', 'Sync')}</span>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl surface border border-hair p-6 shadow-panel sm:p-7">
            <button
              onClick={() => setOpen(false)}
              aria-label={t('Fermer', 'Close')}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-tertiary transition hover:surface-2 hover:text-heading"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>

            {signedIn ? (
              <div>
                <div className="flex items-center gap-2 text-base font-bold text-emerald-700 dark:text-emerald-300">
                  <CloudCheck /> {t('Synchronisé', 'Synced')}
                </div>
                <p className="mt-1 break-all text-sm text-secondary">{user.email}</p>
                <p className="mt-3 text-sm text-tertiary">
                  {t(
                    'Tes modifications sont enregistrées dans le cloud et retrouvées sur tous tes appareils.',
                    'Your changes are saved to the cloud and available on all your devices.',
                  )}
                </p>
                <button
                  onClick={async () => { await cloudSignOut(); setOpen(false) }}
                  className="mt-5 w-full rounded-xl surface-2 border border-hair px-4 py-3 text-sm font-semibold text-primary transition hover:surface-3"
                >
                  {t('Se déconnecter', 'Sign out')}
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="flex items-center gap-2.5 text-lg font-extrabold text-heading">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent"><CloudIcon /></span>
                  {t('Synchroniser mes données', 'Sync my data')}
                </div>
                <p className="mt-2 text-sm text-secondary">
                  {t(
                    'Connecte-toi pour enregistrer tes données (temps, objectifs, favoris…) et les retrouver sur tous tes appareils.',
                    'Sign in to save your data (times, goals, favorites…) and find it on all your devices.',
                  )}
                </p>
                <label className="mt-5 block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Email', 'Email')}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    autoComplete="username"
                    className="field mt-1 py-3 text-base"
                    required
                  />
                </label>
                <label className="mt-3 block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Mot de passe', 'Password')}</span>
                  <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="field mt-1 py-3 text-base"
                    required
                  />
                </label>
                {err && <p className="mt-3 text-sm font-semibold text-flag-600 dark:text-flag-400">{err}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-5 w-full rounded-xl bg-pool-500 px-4 py-3 text-base font-bold text-white transition hover:bg-pool-600 disabled:opacity-60"
                >
                  {busy ? t('Connexion…', 'Signing in…') : t('Se connecter', 'Sign in')}
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 9.5 4 4 0 0 0 7 17.5" />
      <path d="M8 19h9.5" />
    </svg>
  )
}
function CloudCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 9.5 4 4 0 0 0 7 17.5" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  )
}
