import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './lib/i18n.jsx'
import { cloudInit } from './lib/cloud.js'
import './index.css'

function render() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </React.StrictMode>,
  )
}

// On tire d'abord les données du cloud dans le localStorage (borné à 3,5 s),
// puis on rend l'app : elle lit alors les données synchronisées.
cloudInit().finally(render)
