import { useState } from 'react'
import { getApiKey, setApiKey, getModel, setModel, MODELS } from '../lib/ai.js'
import { useLang } from '../lib/i18n.jsx'

export default function Ia() {
  const { t } = useLang()
  const [key, setKey] = useState(() => getApiKey())
  const [model, setMod] = useState(() => getModel())
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = () => {
    setApiKey(key)
    setModel(model)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  const clear = () => {
    setApiKey('')
    setKey('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="panel overflow-hidden">
        <div className="p-5">
        <h2 className="font-display text-xl font-extrabold text-heading">{t('Assistant IA', 'AI assistant')}</h2>
        <p className="mt-1 text-sm text-secondary">
          {t(
            <>
              Branche l'IA (Claude) pour : expliquer <strong>pourquoi chaque fac te correspond</strong> (bouton « Pourquoi ? » dans les
              cartes) et <strong>générer tes emails aux coachs</strong> (onglet Coachs).
            </>,
            <>
              Plug in the AI (Claude) to: explain <strong>why each school fits you</strong> (the “Why?” button on the cards) and{' '}
              <strong>generate your emails to coaches</strong> (Coaches tab).
            </>,
          )}
        </p>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Ta clé API Claude', 'Your Claude API key')}</label>
          <div className="mt-1 flex gap-2">
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-..."
              className="field font-mono"
            />
            <button onClick={() => setShow((s) => !s)} className="rounded-lg surface-3 px-3 text-sm font-semibold text-secondary hover:surface-2">
              {show ? '🙈' : '👁️'}
            </button>
          </div>
          <p className="mt-1 text-xs text-tertiary">
            {t('Stockée uniquement dans ton navigateur. Crée une clé sur', 'Stored only in your browser. Create a key at')}{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
              console.anthropic.com ↗
            </a>{' '}
            {t("(charge ~5 $ de crédit, ça suffit pour des centaines d'usages).", '(load ~$5 of credit, enough for hundreds of uses).')}
          </p>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Modèle', 'Model')}</label>
          <div className="mt-1 space-y-2">
            {MODELS.map((m) => (
              <label key={m.id} className={'flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 ' + (model === m.id ? 'border-pool-500 bg-accent-soft' : 'border-hair')}>
                <input type="radio" name="model" checked={model === m.id} onChange={() => setMod(m.id)} className="accent-pool-500" />
                <span className="flex-1 text-sm font-semibold text-heading">{m.label}</span>
                <span className="text-xs text-tertiary">{m.cost}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button onClick={save} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-navy-800">
            {t('Enregistrer', 'Save')}
          </button>
          {key && (
            <button onClick={clear} className="rounded-full surface-3 px-4 py-2 text-sm font-semibold text-secondary hover:surface-2">
              {t('Effacer la clé', 'Clear key')}
            </button>
          )}
          {saved && <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t('✓ Enregistré', '✓ Saved')}</span>}
        </div>
        </div>
      </div>

      <div className="px-1 text-xs text-secondary">
        <p className="font-semibold text-heading">{t('Comment ça marche ?', 'How does it work?')}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>{t("Tu paies seulement quand tu cliques sur un bouton IA (pas d'abonnement).", 'You only pay when you click an AI button (no subscription).')}</li>
          <li>{t('« Pourquoi ? » est mis en cache : pas de re-paiement si tu reviens sur la même fac.', 'The “Why?” answer is cached: no repeat charge if you revisit the same school.')}</li>
          <li>{t("Les emails sont en anglais (pour les coachs US) — relis-les et personnalise avant d'envoyer.", 'Emails are in English (for US coaches) — review and personalize them before sending.')}</li>
          <li>{t("Si l'IA ne répond pas en ouvrant le fichier en local, c'est une protection du navigateur : la version en ligne (GitHub Pages) la débloque.", 'If the AI doesn’t respond when opening the file locally, that’s a browser protection: the online version (GitHub Pages) unblocks it.')}</li>
        </ul>
      </div>
    </div>
  )
}
