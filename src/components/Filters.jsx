const SEG = 'rounded-full px-3 py-1.5 text-sm font-semibold transition'

function Segment({ options, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full bg-white p-1 ring-1 ring-slate-200">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={SEG + (value === o.value ? ' bg-navy-900 text-white' : ' text-slate-500 hover:text-navy-900')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Filters({ filters, setFilters, count }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))

  return (
    <div className="rounded-2xl bg-white/95 p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-3">
        <input
          type="search"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="🔎 Chercher une université, une ville, un état…"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-pool-500 focus:ring-2 focus:ring-pool-500/20"
        />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Division</p>
            <Segment
              value={filters.division}
              onChange={(v) => set({ division: v })}
              options={[
                { value: 'all', label: 'Toutes' },
                { value: 'D1', label: 'D1' },
                { value: 'D2', label: 'D2' },
                { value: 'D3', label: 'D3' },
              ]}
            />
          </div>

          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Recrutement</p>
            <Segment
              value={filters.fit}
              onChange={(v) => set({ fit: v })}
              options={[
                { value: 'all', label: 'Tous' },
                { value: 'safety', label: '✅ Réaliste' },
                { value: 'target', label: '🎯 Objectif' },
                { value: 'reach', label: '🔥 Ambitieux' },
              ]}
            />
          </div>

          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Trier par</p>
            <Segment
              value={filters.sort}
              onChange={(v) => set({ sort: v })}
              options={[
                { value: 'match', label: 'Compatibilité' },
                { value: 'swim', label: 'Natation' },
                { value: 'cost', label: 'Coût' },
              ]}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 self-end pb-1 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={filters.sunnyOnly}
              onChange={(e) => set({ sunnyOnly: e.target.checked })}
              className="h-4 w-4 rounded accent-spark-500"
            />
            ☀️ Soleil ++
          </label>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{count} université(s) affichée(s)</p>
    </div>
  )
}
