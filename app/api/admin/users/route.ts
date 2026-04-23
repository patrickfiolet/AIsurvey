export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json([], { status: 401 })
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(users)
  } catch { return NextResponse.json([]) }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { email, password, name, role } = body ?? {}
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: name || null, role: role || 'VIEWER' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
    return NextResponse.json(user)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error creating user' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { id, email, password, name, role } = body ?? {}
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    const data: any = {}
    if (email) data.email = email
    if (name !== undefined) data.name = name || null
    if (role) data.role = role
    if (password) data.password = await bcrypt.hash(password, 10)
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
    return NextResponse.json(user)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error updating user' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    // Prevent self-deletion
    const currentUser = await prisma.user.findFirst({ where: { email: (session as any)?.user?.email || '' } })
    if (currentUser && currentUser.id === Number(id)) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }
    await prisma.user.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error deleting user' }, { status: 500 })
  }
}
