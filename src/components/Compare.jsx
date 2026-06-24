import { Dots, FitBadge, divColor } from './ui.jsx'

const fmtCost = (n) => '$' + Math.round(n / 1000) + 'k/an'

const ROWS = [
  { label: 'Compatibilité', render: (u) => <span className="font-display text-lg font-extrabold text-navy-900">{u.match}</span> },
  { label: 'Recrutement', render: (u) => <FitBadge fit={u.fit} /> },
  { label: 'Division', render: (u) => (
      <span className="rounded-md px-2 py-0.5 text-xs font-bold text-white" style={{ background: divColor(u.division) }}>{u.division}</span>
    ) },
  { label: 'Lieu', render: (u) => <span className="text-sm text-slate-600">{u.sunshine >= 4 ? '☀️ ' : ''}{u.city}, {u.state}</span> },
  { label: 'Natation', render: (u) => <Dots value={u.swim} color="#0ea5e9" /> },
  { label: 'Économie', render: (u) => <Dots value={u.econ} color="#7c3aed" /> },
  { label: 'Ambiance sport', render: (u) => <Dots value={u.athletics} color="#e63946" /> },
  { label: 'Soleil', render: (u) => <Dots value={u.sunshine} color="#f59e0b" /> },
  { label: 'Sélectivité', render: (u) => <Dots value={u.admission} color="#475569" /> },
  { label: 'Coût (intl)', render: (u) => <span className="text-sm font-semibold text-emerald-700">{fmtCost(u.costUSD)}</span> },
  { label: 'Bourses', render: (u) => <span className="text-xs text-slate-500">{u.scholarshipNote}</span> },
]

export default function Compare({ unis, onToggleFav }) {
  if (unis.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <div className="text-4xl">⚖️</div>
        <p className="mt-3 font-semibold text-navy-900">Aucune fac à comparer pour l'instant</p>
        <p className="mt-1 text-sm text-slate-500">
          Ajoute des universités à tes favoris (⭐) depuis le classement pour les comparer ici.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Critère
            </th>
            {unis.map((u) => (
              <th key={u.id} className="min-w-44 border-l border-slate-100 p-3 text-left align-top">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-sm font-extrabold leading-tight text-navy-900">{u.shortName}</span>
                  <button onClick={() => onToggleFav(u.id)} title="Retirer" className="text-lg leading-none hover:scale-110">⭐</button>
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
