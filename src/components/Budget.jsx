import { useState } from 'react'
import { netCost } from '../lib/cost.js'
import { useLang } from '../lib/i18n.jsx'
import { PageHeader, CardHead } from './ui/Page.jsx'

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
  const [sevisUSD, setSevisUSD] = useState(350)
  const [visaUSD, setVisaUSD] = useState(185)
  const [insuranceUSD, setInsuranceUSD] = useState(2000)
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
  const insEUR = (Number(insuranceUSD) || 0) * rate
  const annualEUR = tuitionEUR + flightsEUR + insEUR
  const sevisEUR = (Number(sevisUSD) || 0) * rate
  const visaDsEUR = (Number(visaUSD) || 0) * rate
  const oneTimeEUR = sevisEUR + visaDsEUR
  const totalEUR = (Number(years) || 0) * annualEUR + oneTimeEUR
  const savedEUR = (Number(years) || 0) * (costUSD - netAnnualUSD) * rate

  const eur = (n) => '€' + Math.round(n).toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR')

  return (
    <div className="space-y-4">
      <PageHeader
        icon="wallet"
        title={t('Budget sur 4 ans', '4-year budget')}
        subtitle={t(
          'Estimation du coût total en euros pour tes parents : scolarité nette (après bourse), vols Belgique↔US et visa. Ajuste les hypothèses.',
          'Total cost estimate in euros for your parents: net tuition (after scholarship), Belgium↔US flights and visa. Adjust the assumptions.',
        )}
      />

      <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
      <div className="space-y-4">
      {/* Choix de la fac */}
      <section className="panel p-5">
        <div className="grid gap-3 sm:grid-cols-2">
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
      </section>

      {/* Hypothèses */}
      <section className="panel p-5">
        <CardHead>{t('Hypothèses (ajuste-les)', 'Assumptions (adjust them)')}</CardHead>

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
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-medium text-secondary">{t('SEVIS I-901 (1×, $)', 'SEVIS I-901 (one-time, $)')}</span>
              <input type="number" min="0" value={sevisUSD} onChange={(e) => setSevisUSD(e.target.value)} className="field mt-1" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-secondary">{t('Visa DS-160 (1×, $)', 'Visa DS-160 (one-time, $)')}</span>
              <input type="number" min="0" value={visaUSD} onChange={(e) => setVisaUSD(e.target.value)} className="field mt-1" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-secondary">{t('Assurance santé / an ($)', 'Health insurance / yr ($)')}</span>
              <input type="number" min="0" value={insuranceUSD} onChange={(e) => setInsuranceUSD(e.target.value)} className="field mt-1" />
            </label>
          </div>
          <p className="text-[11px] text-tertiary">{t('Frais officiels ~2026 : SEVIS I-901 ≈ 350 $, visa F-1 (DS-160) ≈ 185 $. Assurance santé ≈ 1 500–3 000 $/an (2 000 $ par défaut) ; si elle est déjà comprise dans le coût annoncé, mets 0.', 'Official ~2026 fees: SEVIS I-901 ≈ $350, F-1 visa (DS-160) ≈ $185. Health insurance ≈ $1,500–3,000/yr ($2,000 by default); if it is already in the sticker cost, set it to 0.')}</p>
        </div>
      </section>
      </div>

      <div className="space-y-4">
      {/* Résultat — coût total (carte sombre) */}
      <section className="panel-dark grain relative overflow-hidden p-5 text-white sm:p-6">
        <div className="relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{t(`Coût total estimé sur ${years} an(s)`, `Estimated total over ${years} year(s)`)}</div>
          <div className="font-display text-4xl font-black text-spark-400">≈ {eur(totalEUR)}</div>
          <div className="mt-1 text-sm text-white/80">{t('soit', 'i.e.')} ≈ {eur(annualEUR)} / {t('an', 'yr')} {scholar > 0 && <>· {t('économie bourse', 'scholarship saving')} ≈ {eur(savedEUR)}</>}</div>
        </div>
      </section>

      {/* Détail du calcul */}
      <section className="panel overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <Row label={t('Scolarité nette / an', 'Net tuition / yr')} val={eur(tuitionEUR)} sub={scholar > 0 ? t(`après ${scholar}% de bourse`, `after ${scholar}% scholarship`) : t('sans bourse sportive', 'no athletic scholarship')} />
            <Row label={t('Vols / an', 'Flights / yr')} val={eur(flightsEUR)} sub={`${roundTrips} ${t('A/R', 'round trips')} × ${eur(flightPrice)}`} />
            {insEUR > 0 && <Row label={t('Assurance santé / an', 'Health insurance / yr')} val={eur(insEUR)} sub={`≈ $${Number(insuranceUSD) || 0}`} />}
            <Row label={t('Sous-total / an', 'Subtotal / yr')} val={eur(annualEUR)} bold />
            <Row label={t('SEVIS I-901 (1×)', 'SEVIS I-901 (one-time)')} val={eur(sevisEUR)} sub={`≈ $${Number(sevisUSD) || 0}`} />
            <Row label={t('Visa DS-160 (1×)', 'Visa DS-160 (one-time)')} val={eur(visaDsEUR)} sub={`≈ $${Number(visaUSD) || 0}`} />
            <Row label={t(`TOTAL sur ${years} an(s)`, `TOTAL over ${years} year(s)`)} val={eur(totalEUR)} bold accent />
          </tbody>
        </table>
      </section>

      <p className="px-1 text-xs text-secondary">
        {t(
          'Estimation indicative en euros. Le « coût annoncé » inclut généralement logement et repas ; l’assurance santé est comptée à part (≈ 2 000 $/an par défaut) — si ta fac l’inclut déjà, mets-la à 0. Vols, SEVIS et visa s’ajoutent. Les bourses sportives en natation sont souvent partielles — confirme l’offre réelle avec le coach. Taux de change et frais officiels à ajuster le moment venu.',
          'Indicative estimate in euros. The “sticker cost” usually includes housing and meals; health insurance is counted separately (≈ $2,000/yr by default) — if your school already includes it, set it to 0. Flights, SEVIS and visa are added on top. Swimming athletic scholarships are often partial — confirm the real offer with the coach. Adjust the exchange rate and official fees when the time comes.',
        )}
      </p>
      </div>
      </div>
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
