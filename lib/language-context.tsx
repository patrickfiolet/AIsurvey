'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'
import { Language, getTranslation } from './i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('nl')

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      try { localStorage?.setItem?.('aisurvey-lang', lang) } catch {}
    }
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let text = getTranslation(language, key)
    if (params) {
      Object.entries(params ?? {}).forEach(([k, v]: [string, any]) => {
        text = text?.replace?.(`{${k}}`, String(v ?? '')) ?? text
      })
    }
    return text ?? key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      language: 'nl' as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    }
  }
  return context
}
