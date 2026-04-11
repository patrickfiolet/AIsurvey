/**
 * Knowledge Graph API — v2.0
 * GET /api/admin/knowledge-graph?domain=X&nodeType=Y
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getKnowledgeGraph, getKnowledgeAtRisk } from '@/lib/knowledge-graph'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const domain = request.nextUrl.searchParams.get('domain') || undefined
    const nodeType = request.nextUrl.searchParams.get('nodeType') || undefined
    const personNodeId = request.nextUrl.searchParams.get('atRiskPerson')

    if (personNodeId) {
      const graph = await getKnowledgeAtRisk(parseInt(personNodeId))
      return NextResponse.json({ graph })
    }

    const graph = await getKnowledgeGraph({ domain, nodeType })
    return NextResponse.json({ graph })
  } catch (error) {
    console.error('Knowledge graph error:', error)
    return NextResponse.json({ error: 'Failed to fetch knowledge graph' }, { status: 500 })
  }
}
