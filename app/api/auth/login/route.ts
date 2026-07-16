export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { validate, loginSchema } from '@/lib/validation'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // SECURITY: throttle login attempts per IP to slow credential stuffing.
    const ip = getClientIp(req)
    const limit = rateLimit(`login:${ip}`, 10, 60_000)
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many login attempts, please try again later' },
        { status: 429, headers: rateLimitHeaders(limit) }
      )
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = validate(loginSchema, body)
    if (!parsed.success) return parsed.response
    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    // Always run a bcrypt comparison to reduce user-enumeration timing signal.
    const hash = user?.password ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv'
    const valid = await bcrypt.compare(password, hash)
    if (!user || !valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role })
  } catch (e) {
    // Do not leak internal error details to the client.
    console.error('Login error:', e)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
