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
