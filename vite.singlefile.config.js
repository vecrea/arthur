import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build standalone : tout (JS/CSS) est inliné dans un seul index.html
// qu'Arthur peut ouvrir d'un double-clic, sans serveur (fonctionne en file://).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { outDir: 'dist-single', assetsInlineLimit: 100000000, chunkSizeWarningLimit: 100000 },
})
