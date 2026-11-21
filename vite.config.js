import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

// Génère des URL propres pour la page coach (sans « ? », qui casse les liens de
// bio Instagram) : à partir du index.html buildé, on écrit aussi
//   • coach.html            → sert …/arthur/coach(.html)
//   • coach/index.html      → sert …/arthur/coach/ (repli répertoire)
// Les deux pointent vers les mêmes assets. Comme la base est relative (./),
// la version en sous-dossier doit remonter d'un cran (./assets → ../assets).
function coachRoutes() {
  let outDir = 'dist'
  return {
    name: 'coach-routes',
    apply: 'build',
    configResolved(cfg) { outDir = cfg.build.outDir },
    closeBundle() {
      const dist = resolve(process.cwd(), outDir)
      const indexPath = join(dist, 'index.html')
      if (!existsSync(indexPath)) return
      const html = readFileSync(indexPath, 'utf8')
      // Même niveau que index.html → chemins ./assets inchangés.
      writeFileSync(join(dist, 'coach.html'), html)
      // Sous-dossier → remonter d'un niveau pour retrouver les assets.
      const sub = html.replace(/(src|href)="\.\//g, '$1="../')
      mkdirSync(join(dist, 'coach'), { recursive: true })
      writeFileSync(join(dist, 'coach', 'index.html'), sub)
    },
  }
}

// base: './' => chemins relatifs, fonctionne en local ET sur GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), coachRoutes()],
})
