/**
 * Questions Management API
 * GET  /api/admin/questions?surveyId=X
 * POST /api/admin/questions
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
  if (!surveyId) return NextResponse.json({ error: 'surveyId required' }, { status: 400 })

  try {
    const questions = await prisma.question.findMany({
      where: { surveyId: parseInt(surveyId) },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Questions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const question = await prisma.question.create({ data: body })
    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    console.error('Question creation error:', error)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}
