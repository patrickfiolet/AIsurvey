export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json([], { status: 401 })
    const { searchParams } = new URL(req.url)
    const surveyId = searchParams.get('surveyId')
    const language = searchParams.get('language')
    if (!surveyId) return NextResponse.json([])
    const where: any = { entityType: { in: ['survey', 'question'] } }
    if (language) where.language = language
    // Get survey-related translations
    const translations = await prisma.translation.findMany({
      where: {
        ...where,
        OR: [
          { entityType: 'survey', entityId: Number(surveyId) },
          {
            entityType: 'question',
            entityId: {
              in: (await prisma.question.findMany({ where: { surveyId: Number(surveyId) }, select: { id: true } })).map((q: any) => q.id)
            }
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(translations)
  } catch { return NextResponse.json([]) }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { translations } = body ?? {}
    if (!translations || !Array.isArray(translations)) return NextResponse.json({ error: 'Translations array required' }, { status: 400 })
    const results = []
    for (const t of translations) {
      const { entityType, entityId, language, fieldName, content } = t ?? {}
      if (!entityType || !entityId || !language || !content) continue
      const result = await prisma.translation.upsert({
        where: {
          entityType_entityId_language_fieldName: {
            entityType,
            entityId: Number(entityId),
            language,
            fieldName: fieldName || '',
          }
        },
        update: { content },
        create: { entityType, entityId: Number(entityId), language, fieldName: fieldName || '', content },
      })
      results.push(result)
    }
    return NextResponse.json({ success: true, count: results.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error saving translations' }, { status: 500 })
  }
}
