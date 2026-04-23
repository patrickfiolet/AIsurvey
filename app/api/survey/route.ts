export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req?.url ?? '')
    const id = Number(url?.searchParams?.get?.('id'))
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const survey = await prisma.survey.findUnique({ where: { id } })
    const questions = await prisma.question.findMany({ where: { surveyId: id }, orderBy: { order: 'asc' } })
    return NextResponse.json({ survey, questions })
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}
