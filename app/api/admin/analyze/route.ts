export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateAIAnalysis } from '@/lib/ai-helper'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req?.json?.()
    const surveyId = body?.surveyId
    if (!surveyId) return NextResponse.json({ error: 'Missing surveyId' }, { status: 400 })
    const responses = await prisma.response.findMany({ where: { surveyId }, include: { answers: { include: { question: true } } } })
    const conversations = await prisma.conversation.findMany({ where: { surveyId }, include: { messages: true } })
    const dataStr = JSON.stringify({ responses: (responses ?? []).map((r: any) => ({ name: r?.respondentName, answers: (r?.answers ?? []).map((a: any) => ({ question: a?.question?.title, answer: a?.textValue })) })), conversations: (conversations ?? []).map((c: any) => ({ messages: (c?.messages ?? []).map((m: any) => ({ role: m?.role, content: m?.content })) })) })
    const analysis = await generateAIAnalysis(dataStr)
    let parsed: any = {}
    try { parsed = JSON.parse(analysis) } catch { parsed = { summary: analysis } }
    await prisma.analysis.create({ data: { surveyId, title: 'AI Analyse', summary: parsed?.summary ?? '', themes: parsed?.themes ?? null, patterns: parsed?.patterns ?? null, problems: parsed?.problems ?? null, bestPractices: parsed?.bestPractices ?? null, knowledgeGaps: parsed?.knowledgeGaps ?? null, recommendations: parsed?.recommendations ?? null } })
    return NextResponse.json(parsed)
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}
