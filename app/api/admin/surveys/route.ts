/**
 * Admin Survey Management API
 * GET  /api/admin/surveys — List all surveys
 * POST /api/admin/surveys — Create new survey
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const surveys = await prisma.survey.findMany({
      include: {
        _count: {
          select: {
            responses: true,
            conversations: true,
            questions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ surveys })
  } catch (error) {
    console.error('Surveys fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 })
  }
}

const createSurveySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['STATIC', 'CONVERSATIONAL', 'VOICE_AGENT']).default('CONVERSATIONAL'),
  welcomeText: z.string().optional(),
  thankYouText: z.string().optional(),
  templateId: z.string().optional(),
  templateName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = createSurveySchema.parse(body)

    // Get user ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const survey = await prisma.survey.create({
      data: {
        ...validated,
        userId: user.id,
      },
    })

    return NextResponse.json({ survey }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Survey creation error:', error)
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 })
  }
}
