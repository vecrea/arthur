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
import { initializeFirestore, doc, getDoc, setDoc, serverTimestamp, collection, addDoc, onSnapshot, query, orderBy, updateDoc, deleteDoc } from 'firebase/firestore'

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
// Boîte de réception des coachs : création publique, lecture réservée au propriétaire (voir règles).
const inboxCol = collection(db, 'inbox')

let currentUser = null
let loadedAt = 0 // ms de la version cloud actuellement appliquée en local
let pushTimer = null
let ready = false // vrai une fois le pull initial terminé (on ne pousse pas avant)
let pendingLoginPush = false // une connexion est survenue avant la fin du pull

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

// Une valeur « triviale » = vide (rien d'intéressant à conserver).
function isTrivial(v) {
  return v == null || v === '' || v === '[]' || v === '{}' || v === 'null'
}

// Applique un snapshot cloud sur le localStorage. Renvoie true si quelque chose a changé.
// safe=true (pull initial) : ne JAMAIS écraser une donnée locale réelle par du vide venu
// du cloud — protège contre une perte de données si le cloud a été amorcé vide ailleurs.
function applySnapshot(data, { safe = false } = {}) {
  if (!data || typeof data !== 'object') return false
  let changed = false
  for (const k of SYNC_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(data, k)) continue // clé absente du cloud : on ne touche pas au local
    const incoming = data[k]
    if (typeof incoming !== 'string') continue
    try {
      const current = localStorage.getItem(k)
      if (current === incoming) continue
      if (safe && !isTrivial(current) && isTrivial(incoming)) continue // garde-fou anti-perte au 1er chargement
      _origSetItem(k, incoming) // écrit SANS re-déclencher de push
      changed = true
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

  // Suivi de l'état de connexion. On ne publie QU'APRÈS le pull initial, pour ne
  // jamais écraser le cloud avec un état local pré-synchronisation.
  onAuthStateChanged(auth, (user) => {
    currentUser = user
    notify({ user })
    if (!user) return
    if (ready) pushNow() // connecté : on publie l'état local (après pull = sûr)
    else pendingLoginPush = true
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
          applySnapshot(d.data || {}, { safe: true }) // garde-fou anti-perte au 1er chargement
          loadedAt = tsToMillis(d.updatedAt)
        }
      })
      .catch((e) => console.warn('[cloud] lecture initiale échouée', e))
      .finally(() => {
        clearTimeout(timer)
        finish()
      })
  })

  ready = true
  if (currentUser && pendingLoginPush) {
    pendingLoginPush = false
    pushNow() // publie l'état local maintenant que le pull est terminé (sûr)
  }

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

// --- Boîte de réception coachs -------------------------------------------
// Un coach (non connecté) dépose un message ; l'athlète (connecté) le lit.

export async function submitCoachMessage(payload) {
  const clean = {
    type: String(payload.type || 'message').slice(0, 40),
    coachName: String(payload.coachName || '').slice(0, 300),
    team: String(payload.team || '').slice(0, 300),
    position: String(payload.position || '').slice(0, 160),
    coachEmail: String(payload.coachEmail || '').slice(0, 300),
    message: String(payload.message || '').slice(0, 4000),
    requestKinds: Array.isArray(payload.requestKinds) ? payload.requestKinds.slice(0, 12).map((x) => String(x).slice(0, 80)) : [],
    slots: String(payload.slots || '').slice(0, 600),
    createdAt: serverTimestamp(),
    read: false,
  }
  await addDoc(inboxCol, clean)
}

// Abonnement temps réel à la boîte (login requis). Renvoie une fonction de désinscription.
export function subscribeInbox(onItems, onError) {
  try {
    const q = query(inboxCol, orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snap) => {
        const items = []
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }))
        onItems(items)
      },
      (e) => {
        console.warn('[cloud] inbox', e)
        onError && onError(e)
      },
    )
  } catch (e) {
    onError && onError(e)
    return () => {}
  }
}

export async function markInboxRead(id, read = true) {
  try {
    await updateDoc(doc(db, 'inbox', id), { read })
  } catch (e) {
    console.warn('[cloud] markInboxRead', e)
  }
}

export async function deleteInboxEntry(id) {
  try {
    await deleteDoc(doc(db, 'inbox', id))
  } catch (e) {
    console.warn('[cloud] deleteInboxEntry', e)
  }
}
