import { useState } from 'react'
import { getApiKey, setApiKey, getModel, setModel, MODELS } from '../lib/ai.js'

export default function Ia() {
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
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-display text-xl font-extrabold text-navy-900">🤖 Assistant IA</h2>
        <p className="mt-1 text-sm text-slate-500">
          Branche l'IA (Claude) pour : expliquer <strong>pourquoi chaque fac te correspond</strong> (bouton « Pourquoi ? »
          dans les cartes) et <strong>générer tes emails aux coachs</strong> (onglet Coachs).
        </p>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ta clé API Claude</label>
          <div className="mt-1 flex gap-2">
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-pool-500 focus:ring-2 focus:ring-pool-500/20"
            />
            <button onClick={() => setShow((s) => !s)} className="rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-200">
              {show ? '🙈' : '👁️'}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            🔒 Stockée uniquement dans ton navigateur. Crée une clé sur{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="font-medium text-pool-600 hover:underline">
              console.anthropic.com ↗
            </a>{' '}
            (charge ~5 $ de crédit, ça suffit pour des centaines d'usages).
          </p>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Modèle</label>
          <div className="mt-1 space-y-2">
            {MODELS.map((m) => (
              <label key={m.id} className={'flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 ' + (model === m.id ? 'border-pool-500 bg-pool-50/50' : 'border-slate-200')}>
                <input type="radio" name="model" checked={model === m.id} onChange={() => setMod(m.id)} className="accent-pool-500" />
                <span className="flex-1 text-sm font-semibold text-navy-900">{m.label}</span>
                <span className="text-xs text-slate-400">{m.cost}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button onClick={save} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-navy-800">
            Enregistrer
          </button>
          {key && (
            <button onClick={clear} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">
              Effacer la clé
            </button>
          )}
          {saved && <span className="text-sm font-semibold text-emerald-600">✓ Enregistré</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-pool-200 bg-pool-50/60 p-4 text-sm text-slate-600">
        <p className="font-semibold text-navy-900">Comment ça marche ?</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Tu paies seulement quand tu cliques sur un bouton IA (pas d'abonnement).</li>
          <li>« Pourquoi ? » est mis en cache : pas de re-paiement si tu reviens sur la même fac.</li>
          <li>Les emails sont en anglais (pour les coachs US) — relis-les et personnalise avant d'envoyer.</li>
          <li>Si l'IA ne répond pas en ouvrant le fichier en local, c'est une protection du navigateur : la version en ligne (GitHub Pages) la débloque.</li>
        </ul>
      </div>
    </div>
  )
}
