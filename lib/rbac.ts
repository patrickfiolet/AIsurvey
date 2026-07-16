/**
 * Role-based access control helpers (v3.0)
 *
 * Centralizes session + role checks for API routes so individual handlers
 * don't each re-implement (often inconsistent) authorization logic.
 *
 * Usage inside a route handler:
 *
 *   const auth = await requireRole('EDITOR')
 *   if (!auth.ok) return auth.response
 *   // ...proceed, auth.session is guaranteed present
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from './auth'

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER'

// Higher number == more privileges. A user satisfies a required role when
// their rank is >= the required role's rank.
const ROLE_RANK: Record<Role, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
}

export type AuthResult =
  | { ok: true; session: Session; role: Role }
  | { ok: false; response: NextResponse }

function getSessionRole(session: Session | null): Role | null {
  const role = (session?.user as any)?.role
  if (role === 'ADMIN' || role === 'EDITOR' || role === 'VIEWER') return role
  return null
}

/**
 * Require an authenticated session with at least the given role.
 * Returns a discriminated union so callers can early-return the response.
 */
export async function requireRole(minRole: Role): Promise<AuthResult> {
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const role = getSessionRole(session)
  if (!role) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden: no role assigned' }, { status: 403 }),
    }
  }

  if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Forbidden: requires ${minRole} role` },
        { status: 403 }
      ),
    }
  }

  return { ok: true, session, role }
}

/** Convenience wrapper: require an authenticated ADMIN. */
export function requireAdmin(): Promise<AuthResult> {
  return requireRole('ADMIN')
}

/** Convenience wrapper: require any authenticated user (VIEWER or higher). */
export function requireAuth(): Promise<AuthResult> {
  return requireRole('VIEWER')
}
