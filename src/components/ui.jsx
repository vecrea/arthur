// Petits composants visuels reutilisables.
import { useLang } from '../lib/i18n.jsx'

export function Dots({ value, max = 5, color = '#0ea5e9' }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value}/${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-3 rounded-full"
          style={{ background: i < value ? color : 'rgba(15,23,42,0.12)' }}
        />
      ))}
    </span>
  )
}

export function Stat({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <Dots value={value} color={color} />
    </div>
  )
}

export function FitBadge({ fit }) {
  const { t } = useLang()
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white"
      style={{ background: fit.color }}
    >
      <span>{fit.emoji}</span>
      {t(fit.label, fit.labelEn)}
    </span>
  )
}

// Pastille publique / privée (couleur + icône). Robuste FR ou EN en entrée.
export function TypeBadge({ type }) {
  const { t } = useLang()
  if (!type) return null
  const isPublic = /^public/i.test(type) // 'Public' ou 'Publique'
  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ' +
        (isPublic ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700')
      }
    >
      {isPublic ? '🏛️' : '🎓'} {isPublic ? t('Publique', 'Public') : t('Privée', 'Private')}
    </span>
  )
}

// Pastille de score 0-100 avec couleur graduee.
export function ScorePill({ score, size = 'md' }) {
  const color = score >= 80 ? '#16a34a' : score >= 65 ? '#0ea5e9' : score >= 50 ? '#f59e0b' : '#94a3b8'
  const dim = size === 'lg' ? 'h-16 w-16 text-2xl' : 'h-12 w-12 text-lg'
  return (
    <div
      className={`flex ${dim} shrink-0 flex-col items-center justify-center rounded-2xl font-display font-extrabold text-white shadow-md`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      title={`Score de compatibilité : ${score}/100`}
    >
      {score}
      <span className="-mt-1 text-[9px] font-semibold uppercase tracking-wider opacity-80">match</span>
    </div>
  )
}

export function divColor(div) {
  return { D1: '#0a1633', D2: '#0284c7', D3: '#16a34a' }[div] ?? '#475569'
}
