// Persistance locale (favoris) dans le navigateur — pas de serveur, 100% chez toi.

const KEY = 'pitusa.favorites.v1'

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function saveFavorites(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]))
  } catch {
    /* stockage indisponible : on ignore silencieusement */
  }
}

// --- Champs editables de la fiche athlete (email, GPA, video, bio...) ---
const EXTRAS_KEY = 'pitusa.profileExtras.v1'

export function loadProfileExtras() {
  try {
    const raw = localStorage.getItem(EXTRAS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveProfileExtras(obj) {
  try {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(obj))
  } catch {
    /* ignore */
  }
}
