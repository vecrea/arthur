import { useEffect, useMemo, useState } from 'react'
import { loadCoaches, saveCoaches } from '../lib/storage.js'
import { VERIFIED_COACHES, COACHES_AS_OF } from '../data/coaches.js'
import { draftCoachEmail, hasApiKey } from '../lib/ai.js'

const STATUS = {
  todo: { label: 'À contacter', color: '#64748b', emoji: '⚪' },
  emailed: { label: 'Email envoyé', color: '#0ea5e9', emoji: '📨' },
  replied: { label: 'A répondu', color: '#6366f1', emoji: '💬' },
  interested: { label: 'Intéressé', color: '#f59e0b', emoji: '🔥' },
  offer: { label: 'Offre !', color: '#16a34a', emoji: '🎉' },
  declined: { label: 'Décliné', color: '#ef4444', emoji: '✖️' },
}
const ORDER = ['todo', 'emailed', 'replied', 'interested', 'offer', 'declined']

const newId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : 'c' + Date.now() + Math.random().toString(36).slice(2)

const blank = () => ({
  id: '', schoolId: '', school: '', coachName: '', email: '',
  status: 'todo', contactedDate: '', nextFollowUp: '', notes: '',
})

export default function Coaches({ unis, favorites, profile }) {
  const [contacts, setContacts] = useState(() => loadCoaches())
  const [form, setForm] = useState(null) // null = fermé, sinon brouillon
  const [emails, setEmails] = useState({}) // { [id]: texte }
  const [emailLoading, setEmailLoading] = useState(null) // id en cours
  const [emailErr, setEmailErr] = useState({}) // { [id]: message }

  useEffect(() => saveCoaches(contacts), [contacts])

  const genEmail = async (c) => {
    setEmailErr((e) => ({ ...e, [c.id]: '' }))
    if (!hasApiKey()) {
      setEmailErr((e) => ({ ...e, [c.id]: 'Ajoute ta clé API dans l’onglet « IA ».' }))
      return
    }
    setEmailLoading(c.id)
    try {
      const t = await draftCoachEmail(profile, c)
      setEmails((m) => ({ ...m, [c.id]: t }))
    } catch (err) {
      setEmailErr((e) => ({ ...e, [c.id]: err?.message === 'NO_KEY' ? 'Ajoute ta clé API dans l’onglet « IA ».' : 'Erreur IA : ' + (err?.message || 'réessaie') }))
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
  const setStatus = (id, status) =>
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)))

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
          notes: `${s.role} · staff vérifié ${COACHES_AS_OF}`,
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

  const sorted = useMemo(
    () => [...contacts].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)),
    [contacts],
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-900">📇 Contacts coachs</h2>
          <p className="text-sm text-slate-500">Suis chaque coach que tu contactes, du premier email à l'offre.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {favorites.size > 0 && (
            <button
              onClick={importFavorites}
              className="rounded-full bg-spark-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-spark-400"
            >
              ⭐ Importer mes favoris
            </button>
          )}
          <button
            onClick={importVerified}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-emerald-700"
            title={`Head & assistant coachs vérifiés (${COACHES_AS_OF}) de tes meilleures facs`}
          >
            🏊 Coachs vérifiés
          </button>
          <button
            onClick={() => setForm(blank())}
            className="rounded-full bg-flag-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-flag-600"
          >
            ➕ Ajouter un coach
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Coachs suivis" value={stats.total} accent="#0f1f48" />
        <StatCard label="📨 En cours" value={stats.active} accent="#0ea5e9" />
        <StatCard label="💬 Réponses" value={stats.replied} accent="#6366f1" />
        <StatCard label="🎉 Offres" value={stats.offer} accent="#16a34a" />
      </div>

      {/* Formulaire */}
      {form && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-pool-300">
          <p className="mb-3 font-display font-extrabold text-navy-900">
            {form.id ? '✏️ Modifier le contact' : '➕ Nouveau contact'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Université (depuis la liste)</span>
              <select
                value={form.schoolId}
                onChange={(e) => {
                  const id = e.target.value
                  const u = unis.find((x) => x.id === id)
                  upd({ schoolId: id, school: u ? u.shortName : form.school })
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pool-500"
              >
                <option value="">— Choisir (ou saisir le nom ci-dessous) —</option>
                {unis.map((u) => (
                  <option key={u.id} value={u.id}>{u.shortName} · {u.division}</option>
                ))}
              </select>
            </label>
            <Field label="Nom de la fac" value={form.school} onChange={(v) => upd({ school: v })} ph="Ex. Florida (Gators)" />
            <Field label="Nom du coach" value={form.coachName} onChange={(v) => upd({ coachName: v })} ph="Ex. Coach Smith" />
            <Field label="Email du coach" value={form.email} onChange={(v) => upd({ email: v })} ph="coach@..." type="email" />
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Statut</span>
              <select
                value={form.status}
                onChange={(e) => upd({ status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pool-500"
              >
                {ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS[s].emoji} {STATUS[s].label}</option>
                ))}
              </select>
            </label>
            <Field label="Date de contact" value={form.contactedDate} onChange={(v) => upd({ contactedDate: v })} type="date" />
            <Field label="Relance prévue" value={form.nextFollowUp} onChange={(v) => upd({ nextFollowUp: v })} type="date" />
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Notes</span>
              <textarea
                value={form.notes}
                onChange={(e) => upd({ notes: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pool-500"
                placeholder="Ce qu'il t'a dit, sa réponse, à faire…"
              />
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={save} className="rounded-full bg-navy-900 px-5 py-2 text-sm font-bold text-white hover:bg-navy-800">
              Enregistrer
            </button>
            <button onClick={() => setForm(null)} className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {sorted.length === 0 && !form ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-4xl">📇</div>
          <p className="mt-3 font-semibold text-navy-900">Aucun coach pour l'instant</p>
          <p className="mt-1 text-sm text-slate-500">
            Clique sur « Ajouter un coach », ou « Importer mes favoris » pour partir de ta shortlist.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((c) => {
            const st = STATUS[c.status] ?? STATUS.todo
            return (
              <article key={c.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-extrabold text-navy-900">
                      {c.school || 'Université ?'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {c.coachName || 'Coach ?'}
                      {c.email && (
                        <>
                          {' · '}
                          <a href={`mailto:${c.email}`} className="font-medium text-pool-600 hover:underline">{c.email}</a>
                        </>
                      )}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                    style={{ background: st.color }}
                  >
                    {st.emoji} {st.label}
                  </span>
                </div>

                {(c.contactedDate || c.nextFollowUp || c.notes) && (
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    {c.contactedDate && <div>📅 Contacté le {c.contactedDate}</div>}
                    {c.nextFollowUp && <div>🔔 Relance prévue : {c.nextFollowUp}</div>}
                    {c.notes && <div className="text-slate-700">📝 {c.notes}</div>}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <select
                    value={c.status}
                    onChange={(e) => setStatus(c.id, e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 outline-none focus:border-pool-500"
                  >
                    {ORDER.map((s) => (
                      <option key={s} value={s}>{STATUS[s].emoji} {STATUS[s].label}</option>
                    ))}
                  </select>
                  <button onClick={() => setForm({ ...c })} className="text-xs font-semibold text-pool-600 hover:underline">
                    Modifier
                  </button>
                  <button onClick={() => remove(c.id)} className="text-xs font-semibold text-flag-500 hover:underline">
                    Supprimer
                  </button>
                  <button
                    onClick={() => genEmail(c)}
                    disabled={emailLoading === c.id}
                    className="ml-auto rounded-full bg-pool-500 px-3 py-1 text-xs font-bold text-white transition hover:bg-pool-600 disabled:opacity-50"
                  >
                    {emailLoading === c.id ? 'Rédaction…' : '✍️ Email IA'}
                  </button>
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
                        📋 Copier
                      </button>
                      <span className="text-xs text-slate-400">Relis et personnalise avant d'envoyer.</span>
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
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 font-display text-3xl font-black" style={{ color: accent }}>{value}</div>
    </div>
  )
}
