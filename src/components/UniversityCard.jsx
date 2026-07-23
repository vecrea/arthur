import { useState } from 'react'
import { Stat, FitBadge, ScorePill, TypeBadge, divColor } from './ui.jsx'
import { NCSA_URL, siteLink } from '../data/universities.js'
import { VERIFIED_COACHES, coachsStaffLink, COACHES_AS_OF } from '../data/coaches.js'
import { explainFit, loadWhyCache, saveWhy, hasApiKey } from '../lib/ai.js'
import { netCost } from '../lib/cost.js'
import { useLang } from '../lib/i18n.jsx'

export default function UniversityCard({ u, isFav, onToggleFav, profile }) {
  const { t, lang } = useLang()
  const [open, setOpen] = useState(false)
  const coaches = VERIFIED_COACHES[u.id]
  const [why, setWhy] = useState(() => loadWhyCache()[u.id] || '')
  const [whyLoading, setWhyLoading] = useState(false)
  const [whyErr, setWhyErr] = useState('')

  const fmtCost = (n) => '$' + Math.round(n / 1000) + 'k' + t('/an', '/yr')

  const askWhy = async () => {
    setWhyErr('')
    if (!hasApiKey()) {
      setWhyErr(t('Ajoute ta clé API dans l’onglet « IA » pour activer ça.', 'Add your API key in the “AI” tab to enable this.'))
      return
    }
    setWhyLoading(true)
    try {
      const txt = await explainFit(profile, u)
      setWhy(txt)
      saveWhy(u.id, txt)
    } catch (e) {
      setWhyErr(
        e?.message === 'NO_KEY'
          ? t('Ajoute ta clé API dans l’onglet « IA ».', 'Add your API key in the “AI” tab.')
          : t('Erreur IA : ', 'AI error: ') + (e?.message || t('réessaie', 'try again')),
      )
    } finally {
      setWhyLoading(false)
    }
  }

  return (
    <article className="transition-colors hover:surface-2">
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <ScorePill score={u.match} />

        <div className="min-w-0 flex-1 xl:flex xl:items-start xl:gap-8">
          {/* Identité */}
          <div className="min-w-0 xl:w-72 xl:shrink-0">
            <h3 className="truncate font-display text-lg font-extrabold text-heading">{u.shortName}</h3>
            <p className="text-sm text-secondary">{u.city}, {u.state}</p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md px-2 py-0.5 text-xs font-bold text-white" style={{ background: divColor(u.division) }}>
                {u.division}
              </span>
              <span className="rounded-md surface-3 px-2 py-0.5 text-xs font-medium text-secondary">{u.conference}</span>
              <TypeBadge type={u.type} />
              <FitBadge fit={u.fit} />
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{fmtCost(u.costUSD)}</span>
              {!u.curated && (
                <span
                  className="rounded-md surface-3 px-2 py-0.5 text-xs font-semibold text-tertiary"
                  title={t('Fiche annuaire : infos de base, notes non évaluées en détail', 'Directory entry: basic info, notes not evaluated in detail')}
                >
                  {t('Annuaire', 'Directory')}
                </span>
              )}
            </div>
          </div>

          {/* Notes visuelles */}
          <div className="mt-3 grid max-w-sm grid-cols-2 gap-x-6 gap-y-1.5 xl:mt-0 xl:w-72 xl:shrink-0">
            <Stat label={t('Natation', 'Swimming')} value={u.swim} color="#0ea5e9" />
            <Stat label={t('Économie', 'Economics')} value={u.econ} color="#7c3aed" />
            <Stat label={t('Sport (ambiance)', 'Sports (vibe)')} value={u.athletics} color="#e63946" />
            <Stat label={t('Soleil', 'Sun')} value={u.sunshine} color="#f59e0b" />
          </div>

          {/* Coach + liens */}
          <div className="mt-3 xl:mt-0 xl:flex-1">
            {coaches && (
              <p className="mb-2 text-xs text-secondary">
                {t('Head Coach', 'Head coach')} : <span className="font-semibold text-heading">{coaches.staff[0].name}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-2 xl:justify-end">
              <a
                href={siteLink(u)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-navy-800"
              >
                {t('Site officiel', 'Official site')} ↗
              </a>
              <a
                href={coachsStaffLink(u)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                {t('Coachs natation', 'Swim coaches')} ↗
              </a>
              <a
                href={NCSA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-pool-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-pool-600"
              >
                NCSA Recruiting ↗
              </a>
            </div>
          </div>
        </div>

        {/* Favori — toujours à droite de la ligne */}
        <button
          onClick={() => onToggleFav(u.id)}
          aria-label={isFav ? t('Retirer des favoris', 'Remove from favorites') : t('Ajouter aux favoris', 'Add to favorites')}
          className="shrink-0 text-2xl leading-none transition hover:scale-110"
          title={isFav ? t('Retirer des favoris', 'Remove from favorites') : t('Ajouter aux favoris', 'Add to favorites')}
        >
          {isFav ? '⭐' : '☆'}
        </button>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border-t border-hair px-4 py-2 text-xs font-semibold text-accent transition hover:surface-2 sm:px-5"
      >
        {open ? t('Masquer les détails', 'Hide details') : t('Voir les détails', 'See details')}
        <span className={'transition ' + (open ? 'rotate-180' : '')}>⌄</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-hair surface-2 px-4 py-3 text-sm sm:px-5">
          <p className="text-primary">
            <span className="font-semibold">{t('Natation', 'Swimming')} :</span> {u.swimNote}
          </p>

          {coaches && (
            <div className="rounded-lg surface border border-hair p-3">
              <p className="mb-1 font-semibold text-heading">
                {t('Staff natation', 'Swim staff')} <span className="font-normal text-tertiary">({t('vérifié', 'verified')} {COACHES_AS_OF})</span>
              </p>
              <ul className="space-y-0.5">
                {coaches.staff.map((c) => (
                  <li key={c.name} className="text-secondary">
                    <span className="text-tertiary">{c.role} :</span> <span className="font-medium text-primary">{c.name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-tertiary">
                {t('Emails directs rarement publics en D1 — contacte via le', 'Direct emails are rarely public in D1 — reach out via the')}{' '}
                <a href={coachsStaffLink(u)} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                  {t('staff / formulaire recrue', 'staff / recruit form')} ↗
                </a>
                .
              </p>
            </div>
          )}

          <p className="text-primary">
            <span className="font-semibold">{t('Bourses', 'Scholarships')} :</span> {u.scholarshipNote}
          </p>

          {(() => {
            const c = netCost(u, lang)
            return (
              <div className="rounded-lg surface border border-hair p-3">
                <p className="font-semibold text-heading">
                  {t('Coût net estimé', 'Estimated net cost')} <span className="font-normal text-tertiary">({t('indicatif, intl', 'indicative, intl')})</span>
                </p>
                <p className="mt-0.5 font-display text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{c.range}</p>
                <p className="mt-0.5 text-xs text-secondary">
                  <span className="font-semibold text-primary">{c.label}.</span> {c.note}
                </p>
              </div>
            )
          })()}

          <div className="flex flex-wrap gap-1.5">
            {u.highlights.map((h) => (
              <span key={h} className="rounded-full surface border border-hair px-2.5 py-1 text-xs font-medium text-secondary">
                {h}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              [t('Sport', 'Sport'), u.breakdown.sport],
              [t('Études', 'Academics'), u.breakdown.academic],
              [t('Lifestyle', 'Lifestyle'), u.breakdown.lifestyle],
              [t('Coût', 'Cost'), u.breakdown.cost],
            ].map(([label, v]) => (
              <div key={label} className="rounded-lg surface border border-hair p-2 text-center">
                <div className="font-display text-base font-extrabold text-heading">{v}</div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-tertiary">{label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg surface border border-hair p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-heading">{t('Pourquoi cette fac ?', 'Why this school?')}</span>
              <button
                onClick={askWhy}
                disabled={whyLoading}
                className="rounded-full bg-pool-500 px-3 py-1 text-xs font-bold text-white transition hover:bg-pool-600 disabled:opacity-50"
              >
                {whyLoading ? t('Analyse…', 'Analyzing…') : why ? t('Régénérer', 'Regenerate') : t('Demander à l’IA', 'Ask the AI')}
              </button>
            </div>
            {why && <p className="mt-2 whitespace-pre-line text-primary">{why}</p>}
            {whyErr && <p className="mt-2 text-xs text-flag-500">{whyErr}</p>}
          </div>
        </div>
      )}
    </article>
  )
}
