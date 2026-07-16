export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { validateRequest, signupSchema } from '@/lib/validation'
import { requireAdmin } from '@/lib/rbac'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'

/**
 * POST /api/signup
 *
 * SECURITY: This endpoint previously allowed ANYONE to create an ADMIN user
 * (privilege escalation). It now works in two modes:
 *
 *  1. Bootstrap mode — when there are zero users in the database, the very
 *     first account may be created without authentication and is granted the
 *     ADMIN role (initial owner).
 *  2. Managed mode — once at least one user exists, only an authenticated
 *     ADMIN may create additional users, and new users default to the VIEWER
 *     role (an admin can promote them afterwards).
 */
export async function POST(request: NextRequest) {
  try {
    // Basic brute-force / abuse protection.
    const ip = getClientIp(request)
    const limit = rateLimit(`signup:${ip}`, 5, 60_000)
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429, headers: rateLimitHeaders(limit) }
      )
    }

    const parsed = await validateRequest(request, signupSchema)
    if (!parsed.success) return parsed.response
    const { email, password, name } = parsed.data

    const userCount = await prisma.user.count()
    const isBootstrap = userCount === 0

    // In managed mode, require an authenticated ADMIN to create users.
    if (!isBootstrap) {
      const auth = await requireAdmin()
      if (!auth.ok) return auth.response
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const role = isBootstrap ? 'ADMIN' : 'VIEWER'
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: name ?? null, role },
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
      { status: 201 }
    )
  } catch (error) {
    // Do not leak internal error details to the client.
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
