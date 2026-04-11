/**
 * Responses Viewer API
 * GET /api/admin/responses?surveyId=X
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

    const responses = await prisma.response.findMany({
      where,
      include: {
        answers: { include: { question: true } },
        survey: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const conversations = await prisma.conversation.findMany({
      where: surveyId ? { surveyId: parseInt(surveyId) } : {},
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        entities: true,
        metadata: true,
        survey: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ responses, conversations })
  } catch (error) {
    console.error('Responses fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
  }
}
