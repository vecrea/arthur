import { useEffect, useMemo, useState } from 'react'
import { loadCoaches, saveCoaches, loadProfileExtras } from '../lib/storage.js'
import { VERIFIED_COACHES, COACHES_AS_OF } from '../data/coaches.js'
import { draftCoachEmail, hasApiKey } from '../lib/ai.js'
import { buildCoachEmail } from '../lib/emailTemplate.js'
import { useLang } from '../lib/i18n.jsx'

const STATUS = {
  todo: { label: 'À contacter', labelEn: 'To contact', color: '#64748b', emoji: '' },
  emailed: { label: 'Email envoyé', labelEn: 'Email sent', color: '#0ea5e9', emoji: '' },
  replied: { label: 'A répondu', labelEn: 'Replied', color: '#6366f1', emoji: '' },
  interested: { label: 'Intéressé', labelEn: 'Interested', color: '#f59e0b', emoji: '' },
  offer: { label: 'Offre !', labelEn: 'Offer!', color: '#16a34a', emoji: '' },
  declined: { label: 'Décliné', labelEn: 'Declined', color: '#ef4444', emoji: '' },
}
const ORDER = ['todo', 'emailed', 'replied', 'interested', 'offer', 'declined']

const newId = () =>
  globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : 'c' + Date.now() + Math.random().toString(36).slice(2)

const blank = () => ({
  id: '', schoolId: '', school: '', coachName: '', email: '',
  status: 'todo', contactedDate: '', nextFollowUp: '', notes: '',
})

