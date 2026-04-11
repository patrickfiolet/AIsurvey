/**
 * Single Survey Management API
 * GET    /api/admin/surveys/[id]
 * PUT    /api/admin/surveys/[id]
 * DELETE /api/admin/surveys/[id]
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const survey = await prisma.survey.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: {
          select: { responses: true, conversations: true },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    return NextResponse.json({ survey })
  } catch (error) {
    console.error('Survey fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const survey = await prisma.survey.update({
      where: { id: parseInt(params.id) },
      data: body,
    })

    return NextResponse.json({ survey })
  } catch (error) {
    console.error('Survey update error:', error)
    return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.survey.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ message: 'Survey deleted' })
  } catch (error) {
    console.error('Survey delete error:', error)
    return NextResponse.json({ error: 'Failed to delete survey' }, { status: 500 })
  }
}
