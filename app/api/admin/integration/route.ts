/**
 * Knowledge-OS Integration API — v2.0
 * GET  /api/admin/integration — Get integration status and events
 * POST /api/admin/integration — Process incoming event from EDI/learning.me
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { processIncomingEvent } from '@/lib/knowledge-os-integration'
import { requireAdmin } from '@/lib/rbac'
import { validateRequest, integrationEventSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const events = await prisma.knowledgeOSEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const integrationStatus = {
      edi: {
        configured: !!(process.env.EDI_API_URL && process.env.EDI_API_KEY),
        url: process.env.EDI_API_URL || null,
      },
      learningMe: {
        configured: !!(process.env.LEARNING_ME_API_URL && process.env.LEARNING_ME_API_KEY),
        url: process.env.LEARNING_ME_API_URL || null,
      },
      eventBus: {
        configured: !!process.env.KNOWLEDGE_OS_EVENT_BUS_URL,
        url: process.env.KNOWLEDGE_OS_EVENT_BUS_URL || null,
      },
    }

    return NextResponse.json({ integrationStatus, recentEvents: events })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get integration status' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // SECURITY: this endpoint mutates state and previously had NO auth check.
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const parsed = await validateRequest(request, integrationEventSchema)
  if (!parsed.success) return parsed.response

  try {
    const { eventType, source, payload } = parsed.data
    await processIncomingEvent(eventType, source, payload ?? {})
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Integration event error:', error)
    return NextResponse.json({ error: 'Failed to process event' }, { status: 500 })
  }
}
