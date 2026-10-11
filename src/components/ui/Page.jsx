import Icon from '../Icons.jsx'

// En-tête de page partagé (icône + titre + sous-titre), dans le langage de la refonte.
// À placer en haut d'un onglet, AU-DESSUS des cartes (pas dans un panneau).
export function PageHeader({ icon, title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent ring-1 ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]">
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-black leading-tight tracking-tight text-heading">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-secondary">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// Carte générique (surface + filet + rayon + ombre douce), unité de base du « bento ».
export function Card({ className = '', children }) {
  return <div className={'panel p-5 ' + className}>{children}</div>
}

// Petit intitulé de section à l'intérieur d'une carte.
export function CardHead({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-tertiary">{children}</h3>
      {action}
    </div>
  )
}
