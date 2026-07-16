/**
 * Export Responses to Excel
 * POST /api/admin/responses/export
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { surveyId } = await request.json()

    const responses = await prisma.response.findMany({
      where: { surveyId: parseInt(surveyId) },
      include: { answers: { include: { question: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // Return structured data for client-side Excel generation
    const exportData = responses.map((r) => ({
      respondentName: r.respondentName,
      respondentEmail: r.respondentEmail,
      submittedAt: r.createdAt,
      answers: r.answers.map((a) => ({
        question: a.question.title,
        answer: a.textValue,
      })),
    }))

    return NextResponse.json({ data: exportData })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export responses' }, { status: 500 })
  }
}
