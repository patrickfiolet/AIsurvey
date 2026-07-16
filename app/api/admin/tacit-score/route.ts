/**
 * Tacit Knowledge Score Dashboard API — v2.0
 * GET /api/admin/tacit-score?surveyId=X
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const surveyId = request.nextUrl.searchParams.get('surveyId')

  try {
    const where = surveyId ? { surveyId: parseInt(surveyId) } : {}

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        metadata: true,
        extractedEntities: true,
        survey: { select: { title: true, templateId: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // ConversationMetadata is stored as key/value rows; build a typed lookup.
    const buildMetadataLookup = (rows: { metadataKey: string; metadataValue: string }[]) => {
      const map = new Map(rows.map((m) => [m.metadataKey, m.metadataValue]))
      const num = (key: string) => Number(map.get(key) ?? 0) || 0
      const list = (key: string): string[] => {
        const raw = map.get(key)
        if (!raw) return []
        try {
          const parsed = JSON.parse(raw)
          return Array.isArray(parsed) ? parsed.map(String) : []
        } catch {
          return raw.split(',').map((s) => s.trim()).filter(Boolean)
        }
      }
      return { num, list }
    }

    // Calculate aggregate scores
    const scoredConversations = conversations.map((conv) => {
      const meta = buildMetadataLookup(conv.metadata)
      return {
        id: conv.id,
        respondentName: conv.respondentName,
        surveyTitle: conv.survey?.title ?? null,
        templateId: conv.survey?.templateId ?? null,
        isCompleted: conv.isCompleted,
        tacitKnowledgeScore: meta.num('tacitKnowledgeScore'),
        knowledgeDomains: meta.list('knowledgeDomains'),
        uniqueInsightsCount: meta.num('uniqueInsightsCount'),
        decisionContextCount: meta.num('decisionContextCount'),
        workaroundCount: meta.num('workaroundCount'),
        exceptionCount: meta.num('exceptionCount'),
        entityCount: conv.extractedEntities.length,
        createdAt: conv.createdAt,
      }
    })

    // Aggregate statistics
    const completedConversations = scoredConversations.filter((c) => c.isCompleted)
    const avgScore =
      completedConversations.length > 0
        ? completedConversations.reduce((sum, c) => sum + c.tacitKnowledgeScore, 0) /
          completedConversations.length
        : 0

    const allDomains = completedConversations.flatMap((c) => c.knowledgeDomains)
    const domainCounts = allDomains.reduce(
      (acc, d) => {
        acc[d] = (acc[d] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      conversations: scoredConversations,
      aggregate: {
        totalConversations: conversations.length,
        completedConversations: completedConversations.length,
        averageTacitScore: Math.round(avgScore * 10) / 10,
        totalDecisionContexts: completedConversations.reduce(
          (sum, c) => sum + c.decisionContextCount,
          0
        ),
        totalWorkarounds: completedConversations.reduce(
          (sum, c) => sum + c.workaroundCount,
          0
        ),
        totalExceptions: completedConversations.reduce(
          (sum, c) => sum + c.exceptionCount,
          0
        ),
        domainCoverage: domainCounts,
      },
    })
  } catch (error) {
    console.error('Tacit score error:', error)
    return NextResponse.json({ error: 'Failed to fetch tacit scores' }, { status: 500 })
  }
}
