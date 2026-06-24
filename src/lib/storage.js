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

// --- Carnet de contacts coachs ---
const COACHES_KEY = 'pitusa.coaches.v1'

export function loadCoaches() {
  try {
    const raw = localStorage.getItem(COACHES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCoaches(arr) {
  try {
    localStorage.setItem(COACHES_KEY, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

// --- Checklist des démarches (cases cochées) ---
const CHECKLIST_KEY = 'pitusa.checklist.v1'

export function loadChecklist() {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function saveChecklist(set) {
  try {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify([...set]))
  } catch {
    /* ignore */
  }
}
