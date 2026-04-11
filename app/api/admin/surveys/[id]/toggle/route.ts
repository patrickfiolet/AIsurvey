/**
 * Toggle Survey Active Status
 * POST /api/admin/surveys/[id]/toggle
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
    const survey = await prisma.survey.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    const updated = await prisma.survey.update({
      where: { id: parseInt(params.id) },
      data: { isActive: !survey.isActive },
    })

    return NextResponse.json({ survey: updated })
  } catch (error) {
    console.error('Toggle error:', error)
    return NextResponse.json({ error: 'Failed to toggle survey' }, { status: 500 })
  }
}
