export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json([], { status: 401 })
    const url = new URL(req?.url ?? '')
    const surveyId = Number(url?.searchParams?.get?.('surveyId'))
    if (!surveyId) return NextResponse.json([])
    const questions = await prisma.question.findMany({ where: { surveyId }, orderBy: { order: 'asc' } })
    return NextResponse.json(questions)
  } catch { return NextResponse.json([]) }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req?.json?.()
    const maxOrder = await prisma.question.findFirst({ where: { surveyId: body?.surveyId }, orderBy: { order: 'desc' } })
    const data: any = {
      surveyId: body?.surveyId,
      title: body?.title ?? '',
      type: body?.type ?? 'OPEN_TEXT',
      order: (maxOrder?.order ?? 0) + 1,
    }
    if (body?.options) data.options = body.options
    if (body?.isRequired !== undefined) data.isRequired = body.isRequired
    const question = await prisma.question.create({ data })
    return NextResponse.json(question)
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req?.json?.()
    const { id, title, type, options, isRequired } = body ?? {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const data: any = {}
    if (title !== undefined) data.title = title
    if (type !== undefined) data.type = type
    if (options !== undefined) data.options = options
    if (isRequired !== undefined) data.isRequired = isRequired
    const question = await prisma.question.update({ where: { id: Number(id) }, data })
    return NextResponse.json(question)
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const url = new URL(req?.url ?? '')
    const id = Number(url?.searchParams?.get?.('id'))
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await prisma.question.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}
