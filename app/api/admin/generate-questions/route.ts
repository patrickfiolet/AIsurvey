export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateQuestionsAI } from '@/lib/ai-helper'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req?.json?.()
    const { topic, count, language, surveyId } = body ?? {}
    if (!topic || !surveyId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const questions = await generateQuestionsAI(topic, count ?? 5, language ?? 'nl')
    if (!questions?.length) return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    const maxOrder = await prisma.question.findFirst({ where: { surveyId }, orderBy: { order: 'desc' } })
    let order = (maxOrder?.order ?? 0) + 1
    for (const q of questions) {
      await prisma.question.create({ data: { surveyId, title: q, type: 'OPEN_TEXT', order } })
      order++
    }
    return NextResponse.json({ success: true, count: questions?.length ?? 0 })
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}
