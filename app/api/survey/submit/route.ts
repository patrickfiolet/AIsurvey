export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req?.json?.()
    const { surveyId, respondentName, respondentEmail, answers } = body ?? {}
    if (!surveyId) return NextResponse.json({ error: 'Missing surveyId' }, { status: 400 })
    const response = await prisma.response.create({ data: { surveyId, respondentName: respondentName ?? null, respondentEmail: respondentEmail ?? null, isCompleted: true } })
    for (const a of (answers ?? [])) {
      await prisma.answer.create({ data: { responseId: response?.id, questionId: a?.questionId, textValue: a?.textValue ?? null } })
    }
    return NextResponse.json({ success: true, responseId: response?.id })
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}
