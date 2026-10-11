// ---------------------------------------------------------------------------
// Synchronisation cloud (Firebase) — « login model ».
//
// But : ce que TU écris (chronos, objectifs, fiche, présentation, favoris,
// coachs, GPA, démarches) est stocké dans le cloud et retrouvé sur tous tes
// appareils + visible par les coachs via ?coach.
//
// Sécurité :
//   - LECTURE publique (les coachs doivent pouvoir voir ta page).
//   - ÉCRITURE réservée à ton compte (règle Firestore : uid == OWNER_UID).
//   - On ne synchronise JAMAIS la clé API IA ni les préférences d'appareil
//     (thème, langue) — voir SYNC_KEYS (liste blanche explicite).
// ---------------------------------------------------------------------------
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { initializeFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBrpI9uwQ5wBu6WoJcvN6QPIUdjJ5ljsqU',
  authDomain: 'road-to-ncaa.firebaseapp.com',
  projectId: 'road-to-ncaa',
  storageBucket: 'road-to-ncaa.firebasestorage.app',
  messagingSenderId: '7868778539',
  appId: '1:7868778539:web:cecb95ab83fc84c6d8426e',
}

// Ton identifiant Firebase : seul ce compte peut écrire (voir règles Firestore).
export const OWNER_UID = '6hvjif4GR6Q5Ue0eNajvwVqeX8S2'

// Emplacement du document unique qui contient tes données : collection « sync », doc « athlete ».
const DOC_COLLECTION = 'sync'
const DOC_ID = 'athlete'

// Clés localStorage SYNCHRONISÉES (liste blanche = sûr : rien d'autre ne part dans le cloud).
// Exclus volontairement : pitusa.theme.v1 / pitusa.lang.v1 (prefs par appareil)
// et pitusa.ai.* (clé API IA secrète + cache).
export const SYNC_KEYS = [
  'pitusa.favorites.v1',
  'pitusa.profileExtras.v1',
  'pitusa.coaches.v1',
  'pitusa.times.v1',
  'pitusa.swimcloudUrl.v1',
  'pitusa.gpa.v1',
  'pitusa.gpascale.v1',
  'pitusa.goals.v1',
  'pitusa.about.v1',
  'pitusa.checklist.v1',
]

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
// Long-polling auto-détecté : plus robuste derrière certains réseaux/proxys.
const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
const ref = doc(db, DOC_COLLECTION, DOC_ID)

let currentUser = null
let loadedAt = 0 // ms de la version cloud actuellement appliquée en local
let pushTimer = null

// --- Lecture / écriture du « snapshot » localStorage -----------------------

function readLocalSnapshot() {
  const data = {}
  for (const k of SYNC_KEYS) {
    try {
      const v = localStorage.getItem(k)
      if (v != null) data[k] = v
    } catch {
      /* ignore */
    }
  }
  return data
}

// Applique un snapshot cloud sur le localStorage. Renvoie true si quelque chose a changé.
function applySnapshot(data) {
  if (!data || typeof data !== 'object') return false
  let changed = false
  for (const k of SYNC_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(data, k)) continue // clé absente du cloud : on ne touche pas au local
    const incoming = data[k]
    if (typeof incoming !== 'string') continue
    try {
      if (localStorage.getItem(k) !== incoming) {
        _origSetItem(k, incoming) // écrit SANS re-déclencher de push
        changed = true
      }
    } catch {
      /* ignore */
    }
  }
  return changed
}

function tsToMillis(ts) {
  try {
    return ts && typeof ts.toMillis === 'function' ? ts.toMillis() : 0
  } catch {
    return 0
  }
}

// --- Hook d'écriture : pousser automatiquement quand une clé suivie change --

let _origSetItem = null
function installWriteHook() {
  if (_origSetItem) return
  try {
    _origSetItem = localStorage.setItem.bind(localStorage)
    localStorage.setItem = (k, v) => {
      _origSetItem(k, v)
      if (SYNC_KEYS.includes(k)) schedulePush()
    }
  } catch {
    // Si on ne peut pas patcher, la synchro-à-l'écriture est désactivée (le pull au chargement marche quand même).
    _origSetItem = (k, v) => localStorage.setItem(k, v)
  }
}

function schedulePush() {
  if (!currentUser) return // écriture réservée au propriétaire connecté
  clearTimeout(pushTimer)
  pushTimer = setTimeout(pushNow, 1200)
}

async function pushNow() {
  if (!currentUser) return
  clearTimeout(pushTimer)
  try {
    await setDoc(ref, { data: readLocalSnapshot(), updatedAt: serverTimestamp(), owner: currentUser.uid })
    notify({ pushedAt: Date.now() })
  } catch (e) {
    console.warn('[cloud] écriture échouée', e)
    notify({ error: 'push' })
  }
}

// --- Pull au focus : récupérer une version plus récente d'un autre appareil -

function installFocusPull() {
  let busy = false
  const check = async () => {
    if (document.hidden || busy || pushTimer) return // pas pendant qu'un push local est en attente
    busy = true
    try {
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const d = snap.data()
        const ts = tsToMillis(d.updatedAt)
        if (ts > loadedAt + 500) {
          const changed = applySnapshot(d.data || {})
          loadedAt = ts
          if (changed) window.location.reload() // recharge pour que l'UI reflète les données d'un autre appareil
        }
      }
    } catch {
      /* hors-ligne : on ignore */
    } finally {
      busy = false
    }
  }
  window.addEventListener('focus', check)
  document.addEventListener('visibilitychange', check)
}

// --- Abonnés (pour l'UI de statut) -----------------------------------------

const listeners = new Set()
let state = { user: null, pushedAt: 0, error: null }
function notify(patch) {
  state = { ...state, ...patch }
  for (const cb of listeners) {
    try {
      cb(state)
    } catch {
      /* ignore */
    }
  }
}

export function onCloudState(cb) {
  listeners.add(cb)
  cb(state)
  return () => listeners.delete(cb)
}

// --- API publique -----------------------------------------------------------

// À appeler AVANT le rendu React : tire le cloud dans le localStorage (avec timeout).
export async function cloudInit() {
  installWriteHook()

  // Suivi de l'état de connexion (maintient currentUser + amorce/pousse à la connexion).
  onAuthStateChanged(auth, (user) => {
    currentUser = user
    notify({ user })
    if (user) pushNow() // à la connexion : on publie l'état local courant (amorce le cloud si vide)
  })

  // Pull initial, borné dans le temps pour ne jamais bloquer l'affichage.
  await new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (!done) {
        done = true
        resolve()
      }
    }
    const timer = setTimeout(finish, 3500)
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          const d = snap.data()
          applySnapshot(d.data || {})
          loadedAt = tsToMillis(d.updatedAt)
        }
      })
      .catch((e) => console.warn('[cloud] lecture initiale échouée', e))
      .finally(() => {
        clearTimeout(timer)
        finish()
      })
  })

  installFocusPull()
}

export async function cloudSignIn(email, password) {
  await signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function cloudSignOut() {
  await signOut(auth)
}

export function cloudCurrentUser() {
  return currentUser
}
