'use client'

/**
 * Survey Interface Page — All 3 modes
 * URL: /survey?surveyId=X&lang=nl
 */
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConversationalInterface } from '@/components/survey/conversational-interface'
import { SUPPORTED_LANGUAGES } from '@/lib/types'
import type { SupportedLanguage } from '@/lib/types'

function SurveyContent() {
  const searchParams = useSearchParams()
  const surveyId = searchParams.get('surveyId') || '1'
  const initialLang = (searchParams.get('lang') || 'nl') as SupportedLanguage

  const [language, setLanguage] = useState<SupportedLanguage>(initialLang)
  const [respondentName, setRespondentName] = useState('')
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-2xl font-bold text-gray-900 text-center">
            AI-Driven Assessment
          </h1>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your name..."
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setStarted(true)}
            disabled={!respondentName.trim()}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Conversation
          </button>
        </div>
      </div>
    )
  }

  return (
    <ConversationalInterface
      surveyId={surveyId}
      respondentName={respondentName}
      language={language}
    />
  )
}

export default function SurveyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <SurveyContent />
    </Suspense>
  )
}
