import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' => chemins relatifs, fonctionne en local ET sur GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
