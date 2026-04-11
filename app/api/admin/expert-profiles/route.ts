/**
 * Expert Profiles API — v2.0
 * GET  /api/admin/expert-profiles
 * POST /api/admin/expert-profiles
 * PUT  /api/admin/expert-profiles
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const profiles = await prisma.expertProfile.findMany({
      include: {
        sessions: {
          select: {
            id: true,
            isCompleted: true,
            createdAt: true,
            metadata: { select: { tacitKnowledgeScore: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { sessions: true, knowledgeNodes: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Expert profiles error:', error)
    return NextResponse.json({ error: 'Failed to fetch expert profiles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const profile = await prisma.expertProfile.create({ data: body })
    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('Expert profile creation error:', error)
    return NextResponse.json({ error: 'Failed to create expert profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, ...data } = await request.json()
    const profile = await prisma.expertProfile.update({
      where: { id },
      data,
    })
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Expert profile update error:', error)
    return NextResponse.json({ error: 'Failed to update expert profile' }, { status: 500 })
  }
}
