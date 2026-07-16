/**
 * Duplicate Survey
 * POST /api/admin/surveys/[id]/duplicate
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const original = await prisma.survey.findUnique({
      where: { id: parseInt(params.id) },
      include: { questions: true, voiceAgentQuestions: true },
    })

    if (!original) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    const duplicate = await prisma.survey.create({
      data: {
        title: `${original.title} (copy)`,
        description: original.description,
        welcomeText: original.welcomeText,
        thankYouText: original.thankYouText,
        surveyType: original.surveyType,
        templateId: original.templateId,
        templateName: original.templateName,
        createdById: original.createdById,
        isActive: false,
        questions: {
          create: original.questions.map((q) => ({
            title: q.title,
            type: q.type,
            options: q.options,
            isRequired: q.isRequired,
            order: q.order,
          })),
        },
        voiceAgentQuestions: {
          create: original.voiceAgentQuestions.map((q) => ({
            title: q.title,
            order: q.order,
          })),
        },
      },
    })

    return NextResponse.json({ survey: duplicate }, { status: 201 })
  } catch (error) {
    console.error('Duplicate error:', error)
    return NextResponse.json({ error: 'Failed to duplicate survey' }, { status: 500 })
  }
}
