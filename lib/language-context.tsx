'use client'

/**
 * Language Context Provider
 * Manages the current language state across the application.
 */
import { createContext, useContext, useState, ReactNode } from 'react'
import type { SupportedLanguage } from './types'

interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'nl',
  setLanguage: () => {},
})

export function LanguageProvider({
  children,
  defaultLanguage = 'nl',
}: {
  children: ReactNode
  defaultLanguage?: SupportedLanguage
}) {
  const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage)

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
