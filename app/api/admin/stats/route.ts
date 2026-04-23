export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const [surveys, responses, conversations, voiceCalls] = await Promise.all([
      prisma.survey.count(),
      prisma.response.count(),
      prisma.conversation.count(),
      prisma.agentCall.count(),
    ])
    return NextResponse.json({ surveys, responses, conversations, voiceCalls })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 })
  }
}
