'use client'

/**
 * Responses Viewer Component
 */
import { useState, useEffect } from 'react'

export function ResponsesViewer() {
  const [data, setData] = useState<any>({ responses: [], conversations: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchResponses()
  }, [])

  async function fetchResponses() {
    try {
      const res = await fetch('/api/admin/responses')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Failed to fetch responses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="text-gray-500">Loading responses...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Responses</h2>

      {/* Conversational Responses */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Conversational Sessions ({data.conversations?.length || 0})</h3>
        <div className="space-y-3">
          {data.conversations?.map((conv: any) => (
            <div key={conv.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{conv.respondentName}</span>
                  <span className="ml-2 text-sm text-gray-500">{conv.language?.toUpperCase()}</span>
                  <span className={`ml-2 text-xs ${conv.isCompleted ? 'text-green-600' : 'text-amber-600'}`}>
                    {conv.isCompleted ? '✓ Completed' : 'In Progress'}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </div>
              </div>
              {conv.metadata?.tacitKnowledgeScore > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-blue-700">
                    Tacit Score: {Math.round(conv.metadata.tacitKnowledgeScore)}/100
                  </span>
                </div>
              )}
              {conv.entities?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {conv.entities.slice(0, 8).map((e: any, i: number) => (
                    <span
                      key={i}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {e.value}
                    </span>
                  ))}
                  {conv.entities.length > 8 && (
                    <span className="text-xs text-gray-400">+{conv.entities.length - 8} more</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Static Responses */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Static Responses ({data.responses?.length || 0})</h3>
        <div className="space-y-3">
          {data.responses?.map((resp: any) => (
            <div key={resp.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{resp.respondentName}</span>
                <span className="text-sm text-gray-400">
                  {new Date(resp.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {resp.answers?.length || 0} answers
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
