import { loadAbout, loadProfileExtras } from '../../lib/storage.js'
import { useLang } from '../../lib/i18n.jsx'
import Icon from '../Icons.jsx'

// Génère et télécharge une vCard (.vcf) avec le contact d'Arthur.
function downloadVCard(profile, lang) {
  const about = loadAbout()
  const extras = loadProfileExtras()
  const email = about.email || extras.email || ''
  const phone = about.phone || extras.phone || ''
  const ig = about.instagram ? `https://instagram.com/${String(about.instagram).replace(/^@/, '')}` : ''
  const specialty = lang === 'en' ? profile.specialtyEn : profile.specialty
  const note = `${specialty} · ${lang === 'en' ? 'Class of' : 'Promo'} ${profile.usEntryYear} · ${lang === 'en' ? 'Belgian swimmer' : 'Nageur belge'}`
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;${profile.name};;;`,
    `FN:${profile.name}`,
    'TITLE:NCAA recruit — swimmer',
    email && `EMAIL;TYPE=INTERNET:${email}`,
    phone && `TEL;TYPE=CELL:${phone}`,
    ig && `URL:${ig}`,
    `NOTE:${note}`,
    'END:VCARD',
  ].filter(Boolean)
  const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${profile.name}-contact.vcf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function DownloadPacket({ profile }) {
  const { t, lang } = useLang()
  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-flag-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-flag-600">
        <Icon name="doc" className="h-4 w-4" /> {t('Fiche de recrutement (PDF)', 'Recruiting sheet (PDF)')}
      </button>
      <button onClick={() => downloadVCard(profile, lang)} className="inline-flex items-center gap-2 rounded-full surface-2 border border-hair px-5 py-2.5 text-sm font-bold text-primary transition hover:surface-3">
        <Icon name="user" className="h-4 w-4" /> {t('Enregistrer le contact (vCard)', 'Save contact (vCard)')}
      </button>
    </div>
  )
}
