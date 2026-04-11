/**
 * Voice Agent Questions CRUD
 * GET/POST/PUT/DELETE /api/admin/voice-agent-questions
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
    const questions = await prisma.voiceAgentQuestion.findMany({
      where: surveyId ? { surveyId: parseInt(surveyId) } : {},
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ questions })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const question = await prisma.voiceAgentQuestion.create({ data: body })
    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, ...data } = await request.json()
    const question = await prisma.voiceAgentQuestion.update({ where: { id }, data })
    return NextResponse.json({ question })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    await prisma.voiceAgentQuestion.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Question deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
