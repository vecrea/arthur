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

// --- Journal de chronos (suivi de progression) ---
const TIMES_KEY = 'pitusa.times.v1'

export function loadTimes() {
  try {
    const raw = localStorage.getItem(TIMES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTimes(arr) {
  try {
    localStorage.setItem(TIMES_KEY, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

// --- URL du profil SwimCloud (pour l'import copier-coller) ---
const SC_URL_KEY = 'pitusa.swimcloudUrl.v1'

export function loadSwimcloudUrl() {
  try {
    return localStorage.getItem(SC_URL_KEY) || ''
  } catch {
    return ''
  }
}

export function saveSwimcloudUrl(url) {
  try {
    localStorage.setItem(SC_URL_KEY, url)
  } catch {
    /* ignore */
  }
}

// --- Bulletin (matières & notes /20) pour le calcul du GPA ---
const GPA_KEY = 'pitusa.gpa.v1'

export function loadGpaSubjects() {
  try {
    const raw = localStorage.getItem(GPA_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveGpaSubjects(arr) {
  try {
    localStorage.setItem(GPA_KEY, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

const GPA_SCALE_KEY = 'pitusa.gpascale.v1'
export function loadGpaScale() {
  try {
    // Défaut % (échelle courante en Belgique) ; '20' seulement si explicitement choisi.
    return localStorage.getItem(GPA_SCALE_KEY) === '20' ? '20' : '100'
  } catch {
    return '100'
  }
}
export function saveGpaScale(scale) {
  try {
    localStorage.setItem(GPA_SCALE_KEY, scale)
  } catch {
    /* ignore */
  }
}

// --- Objectifs de chronos (cibles par épreuve) ---
const GOALS_KEY = 'pitusa.goals.v1'

export function loadGoals() {
  try {
    const raw = localStorage.getItem(GOALS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveGoals(arr) {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

// --- Thème clair / sombre ---
const THEME_KEY = 'pitusa.theme.v1'

export function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
    // Premier chargement : on respecte la préférence système.
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
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
