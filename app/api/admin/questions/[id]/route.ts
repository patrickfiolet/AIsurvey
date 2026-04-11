/**
 * Single Question API
 * PUT    /api/admin/questions/[id]
 * DELETE /api/admin/questions/[id]
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const question = await prisma.question.update({
      where: { id: parseInt(params.id) },
      data: body,
    })
    return NextResponse.json({ question })
  } catch (error) {
    console.error('Question update error:', error)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.question.delete({ where: { id: parseInt(params.id) } })
    return NextResponse.json({ message: 'Question deleted' })
  } catch (error) {
    console.error('Question delete error:', error)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
