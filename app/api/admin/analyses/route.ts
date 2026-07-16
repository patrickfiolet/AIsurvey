/**
 * Saved Analyses CRUD
 * GET    /api/admin/analyses?surveyId=X
 * POST   /api/admin/analyses
 * DELETE /api/admin/analyses?id=X
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
    const analyses = await prisma.analysis.findMany({
      where: surveyId ? { surveyId: parseInt(surveyId) } : {},
      orderBy: { generatedAt: 'desc' },
    })
    return NextResponse.json({ analyses })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const analysis = await prisma.analysis.create({ data: body })
    return NextResponse.json({ analysis }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    await prisma.analysis.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Analysis deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 })
  }
}
