export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json([], { status: 401 })
    const calls = await prisma.agentCall.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
    return NextResponse.json(calls)
  } catch { return NextResponse.json([]) }
}
