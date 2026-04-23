export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req?.json?.()
    const { email, password } = body ?? {}
    if (!email || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const valid = await bcrypt.compare(password, user?.password ?? '')
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    return NextResponse.json({ id: user?.id, email: user?.email, name: user?.name, role: user?.role })
  } catch (e: any) { return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 }) }
}
