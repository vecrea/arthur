import { useState } from 'react'
import { Stat, FitBadge, ScorePill, divColor } from './ui.jsx'
import { WEBSITES, NCSA_URL } from '../data/universities.js'

const fmtCost = (n) => '$' + Math.round(n / 1000) + 'k/an'

export default function UniversityCard({ u, isFav, onToggleFav }) {
  const [open, setOpen] = useState(false)

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <div className="flex items-start gap-4 p-4">
        <ScorePill score={u.match} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-extrabold text-navy-900">
                {u.shortName}
              </h3>
              <p className="text-sm text-slate-500">
                {u.sunshine >= 4 ? '☀️ ' : ''}
                {u.city}, {u.state} · {u.type}
              </p>
            </div>
            <button
              onClick={() => onToggleFav(u.id)}
              aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className="shrink-0 text-2xl leading-none transition hover:scale-110"
              title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              {isFav ? '⭐' : '☆'}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-xs font-bold text-white"
              style={{ background: divColor(u.division) }}
            >
              {u.division}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {u.conference}
            </span>
            <FitBadge fit={u.fit} />
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              {fmtCost(u.costUSD)}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
            <Stat label="Natation" value={u.swim} color="#0ea5e9" />
            <Stat label="Économie" value={u.econ} color="#7c3aed" />
            <Stat label="Sport (ambiance)" value={u.athletics} color="#e63946" />
            <Stat label="Soleil" value={u.sunshine} color="#f59e0b" />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {WEBSITES[u.id] && (
              <a
                href={WEBSITES[u.id]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-navy-800"
              >
                🌐 Site officiel ↗
              </a>
            )}
            <a
              href={NCSA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-pool-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-pool-600"
            >
              🎯 NCSA Recruiting ↗
            </a>
          </div>
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-2 text-xs font-semibold text-pool-600 hover:bg-slate-50"
      >
        {open ? 'Masquer les détails' : 'Voir les détails'}
        <span className={'transition ' + (open ? 'rotate-180' : '')}>⌄</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-sm">
          <p className="text-slate-700">
            <span className="font-semibold">🏊 Natation :</span> {u.swimNote}
          </p>
          <p className="text-slate-700">
            <span className="font-semibold">💶 Bourses :</span> {u.scholarshipNote}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {u.highlights.map((h) => (
              <span key={h} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                {h}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              ['Sport', u.breakdown.sport],
              ['Études', u.breakdown.academic],
              ['Lifestyle', u.breakdown.lifestyle],
              ['Coût', u.breakdown.cost],
            ].map(([label, v]) => (
              <div key={label} className="rounded-lg bg-white p-2 text-center ring-1 ring-slate-200">
                <div className="font-display text-base font-extrabold text-navy-900">{v}</div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
