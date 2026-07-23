import { Dots, FitBadge, TypeBadge, divColor } from './ui.jsx'
import { useLang } from '../lib/i18n.jsx'

export default function Compare({ unis, onToggleFav }) {
  const { t } = useLang()
  const fmtCost = (n) => '$' + Math.round(n / 1000) + 'k' + t('/an', '/yr')

  const ROWS = [
    { label: t('Compatibilité', 'Match'), render: (u) => <span className="font-display text-lg font-extrabold text-navy-900">{u.match}</span> },
    { label: t('Recrutement', 'Recruiting'), render: (u) => <FitBadge fit={u.fit} /> },
    { label: 'Division', render: (u) => (
        <span className="rounded-md px-2 py-0.5 text-xs font-bold text-white" style={{ background: divColor(u.division) }}>{u.division}</span>
      ) },
    { label: 'Type', render: (u) => <TypeBadge type={u.type} /> },
    { label: t('Lieu', 'Location'), render: (u) => <span className="text-sm text-slate-600">{u.sunshine >= 4 ? '' : ''}{u.city}, {u.state}</span> },
    { label: t('Natation', 'Swimming'), render: (u) => <Dots value={u.swim} color="#0ea5e9" /> },
    { label: t('Économie', 'Economics'), render: (u) => <Dots value={u.econ} color="#7c3aed" /> },
    { label: t('Ambiance sport', 'Sports vibe'), render: (u) => <Dots value={u.athletics} color="#e63946" /> },
    { label: t('Soleil', 'Sun'), render: (u) => <Dots value={u.sunshine} color="#f59e0b" /> },
    { label: t('Sélectivité', 'Selectivity'), render: (u) => <Dots value={u.admission} color="#475569" /> },
    { label: t('Coût (intl)', 'Cost (intl)'), render: (u) => <span className="text-sm font-semibold text-emerald-700">{fmtCost(u.costUSD)}</span> },
    { label: t('Bourses', 'Scholarships'), render: (u) => <span className="text-xs text-slate-500">{u.scholarshipNote}</span> },
  ]

  if (unis.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-card ring-1 ring-slate-900/5">
        <p className="font-semibold text-navy-900">{t("Aucune fac à comparer pour l'instant", 'No schools to compare yet')}</p>
        <p className="mt-1 text-sm text-slate-500">
          {t(
            'Ajoute des universités à tes favoris (⭐) depuis le classement pour les comparer ici.',
            'Add universities to your favorites (⭐) from the rankings to compare them here.',
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-3xl bg-white shadow-card ring-1 ring-slate-900/5">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('Critère', 'Criterion')}
            </th>
            {unis.map((u) => (
              <th key={u.id} className="min-w-44 border-l border-slate-100 p-3 text-left align-top">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-sm font-extrabold leading-tight text-navy-900">{u.shortName}</span>
                  <button onClick={() => onToggleFav(u.id)} title={t('Retirer', 'Remove')} className="text-lg leading-none hover:scale-110">⭐</button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={row.label} className={i % 2 ? 'bg-slate-50/50' : ''}>
              <td className="sticky left-0 z-10 whitespace-nowrap bg-inherit p-3 text-xs font-semibold text-slate-500">
                {row.label}
              </td>
              {unis.map((u) => (
                <td key={u.id} className="border-l border-slate-100 p-3 align-middle">{row.render(u)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
