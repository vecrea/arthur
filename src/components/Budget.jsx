import { useState } from 'react'
import { netCost } from '../lib/cost.js'
import { useLang } from '../lib/i18n.jsx'

// % de bourse sportive par défaut selon le type de programme.
const DEFAULT_SCHOLAR = { athletic: 35, d3: 0, ivy: 0, service: 100 }

export default function Budget({ schools, favorites }) {
  const { t, lang } = useLang()

  // Choix : favoris d'abord, puis facs détaillées.
  const favList = schools.filter((u) => favorites.has(u.id))
  const curList = schools.filter((u) => u.curated && !favorites.has(u.id))
  const options = [...favList, ...curList]

  const [schoolId, setSchoolId] = useState(options[0]?.id || 'manual')
  const [manualCost, setManualCost] = useState(60000)
  const [scholar, setScholar] = useState(() => {
    const u = options[0]
    return u ? DEFAULT_SCHOLAR[netCost(u, 'fr').kind] ?? 35 : 35
  })
  const [rate, setRate] = useState(0.92)
  const [roundTrips, setRoundTrips] = useState(2)
  const [flightPrice, setFlightPrice] = useState(900)
  const [visaFees, setVisaFees] = useState(500)
  const [years, setYears] = useState(4)

  const pick = (id) => {
    setSchoolId(id)
    const u = options.find((x) => x.id === id)
    if (u) setScholar(DEFAULT_SCHOLAR[netCost(u, 'fr').kind] ?? 35)
  }

  const selected = options.find((u) => u.id === schoolId)
  const isManual = schoolId === 'manual' || !selected
  const costUSD = isManual ? Number(manualCost) || 0 : selected.costUSD
  const info = selected ? netCost(selected, lang) : null

  // Calculs.
  const netAnnualUSD = costUSD * (1 - scholar / 100)
  const tuitionEUR = netAnnualUSD * rate
  const flightsEUR = (Number(roundTrips) || 0) * (Number(flightPrice) || 0)
  const annualEUR = tuitionEUR + flightsEUR
  const visaEUR = Number(visaFees) || 0
  const totalEUR = (Number(years) || 0) * annualEUR + visaEUR
  const savedEUR = (Number(years) || 0) * (costUSD - netAnnualUSD) * rate

  const eur = (n) => '€' + Math.round(n).toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR')

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden">
        {/* Intro + choix de la fac */}
        <div className="p-5">
          <h2 className="font-display text-xl font-extrabold text-heading">{t('Budget sur 4 ans', '4-year budget')}</h2>
          <p className="text-sm text-secondary">
            {t(
              'Estimation du coût total en euros pour tes parents : scolarité nette (après bourse), vols Belgique↔US et visa. Ajuste les hypothèses.',
              'Total cost estimate in euros for your parents: net tuition (after scholarship), Belgium↔US flights and visa. Adjust the assumptions.',
            )}
          </p>

          {/* Choix de la fac */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Université', 'University')}</span>
              <select value={schoolId} onChange={(e) => pick(e.target.value)} className="field mt-1">
                {favList.length > 0 && (
                  <optgroup label={t('Mes favoris', 'My favorites')}>
                    {favList.map((u) => (
                      <option key={u.id} value={u.id}>{u.shortName} · {u.division}</option>
                    ))}
                  </optgroup>
                )}
                <optgroup label={t('Facs détaillées', 'Detailed schools')}>
                  {curList.map((u) => (
                    <option key={u.id} value={u.id}>{u.shortName} · {u.division}</option>
                  ))}
                </optgroup>
                <optgroup label={t('Autre', 'Other')}>
                  <option value="manual">{t('Saisie manuelle', 'Manual entry')}</option>
                </optgroup>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Coût annoncé / an ($, intl)', 'Sticker cost / yr ($, intl)')}</span>
              <input type="number" value={isManual ? manualCost : costUSD} onChange={(e) => setManualCost(e.target.value)} disabled={!isManual} className="field mt-1 disabled:surface-3 disabled:text-secondary" />
            </label>
          </div>

          {info && (
            <p className="mt-2 text-xs text-secondary">
              <span className="font-semibold text-primary">{info.label}.</span> {info.note}
            </p>
          )}
        </div>

        {/* Hypothèses */}
        <div className="border-t border-hair p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-tertiary">{t('Hypothèses (ajuste-les)', 'Assumptions (adjust them)')}</p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-primary">{t('Bourse sportive', 'Athletic scholarship')}</span>
                <span className="font-display font-extrabold text-accent">{scholar}%</span>
              </div>
              <input type="range" min="0" max="70" step="5" value={scholar} onChange={(e) => setScholar(Number(e.target.value))} className="mt-1 w-full accent-pool-500" />
              <p className="text-[11px] text-tertiary">{t('La natation = bourses souvent partielles. D3/Ivy = 0 (aides au mérite à part).', 'Swimming = often partial scholarships. D3/Ivy = 0 (merit aid is separate).')}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="text-xs font-medium text-secondary">{t('Taux $→€', 'Rate $→€')}</span>
                <input type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="field mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-secondary">{t('Aller-retours / an', 'Round trips / yr')}</span>
                <input type="number" min="0" value={roundTrips} onChange={(e) => setRoundTrips(e.target.value)} className="field mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-secondary">{t('Prix A/R (€)', 'Round trip (€)')}</span>
                <input type="number" min="0" value={flightPrice} onChange={(e) => setFlightPrice(e.target.value)} className="field mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-secondary">{t('Années', 'Years')}</span>
                <input type="number" min="1" max="5" value={years} onChange={(e) => setYears(e.target.value)} className="field mt-1" />
              </label>
            </div>
            <label className="block sm:max-w-xs">
              <span className="text-xs font-medium text-secondary">{t('Visa + SEVIS (1× la 1re année, €)', 'Visa + SEVIS (one-time, year 1, €)')}</span>
              <input type="number" min="0" value={visaFees} onChange={(e) => setVisaFees(e.target.value)} className="field mt-1" />
            </label>
          </div>
        </div>

        {/* Résultat */}
        <div className="border-t border-hair">
          <div className="panel-dark p-5 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t(`Coût total estimé sur ${years} an(s)`, `Estimated total over ${years} year(s)`)}</div>
            <div className="font-display text-4xl font-black text-spark-400">≈ {eur(totalEUR)}</div>
            <div className="mt-1 text-sm text-white/80">{t('soit', 'i.e.')} ≈ {eur(annualEUR)} / {t('an', 'yr')} {scholar > 0 && <>· {t('économie bourse', 'scholarship saving')} ≈ {eur(savedEUR)}</>}</div>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <Row label={t('Scolarité nette / an', 'Net tuition / yr')} val={eur(tuitionEUR)} sub={scholar > 0 ? t(`après ${scholar}% de bourse`, `after ${scholar}% scholarship`) : t('sans bourse sportive', 'no athletic scholarship')} />
              <Row label={t('Vols / an', 'Flights / yr')} val={eur(flightsEUR)} sub={`${roundTrips} ${t('A/R', 'round trips')} × ${eur(flightPrice)}`} />
              <Row label={t('Sous-total / an', 'Subtotal / yr')} val={eur(annualEUR)} bold />
              <Row label={t('Visa + SEVIS (1×)', 'Visa + SEVIS (one-time)')} val={eur(visaEUR)} />
              <Row label={t(`TOTAL sur ${years} an(s)`, `TOTAL over ${years} year(s)`)} val={eur(totalEUR)} bold accent />
            </tbody>
          </table>
        </div>
      </div>

      <p className="px-1 text-xs text-secondary">
        {t(
          'Estimation indicative en euros. Le « coût annoncé » inclut généralement logement, repas et assurance santé ; les vols et le visa sont ajoutés en plus. Les bourses sportives en natation sont souvent partielles — confirme l’offre réelle avec le coach. Taux de change à ajuster le moment venu.',
          'Indicative estimate in euros. The “sticker cost” usually includes housing, meals and health insurance; flights and visa are added on top. Swimming athletic scholarships are often partial — confirm the real offer with the coach. Adjust the exchange rate when the time comes.',
        )}
      </p>
    </div>
  )
}

function Row({ label, val, sub, bold, accent }) {
  return (
    <tr className="border-t border-hair">
      <td className="px-5 py-2.5">
        <div className={(bold ? 'font-extrabold ' : 'font-medium ') + 'text-heading'}>{label}</div>
        {sub && <div className="text-[11px] text-tertiary">{sub}</div>}
      </td>
      <td className={'px-5 py-2.5 text-right tabular-nums ' + (accent ? 'font-display text-lg font-black text-emerald-700 dark:text-emerald-400' : bold ? 'font-extrabold text-heading' : 'text-primary')}>{val}</td>
    </tr>
  )
}
