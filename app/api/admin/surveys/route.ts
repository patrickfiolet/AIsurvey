export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json([], { status: 401 })
    const surveys = await prisma.survey.findMany({ include: { _count: { select: { responses: true, conversations: true, questions: true } } }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(surveys)
  } catch { return NextResponse.json([]) }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req?.json?.()
    const survey = await prisma.survey.create({ data: { title: body?.title ?? 'New Survey', surveyType: body?.surveyType ?? 'STATIC', description: body?.description ?? '', welcomeText: body?.welcomeText ?? '', thankYouText: body?.thankYouText ?? '' } })
    return NextResponse.json(survey)
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req?.json?.()
    const data: any = {}
    if (body?.title !== undefined) data.title = body.title
    if (body?.isActive !== undefined) data.isActive = body.isActive
    if (body?.description !== undefined) data.description = body.description
    if (body?.welcomeText !== undefined) data.welcomeText = body.welcomeText
    if (body?.thankYouText !== undefined) data.thankYouText = body.thankYouText
    if (body?.isAnonymous !== undefined) data.isAnonymous = body.isAnonymous
    const survey = await prisma.survey.update({ where: { id: body?.id }, data })
    return NextResponse.json(survey)
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const url = new URL(req?.url ?? '')
    const id = Number(url?.searchParams?.get?.('id'))
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await prisma.survey.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}
