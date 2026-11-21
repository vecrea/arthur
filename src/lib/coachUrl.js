// Détecte la « vue coach » (page autonome, lecture seule) à partir de l'URL.
//
// Deux formes acceptées :
//   • ancien lien avec paramètre :  …/arthur/?coach
//   • lien propre sans « ? » :       …/arthur/coach  (ou /coach/ ou /coach.html)
//
// Le lien propre est préférable pour une bio Instagram, où le « ? » casse
// souvent le lien. Le build génère coach.html + coach/index.html pour que ces
// chemins existent sur GitHub Pages (cf. vite.config.js).
export function isCoachUrl() {
  try {
    const { search, pathname } = window.location
    if (new URLSearchParams(search).has('coach')) return true
    return /\/coach(?:\.html)?\/?$/.test(pathname)
  } catch {
    return false
  }
}
