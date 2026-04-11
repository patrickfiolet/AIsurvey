'use client'

/**
 * Static Survey Interface (form-based)
 */
import { useState } from 'react'

interface Question {
  id: number
  text: string
  type: string
  options: string[]
  required: boolean
}

interface SurveyInterfaceProps {
  surveyId: string
  questions: Question[]
  language: string
  welcomeText: string
  thankYouText: string
}

export function SurveyInterface({
  surveyId,
  questions,
  language,
  welcomeText,
  thankYouText,
}: SurveyInterfaceProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [respondentName, setRespondentName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: parseInt(surveyId),
          respondentName: respondentName || 'Anonymous',
          language,
          answers: Object.entries(answers).map(([questionId, text]) => ({
            questionId: parseInt(questionId),
            text,
          })),
        }),
      })

      if (res.ok) {
        setIsCompleted(true)
      }
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600">✓</h2>
          <p className="mt-2 text-gray-600">{thankYouText}</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="mb-8">
        <p className="text-gray-600">{welcomeText}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Your Name</label>
        <input
          type="text"
          value={respondentName}
          onChange={(e) => setRespondentName(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      {questions.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-medium text-gray-700">
            {q.text}
            {q.required && <span className="text-red-500"> *</span>}
          </label>
          {q.type === 'OPEN_TEXT' && (
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              required={q.required}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              rows={3}
            />
          )}
          {q.type === 'MULTIPLE_CHOICE' && (
            <div className="mt-2 space-y-2">
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
