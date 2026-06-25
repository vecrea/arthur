// ---------------------------------------------------------------------------
// Sauvegarde / restauration de TOUTES les données locales de l'app
// (chronos, objectifs, favoris, coachs, démarches, fiche, langue, SwimCloud…).
// Permet de passer d'un appareil à l'autre et de garder un backup, sans serveur.
// Tout est stocké sous le préfixe « pitusa. » dans le localStorage.
// ---------------------------------------------------------------------------

const PREFIX = 'pitusa.'

export function buildBackup() {
  const data = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) data[k] = localStorage.getItem(k)
    }
  } catch {
    /* ignore */
  }
  return { app: 'party-in-the-usa', version: 1, exportedAt: new Date().toISOString(), data }
}

export function downloadBackup() {
  const json = JSON.stringify(buildBackup(), null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `party-in-the-usa-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Restaure depuis le texte d'un fichier exporté. Renvoie { ok, count, error }.
export function importBackup(text) {
  let obj
  try {
    obj = JSON.parse(text)
  } catch {
    return { ok: false, error: 'parse' }
  }
  const data = obj && obj.data
  if (!data || typeof data !== 'object') return { ok: false, error: 'format' }
  let count = 0
  try {
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith(PREFIX) && typeof v === 'string') {
        localStorage.setItem(k, v)
        count++
      }
    }
  } catch {
    return { ok: false, error: 'write' }
  }
  return { ok: true, count }
}
