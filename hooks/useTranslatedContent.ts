'use client'

/**
 * Hook for translated content from the database.
 */
import { useState, useEffect } from 'react'

export function useTranslatedContent(text: string, targetLanguage: string) {
  const [translatedText, setTranslatedText] = useState(text)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (targetLanguage === 'nl' || !text) {
      setTranslatedText(text)
      return
    }

    const translate = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/admin/translate-dynamic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetLanguage,
            sourceLanguage: 'nl',
          }),
        })
        const data = await res.json()
        setTranslatedText(data.translatedText || text)
      } catch (error) {
        console.error('Translation error:', error)
        setTranslatedText(text)
      } finally {
        setIsLoading(false)
      }
    }

    translate()
  }, [text, targetLanguage])

  return { translatedText, isLoading }
}
