'use client'

/**
 * Tacit Knowledge Score Dashboard — v2.0
 * Visualizes tacit knowledge metrics across all conversations.
 */
import { useState, useEffect } from 'react'

interface TacitData {
  conversations: Array<{
    id: number
    respondentName: string
    surveyTitle: string
    templateId: string | null
    isCompleted: boolean
    tacitKnowledgeScore: number
    knowledgeDomains: string[]
    uniqueInsightsCount: number
    decisionContextCount: number
    workaroundCount: number
    exceptionCount: number
    entityCount: number
    createdAt: string
  }>
  aggregate: {
    totalConversations: number
    completedConversations: number
    averageTacitScore: number
    totalDecisionContexts: number
    totalWorkarounds: number
    totalExceptions: number
    domainCoverage: Record<string, number>
  }
}

export function TacitScoreDashboard() {
  const [data, setData] = useState<TacitData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/tacit-score')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Failed to fetch tacit scores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="text-gray-500">Loading tacit scores...</div>
  if (!data) return <div className="text-gray-500">No data available</div>

  const { aggregate } = data

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tacit Knowledge Score</h2>
        <p className="text-gray-600">
          Measure how much implicit knowledge has been captured across all conversations.
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Average Score"
          value={`${aggregate.averageTacitScore}/100`}
          color="blue"
        />
        <StatCard
          label="Decision Contexts"
          value={String(aggregate.totalDecisionContexts)}
          color="purple"
        />
        <StatCard
          label="Workarounds"
          value={String(aggregate.totalWorkarounds)}
          color="amber"
        />
        <StatCard
          label="Exceptions"
          value={String(aggregate.totalExceptions)}
          color="green"
        />
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-3 font-semibold">Completion</h3>
          <div className="text-3xl font-bold text-blue-600">
            {aggregate.completedConversations}/{aggregate.totalConversations}
          </div>
          <p className="text-sm text-gray-500">conversations completed</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-3 font-semibold">Domain Coverage</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(aggregate.domainCoverage).map(([domain, count]) => (
              <span
                key={domain}
                className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
              >
                {domain}: {count}
              </span>
            ))}
            {Object.keys(aggregate.domainCoverage).length === 0 && (
              <span className="text-sm text-gray-400">No domains identified yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Per-conversation scores */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Conversation Scores</h3>
        <div className="space-y-2">
          {data.conversations.map((conv) => (
            <div key={conv.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{conv.respondentName}</span>
                  <span className="ml-2 text-sm text-gray-500">{conv.surveyTitle}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(conv.tacitKnowledgeScore)}
                    </div>
                    <div className="text-xs text-gray-400">score</div>
                  </div>
                  <div className="h-8 w-24 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${Math.min(conv.tacitKnowledgeScore, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-gray-500">
                <span>🎯 {conv.decisionContextCount} decisions</span>
                <span>🔧 {conv.workaroundCount} workarounds</span>
                <span>⚠️ {conv.exceptionCount} exceptions</span>
                <span>📎 {conv.entityCount} entities</span>
              </div>
            </div>
          ))}

          {data.conversations.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No conversations yet. Start collecting tacit knowledge!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-green-50 text-green-700',
  }

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color] || 'bg-gray-50'}`}>
      <div className="text-sm font-medium opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
}
