/**
 * Lightweight in-memory rate limiter (v3.0)
 *
 * A dependency-free fixed-window limiter suitable for a single-instance
 * deployment. For multi-instance/serverless deployments this should be
 * backed by a shared store (e.g. Redis / Upstash) — see the audit report.
 */

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  /** Unix epoch (ms) when the current window resets. */
  reset: number
}

interface WindowState {
  count: number
  reset: number
}

// Module-level store. Persists for the lifetime of the server process.
const store = new Map<string, WindowState>()

/**
 * Fixed-window rate limit check.
 *
 * @param key         Unique identifier for the caller (e.g. `login:<ip>`).
 * @param limit       Max requests allowed per window.
 * @param windowMs    Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now >= existing.reset) {
    const reset = now + windowMs
    store.set(key, { count: 1, reset })
    return { success: true, limit, remaining: limit - 1, reset }
  }

  existing.count += 1
  const remaining = Math.max(0, limit - existing.count)
  return {
    success: existing.count <= limit,
    limit,
    remaining,
    reset: existing.reset,
  }
}

/**
 * Best-effort client IP extraction from a request's headers.
 * Falls back to a constant so the limiter still functions locally.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

/** Build standard rate-limit response headers. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
  }
}

/** Test helper: clear all rate-limit state. */
export function __resetRateLimitStore(): void {
  store.clear()
}
