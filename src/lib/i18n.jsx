// ---------------------------------------------------------------------------
// Internationalisation FR / EN. Un seul interrupteur bascule toute l'appli.
// Usage : const { t, lang, setLang } = useLang() ; puis t('Bonjour', 'Hello').
// La langue est mémorisée dans le navigateur.
// ---------------------------------------------------------------------------
import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'pitusa.lang.v1'
const LangContext = createContext({ lang: 'fr', setLang: () => {}, t: (fr) => fr })

// La page coach (?coach) s'adresse aux coachs US : elle s'ouvre d'office en
// anglais, indépendamment de la préférence de l'appli principale (et sans
// l'écraser). L'appli principale reste en français par défaut.
const isCoach = (() => {
  try {
    return new URLSearchParams(window.location.search).has('coach')
  } catch {
    return false
  }
})()

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (isCoach) return 'en'
    try {
      return localStorage.getItem(KEY) === 'en' ? 'en' : 'fr'
    } catch {
      return 'fr'
    }
  })
  const setLang = (l) => {
    setLangState(l)
    if (isCoach) return // ne pas écraser la préférence de l'appli principale
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* ignore */
    }
  }
  useEffect(() => {
    try {
      document.documentElement.lang = lang
    } catch {
      /* ignore */
    }
  }, [lang])

  // t(fr, en) : renvoie la chaîne dans la langue active (fallback FR si EN absent).
  const t = (fr, en) => (lang === 'en' ? (en ?? fr) : fr)

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}
