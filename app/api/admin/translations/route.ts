/**
 * Translations CRUD
 * GET  /api/admin/translations?entityType=X&entityId=Y
 * POST /api/admin/translations
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entityType = request.nextUrl.searchParams.get('entityType')
  const entityId = request.nextUrl.searchParams.get('entityId')

  try {
    const where: any = {}
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = parseInt(entityId)

    const translations = await prisma.translation.findMany({ where })
    return NextResponse.json({ translations })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { entityType, entityId, field, language, value } = body

    const translation = await prisma.translation.upsert({
      where: {
        entityType_entityId_field_language: { entityType, entityId, field, language },
      },
      update: { value },
      create: { entityType, entityId, field, language, value },
    })

    return NextResponse.json({ translation })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save translation' }, { status: 500 })
  }
}
