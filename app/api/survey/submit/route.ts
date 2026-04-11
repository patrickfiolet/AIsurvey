/**
 * Static Survey Submission API
 * POST /api/survey/submit
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const submitSchema = z.object({
  surveyId: z.number(),
  respondentName: z.string().default('Anonymous'),
  respondentEmail: z.string().email().optional(),
  language: z.string().default('nl'),
  answers: z.array(
    z.object({
      questionId: z.number(),
      text: z.string(),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = submitSchema.parse(body)

    // Check survey exists and is active
    const survey = await prisma.survey.findUnique({
      where: { id: validated.surveyId },
    })

    if (!survey || !survey.isActive) {
      return NextResponse.json({ error: 'Survey not found or inactive' }, { status: 404 })
    }

    // Create response with answers
    const response = await prisma.response.create({
      data: {
        surveyId: validated.surveyId,
        respondentName: validated.respondentName,
        respondentEmail: validated.respondentEmail,
        language: validated.language,
        answers: {
          create: validated.answers.map((answer) => ({
            questionId: answer.questionId,
            text: answer.text,
          })),
        },
      },
      include: { answers: true },
    })

    return NextResponse.json(
      { message: 'Survey submitted successfully', responseId: response.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Survey submit error:', error)
    return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 })
  }
}
