'use client'

/**
 * Surveys Manager Component
 */
import { useState, useEffect } from 'react'
import { availableTemplates } from '@/lib/question-flow'

interface Survey {
  id: number
  title: string
  description: string
  type: string
  isActive: boolean
  templateId?: string
  templateName?: string
  createdAt: string
  _count: { responses: number; conversations: number; questions: number }
}

export function SurveysManager() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    type: 'CONVERSATIONAL' as string,
    templateId: '' as string,
  })

  useEffect(() => {
    fetchSurveys()
  }, [])

  async function fetchSurveys() {
    try {
      const res = await fetch('/api/admin/surveys')
      const data = await res.json()
      setSurveys(data.surveys || [])
    } catch (error) {
      console.error('Failed to fetch surveys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function createSurvey() {
    try {
      const template = availableTemplates.find((t) => t.id === newSurvey.templateId)
      const res = await fetch('/api/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSurvey,
          templateName: template?.name || null,
          templateId: newSurvey.templateId || null,
        }),
      })
      if (res.ok) {
        setShowCreate(false)
        setNewSurvey({ title: '', description: '', type: 'CONVERSATIONAL', templateId: '' })
        fetchSurveys()
      }
    } catch (error) {
      console.error('Failed to create survey:', error)
    }
  }

  async function toggleSurvey(id: number) {
    await fetch(`/api/admin/surveys/${id}/toggle`, { method: 'POST' })
    fetchSurveys()
  }

  async function deleteSurvey(id: number) {
    if (!confirm('Are you sure you want to delete this survey?')) return
    await fetch(`/api/admin/surveys/${id}`, { method: 'DELETE' })
    fetchSurveys()
  }

  if (isLoading) return <div className="text-gray-500">Loading surveys...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Surveys</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Survey
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-xl border bg-white p-6 space-y-4">
          <h3 className="font-semibold">Create New Survey</h3>
          <input
            type="text"
            placeholder="Survey Title"
            value={newSurvey.title}
            onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
          />
          <textarea
            placeholder="Description"
            value={newSurvey.description}
            onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={newSurvey.type}
              onChange={(e) => setNewSurvey({ ...newSurvey, type: e.target.value })}
              className="rounded-lg border px-3 py-2"
            >
              <option value="CONVERSATIONAL">Conversational AI</option>
              <option value="STATIC">Static Form</option>
              <option value="VOICE_AGENT">Voice Agent</option>
            </select>
            <select
              value={newSurvey.templateId}
              onChange={(e) => setNewSurvey({ ...newSurvey, templateId: e.target.value })}
              className="rounded-lg border px-3 py-2"
            >
              <option value="">Default Template</option>
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createSurvey}
              disabled={!newSurvey.title}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Survey List */}
      <div className="space-y-3">
        {surveys.map((survey) => (
          <div key={survey.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{survey.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      survey.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {survey.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {survey.type}
                  </span>
                  {survey.templateName && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                      {survey.templateName}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{survey.description}</p>
                <div className="mt-2 flex gap-4 text-xs text-gray-400">
                  <span>{survey._count.responses} responses</span>
                  <span>{survey._count.conversations} conversations</span>
                  <span>{survey._count.questions} questions</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleSurvey(survey.id)}
                  className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                >
                  {survey.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteSurvey(survey.id)}
                  className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {surveys.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No surveys yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  )
}
