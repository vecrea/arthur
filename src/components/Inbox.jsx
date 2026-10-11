import { useEffect, useMemo, useState } from 'react'
import { onCloudState, subscribeInbox, markInboxRead, deleteInboxEntry } from '../lib/cloud.js'
import { useLang } from '../lib/i18n.jsx'
import { PageHeader } from './ui/Page.jsx'
import Icon from './Icons.jsx'

const TYPE_META = {
  interest: { fr: 'Intérêt', en: 'Interest', color: '#16a34a' },
  request: { fr: 'Demande', en: 'Request', color: '#0e88d3' },
  question: { fr: 'Question', en: 'Question', color: '#7c3aed' },
  note: { fr: 'Mot', en: 'Note', color: '#d1971f' },
  message: { fr: 'Message', en: 'Message', color: '#64748b' },
}

function fmtDate(ts, lang) {
  try {
    const d = ts && typeof ts.toDate === 'function' ? ts.toDate() : null
    if (!d) return ''
    return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function Inbox() {
  const { t, lang } = useLang()
  const [user, setUser] = useState(null)
  const [items, setItems] = useState(null) // null = chargement, [] = vide
  const [err, setErr] = useState(false)

  useEffect(() => onCloudState((s) => setUser(s.user)), [])

  useEffect(() => {
    if (!user) {
      setItems(null)
      return
    }
    setErr(false)
    const unsub = subscribeInbox(
      (list) => setItems(list || []),
      () => setErr(true),
    )
    return unsub
  }, [user])

  const unread = useMemo(() => (items || []).filter((m) => !m.read).length, [items])

  if (!user) {
    return (
      <div className="space-y-4">
        <PageHeader icon="inbox" title={t('Messages coachs', 'Coach messages')} subtitle={t('Les coachs qui te contactent depuis ta page apparaissent ici.', 'Coaches who contact you from your page appear here.')} />
        <section className="panel p-10 text-center">
          <p className="font-semibold text-heading">{t('Connecte-toi pour voir tes messages', 'Sign in to see your messages')}</p>
          <p className="mt-1 text-sm text-secondary">{t('Clique sur « Synchro » en bas de la barre latérale et connecte-toi.', 'Click “Sync” at the bottom of the sidebar and sign in.')}</p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon="inbox"
        title={t('Messages coachs', 'Coach messages')}
        subtitle={t('Intérêts, demandes et questions reçus depuis ta page coach.', 'Interest, requests and questions received from your coach page.')}
        action={unread > 0 ? <span className="rounded-full bg-pool-500 px-3 py-1 text-xs font-bold text-white">{unread} {t('non lu(s)', 'unread')}</span> : undefined}
      />

      {err && (
        <section className="panel p-5 text-sm font-semibold text-flag-600 dark:text-flag-400">
          {t('Lecture impossible. As-tu publié les règles Firestore mises à jour (boîte de réception) ?', 'Could not read. Did you publish the updated Firestore rules (inbox)?')}
        </section>
      )}

      {items == null ? (
        <section className="panel p-10 text-center text-secondary">{t('Chargement…', 'Loading…')}</section>
      ) : items.length === 0 ? (
        <section className="panel p-10 text-center">
          <p className="font-semibold text-heading">{t('Aucun message pour l’instant', 'No messages yet')}</p>
          <p className="mt-1 text-sm text-secondary">{t('Partage ta page coach (lien ?coach) : les messages arrivent ici.', 'Share your coach page (the ?coach link): messages land here.')}</p>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((m) => {
            const meta = TYPE_META[m.type] || TYPE_META.message
            return (
              <article key={m.id} className={'panel p-4 sm:p-5 ' + (m.read ? '' : 'ring-1 ring-[color-mix(in_srgb,var(--accent)_32%,transparent)]')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: meta.color }}>{t(meta.fr, meta.en)}</span>
                      {!m.read && <span className="h-2 w-2 rounded-full bg-pool-500" />}
                    </div>
                    <h3 className="mt-1.5 truncate font-display text-base font-extrabold text-heading">{m.coachName || t('Coach', 'Coach')}</h3>
                    <p className="truncate text-xs text-secondary">{[m.position, m.team].filter(Boolean).join(' · ') || '—'}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-tertiary">{fmtDate(m.createdAt, lang)}</span>
                </div>

                {m.message && <p className="mt-3 whitespace-pre-line break-words text-sm text-primary">{m.message}</p>}
                {m.slots && <p className="mt-2 text-xs text-secondary">{t('Créneaux', 'Slots')} : {m.slots}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {m.coachEmail && (
                    <a href={`mailto:${m.coachEmail}?subject=${encodeURIComponent('Road to NCAA')}`} className="inline-flex items-center gap-1.5 rounded-full bg-pool-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-pool-600">
                      <Icon name="reply" className="h-3.5 w-3.5" /> {t('Répondre', 'Reply')}
                    </a>
                  )}
                  <button onClick={() => markInboxRead(m.id, !m.read)} className="inline-flex items-center gap-1.5 rounded-full surface-2 border border-hair px-3 py-1.5 text-xs font-semibold text-secondary transition hover:text-heading">
                    <Icon name="check" className="h-3.5 w-3.5" /> {m.read ? t('Marquer non lu', 'Mark unread') : t('Marquer lu', 'Mark read')}
                  </button>
                  <button
                    onClick={() => { if (window.confirm(t('Supprimer ce message ?', 'Delete this message?'))) deleteInboxEntry(m.id) }}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-tertiary transition hover:text-flag-500"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" /> {t('Supprimer', 'Delete')}
                  </button>
                </div>
                {m.coachEmail && <p className="mt-2 break-all text-[11px] text-tertiary">{m.coachEmail}</p>}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
