import { useEffect, useRef, useState } from 'react'
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

  // Ferme le menu si on clique en dehors.
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
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

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl surface border border-hair p-4 shadow-card">
          {signedIn ? (
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                <CloudCheck /> {t('Synchronisé', 'Synced')}
              </div>
              <p className="mt-1 break-all text-xs text-secondary">{user.email}</p>
              <p className="mt-2 text-xs text-tertiary">
                {t(
                  'Tes modifications sont enregistrées dans le cloud et retrouvées sur tous tes appareils.',
                  'Your changes are saved to the cloud and available on all your devices.',
                )}
              </p>
              <button
                onClick={async () => {
                  await cloudSignOut()
                  setOpen(false)
                }}
                className="mt-3 w-full rounded-lg surface-2 border border-hair px-3 py-2 text-sm font-semibold text-primary transition hover:surface-3"
              >
                {t('Se déconnecter', 'Sign out')}
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="text-sm font-bold text-heading">{t('Connexion', 'Sign in')}</p>
              <p className="mt-1 text-xs text-secondary">
                {t('Connecte-toi pour synchroniser tes données partout.', 'Sign in to sync your data everywhere.')}
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                autoComplete="username"
                className="field mt-3"
                required
              />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder={t('mot de passe', 'password')}
                autoComplete="current-password"
                className="field mt-2"
                required
              />
              {err && <p className="mt-2 text-xs font-semibold text-flag-600 dark:text-flag-400">{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="mt-3 w-full rounded-lg bg-pool-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-pool-600 disabled:opacity-60"
              >
                {busy ? t('Connexion…', 'Signing in…') : t('Se connecter', 'Sign in')}
              </button>
            </form>
          )}
        </div>
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