export default function Coaches({ unis, favorites, profile }) {
  const { t } = useLang()
  const [contacts, setContacts] = useState(() => loadCoaches())
  const [form, setForm] = useState(null) // null = fermé, sinon brouillon
  const [emails, setEmails] = useState({}) // { [id]: texte }
  const [emailLoading, setEmailLoading] = useState(null) // id en cours
  const [emailErr, setEmailErr] = useState({}) // { [id]: message }

  useEffect(() => saveCoaches(contacts), [contacts])

  const extras = useMemo(() => loadProfileExtras(), [])

  // Email d'intro pré-rempli, sans clé API (modèle).
  const genTemplate = (c) => {
    const { subject, body } = buildCoachEmail(profile, c, extras)
    setEmails((m) => ({ ...m, [c.id]: `Subject: ${subject}\n\n${body}` }))
    setEmailErr((e) => ({ ...e, [c.id]: '' }))
  }

  const stLabel = (s) => t(STATUS[s].label, STATUS[s].labelEn)
  const noKeyMsg = t('Ajoute ta clé API dans l’onglet « IA ».', 'Add your API key in the “AI” tab.')

  const genEmail = async (c) => {
    setEmailErr((e) => ({ ...e, [c.id]: '' }))
    if (!hasApiKey()) {
      setEmailErr((e) => ({ ...e, [c.id]: noKeyMsg }))
      return
    }
    setEmailLoading(c.id)
    try {
      const txt = await draftCoachEmail(profile, c)
      setEmails((m) => ({ ...m, [c.id]: txt }))
    } catch (err) {
      setEmailErr((e) => ({ ...e, [c.id]: err?.message === 'NO_KEY' ? noKeyMsg : t('Erreur IA : ', 'AI error: ') + (err?.message || t('réessaie', 'try again')) }))
    } finally {
      setEmailLoading(null)
    }
  }
  const copyEmail = (id) => {
    try {
      navigator.clipboard?.writeText(emails[id] || '')
    } catch {
      /* ignore */
    }
  }

  const upd = (patch) => setForm((f) => ({ ...f, ...patch }))

  const save = () => {
    if (!form.school.trim() && !form.coachName.trim()) return
    if (form.id) {
      setContacts((cs) => cs.map((c) => (c.id === form.id ? form : c)))
    } else {
      setContacts((cs) => [{ ...form, id: newId() }, ...cs])
    }
    setForm(null)
  }
  const remove = (id) => setContacts((cs) => cs.filter((c) => c.id !== id))
  const setStatus = (id, status) => setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)))

  const importFavorites = () => {
    const existing = new Set(contacts.map((c) => c.schoolId).filter(Boolean))
    const toAdd = [...favorites]
      .filter((fid) => !existing.has(fid))
      .map((fid) => {
        const u = unis.find((x) => x.id === fid)
        return u ? { ...blank(), id: newId(), schoolId: u.id, school: u.shortName } : null
      })
      .filter(Boolean)
    if (toAdd.length) setContacts((cs) => [...toAdd, ...cs])
  }

  const importVerified = () => {
    const have = new Set(contacts.map((c) => `${c.schoolId}|${c.coachName}`.toLowerCase()))
    const toAdd = []
    for (const [sid, data] of Object.entries(VERIFIED_COACHES)) {
      const u = unis.find((x) => x.id === sid)
      const school = u ? u.shortName : sid
      for (const s of data.staff) {
        const key = `${sid}|${s.name}`.toLowerCase()
        if (have.has(key)) continue
        have.add(key)
        toAdd.push({
          ...blank(), id: newId(), schoolId: sid, school,
          coachName: s.name, status: 'todo',
          notes: `${s.role} · ${t('staff vérifié', 'verified staff')} ${COACHES_AS_OF}`,
        })
      }
    }
    if (toAdd.length) setContacts((cs) => [...toAdd, ...cs])
  }

  const stats = useMemo(() => {
    const by = (s) => contacts.filter((c) => c.status === s).length
    return {
      total: contacts.length,
      active: contacts.filter((c) => ['emailed', 'replied', 'interested'].includes(c.status)).length,
      replied: by('replied') + by('interested') + by('offer'),
      offer: by('offer'),
    }
  }, [contacts])

  const sorted = useMemo(() => [...contacts].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)), [contacts])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-900/5">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-900">{t('Contacts coachs', 'Coach contacts')}</h2>
          <p className="text-sm text-slate-500">{t("Suis chaque coach que tu contactes, du premier email à l'offre.", 'Track every coach you contact, from first email to offer.')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {favorites.size > 0 && (
            <button onClick={importFavorites} className="rounded-full bg-spark-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-spark-400">
              {t('Importer mes favoris', 'Import my favorites')}
            </button>
          )}
          <button
            onClick={importVerified}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-emerald-700"
            title={t(`Head & assistant coachs vérifiés (${COACHES_AS_OF}) de tes meilleures facs`, `Verified head & assistant coaches (${COACHES_AS_OF}) from your top schools`)}
          >
            {t('Coachs vérifiés', 'Verified coaches')}
          </button>
          <button onClick={() => setForm(blank())} className="rounded-full bg-flag-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-flag-600">
            {t('+ Ajouter un coach', '+ Add a coach')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t('Coachs suivis', 'Coaches tracked')} value={stats.total} accent="#0f1f48" />
        <StatCard label={t('En cours', 'In progress')} value={stats.active} accent="#0ea5e9" />
        <StatCard label={t('Réponses', 'Replies')} value={stats.replied} accent="#6366f1" />
        <StatCard label={t('Offres', 'Offers')} value={stats.offer} accent="#16a34a" />
      </div>

      {/* Formulaire */}
      {form && (
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-pool-300">
          <p className="mb-3 font-display font-extrabold text-navy-900">
            {form.id ? t('Modifier le contact', 'Edit contact') : t('+ Nouveau contact', '+ New contact')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">{t('Université (depuis la liste)', 'University (from the list)')}</span>
              <select
                value={form.schoolId}
                onChange={(e) => {
                  const id = e.target.value
                  const u = unis.find((x) => x.id === id)
                  upd({ schoolId: id, school: u ? u.shortName : form.school })
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pool-500"
              >
                <option value="">{t('— Choisir (ou saisir le nom ci-dessous) —', '— Choose (or type the name below) —')}</option>
                {unis.map((u) => (
                  <option key={u.id} value={u.id}>{u.shortName} · {u.division}</option>
                ))}
              </select>
            </label>
            <Field label={t('Nom de la fac', 'School name')} value={form.school} onChange={(v) => upd({ school: v })} ph="Ex. Florida (Gators)" />
            <Field label={t('Nom du coach', 'Coach name')} value={form.coachName} onChange={(v) => upd({ coachName: v })} ph="Ex. Coach Smith" />
            <Field label={t('Email du coach', 'Coach email')} value={form.email} onChange={(v) => upd({ email: v })} ph="coach@..." type="email" />
            <label className="block">
              <span className="text-xs font-medium text-slate-500">{t('Statut', 'Status')}</span>
              <select
                value={form.status}
                onChange={(e) => upd({ status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pool-500"
              >
                {ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS[s].emoji} {stLabel(s)}</option>
                ))}
              </select>
            </label>
            <Field label={t('Date de contact', 'Contact date')} value={form.contactedDate} onChange={(v) => upd({ contactedDate: v })} type="date" />
            <Field label={t('Relance prévue', 'Planned follow-up')} value={form.nextFollowUp} onChange={(v) => upd({ nextFollowUp: v })} type="date" />
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">{t('Notes', 'Notes')}</span>
              <textarea
                value={form.notes}
                onChange={(e) => upd({ notes: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pool-500"
                placeholder={t("Ce qu'il t'a dit, sa réponse, à faire…", 'What they said, their reply, to-dos…')}
              />
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={save} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-navy-800">
              {t('Enregistrer', 'Save')}
            </button>
            <button onClick={() => setForm(null)} className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">
              {t('Annuler', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {sorted.length === 0 && !form ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-card ring-1 ring-slate-900/5">
          <p className="font-semibold text-navy-900">{t("Aucun coach pour l'instant", 'No coaches yet')}</p>
          <p className="mt-1 text-sm text-slate-500">
            {t(
              'Clique sur « Ajouter un coach », ou « Importer mes favoris » pour partir de ta shortlist.',
              'Click “Add a coach”, or “Import my favorites” to start from your shortlist.',
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((c) => {
            const st = STATUS[c.status] ?? STATUS.todo
            return (
              <article key={c.id} className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-900/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-extrabold text-navy-900">{c.school || t('Université ?', 'University?')}</h3>
                    <p className="text-sm text-slate-600">
                      {c.coachName || t('Coach ?', 'Coach?')}
                      {c.email && (
                        <>
                          {' · '}
                          <a href={`mailto:${c.email}`} className="font-medium text-pool-600 hover:underline">{c.email}</a>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: st.color }}>
                    {st.emoji} {t(st.label, st.labelEn)}
                  </span>
                </div>

                {(c.contactedDate || c.nextFollowUp || c.notes) && (
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    {c.contactedDate && <div>{t('Contacté le', 'Contacted on')} {c.contactedDate}</div>}
                    {c.nextFollowUp && <div>{t('Relance prévue :', 'Follow-up planned:')} {c.nextFollowUp}</div>}
                    {c.notes && <div className="text-slate-700">{c.notes}</div>}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <select
                    value={c.status}
                    onChange={(e) => setStatus(c.id, e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 outline-none focus:border-pool-500"
                  >
                    {ORDER.map((s) => (
                      <option key={s} value={s}>{STATUS[s].emoji} {stLabel(s)}</option>
                    ))}
                  </select>
                  <button onClick={() => setForm({ ...c })} className="text-xs font-semibold text-pool-600 hover:underline">
                    {t('Modifier', 'Edit')}
                  </button>
                  <button onClick={() => remove(c.id)} className="text-xs font-semibold text-flag-500 hover:underline">
                    {t('Supprimer', 'Delete')}
                  </button>
                  <div className="ml-auto flex gap-1.5">
                    <button
                      onClick={() => genTemplate(c)}
                      className="rounded-full bg-pool-500 px-3 py-1 text-xs font-bold text-white transition hover:bg-pool-600"
                      title={t('Email pré-rempli, sans clé API', 'Pre-filled email, no API key')}
                    >
                      {t('Email (modèle)', 'Email (template)')}
                    </button>
                    <button
                      onClick={() => genEmail(c)}
                      disabled={emailLoading === c.id}
                      className="rounded-full bg-navy-900 px-3 py-1 text-xs font-bold text-white transition hover:bg-navy-800 disabled:opacity-50"
                      title={t('Version IA (nécessite une clé API, onglet IA)', 'AI version (requires an API key, AI tab)')}
                    >
                      {emailLoading === c.id ? t('Rédaction…', 'Drafting…') : t('IA', 'AI')}
                    </button>
                  </div>
                </div>

                {emailErr[c.id] && <p className="mt-2 text-xs text-flag-600">{emailErr[c.id]}</p>}
                {emails[c.id] && (
                  <div className="mt-3">
                    <textarea
                      readOnly
                      value={emails[c.id]}
                      rows={9}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none"
                    />
                    <div className="mt-1 flex items-center gap-2">
                      <button onClick={() => copyEmail(c.id)} className="rounded-full bg-navy-900 px-3 py-1 text-xs font-bold text-white hover:bg-navy-800">
                        {t('Copier', 'Copy')}
                      </button>
                      <span className="text-xs text-slate-400">{t("Relis et personnalise avant d'envoyer.", 'Review and personalize before sending.')}</span>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, ph, type = 'text' }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={ph}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pool-500 focus:ring-2 focus:ring-pool-500/20"
      />
    </label>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-900/5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 font-display text-3xl font-black" style={{ color: accent }}>{value}</div>
    </div>
  )
}
