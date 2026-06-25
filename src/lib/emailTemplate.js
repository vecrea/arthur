// ---------------------------------------------------------------------------
// Générateur d'email d'introduction coach SANS clé API (modèle pré-rempli).
// L'email est en ANGLAIS (les coachs sont américains) ; il pioche dans le
// profil + la fiche athlète (loadProfileExtras) + le contact coach.
// Renvoie { subject, body } — à relire/personnaliser avant envoi.
// ---------------------------------------------------------------------------
import { EVENTS, lcmToScy, formatTime } from './convert.js'

function ageFrom(birthDate) {
  try {
    const b = new Date(birthDate)
    const now = new Date()
    let a = now.getFullYear() - b.getFullYear()
    const m = now.getMonth() - b.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--
    return a
  } catch {
    return null
  }
}

export function buildCoachEmail(profile, contact = {}, extras = {}) {
  const school = (contact.school || '').trim() || 'your program'
  const coachName = (contact.coachName || '').trim()
  const greet = coachName ? `Coach ${coachName.split(/\s+/).slice(-1)[0]}` : 'Coach'
  const age = ageFrom(profile.birthDate)
  const nationality = profile.nationality === 'Belge' ? 'Belgian' : profile.nationality || 'international'
  const specialty = profile.specialtyEn || profile.specialty || 'sprint freestyle'
  const major = profile.majorEn || profile.major || 'Economics'

  const times = EVENTS.filter((e) => profile.times?.[e.key] != null)
    .map((e) => `  • ${e.labelEn}: ${formatTime(profile.times[e.key])} LCM (50m) ≈ ${formatTime(lcmToScy(profile.times[e.key], e.distance))} SCY`)
    .join('\n')

  const gpa = (extras.average || '').trim()
  const video = (extras.videoUrl || '').trim()
  const contactLine = [(extras.email || '').trim(), (extras.phone || '').trim()].filter(Boolean).join(' · ')

  const subject = `Prospective international recruit — ${profile.name}, Class of ${profile.usEntryYear} (${specialty})`

  const body = `Dear ${greet},

My name is ${profile.name}, a${age ? ` ${age}-year-old` : 'n'} ${nationality} swimmer specializing in ${specialty}. I am very interested in ${school} for Fall ${profile.usEntryYear}, where I plan to major in ${major}.

I train with ${profile.homeClub} (coach ${profile.coach}) and recently completed a training camp at the Cercle des Nageurs de Marseille. My best times (long course, with short-course-yards conversions) are:
${times || '  • (times to be added)'}

I am committed to combining academic and athletic excellence in the US and would love to learn more about your program.${gpa ? ` My current school average is ${gpa}.` : ''}${video ? `\n\nRace video: ${video}` : ''}

Could you let me know whether you are recruiting for my events and class year, and what the next steps would be? I would be glad to share my full athlete profile.

Thank you very much for your time and consideration.

Best regards,
${profile.name}${contactLine ? `\n${contactLine}` : ''}
🇧🇪 Belgium`

  return { subject, body }
}
