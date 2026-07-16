/**
 * Tests for the in-memory rate limiter
 */
import { describe, it, expect, beforeEach } from '@jest/globals'
import { rateLimit, getClientIp, __resetRateLimitStore } from '@/lib/rate-limit'

describe('rateLimit()', () => {
  beforeEach(() => {
    __resetRateLimitStore()
  })

  it('allows requests under the limit', () => {
    const r1 = rateLimit('key-a', 3, 1000)
    const r2 = rateLimit('key-a', 3, 1000)
    expect(r1.success).toBe(true)
    expect(r2.success).toBe(true)
    expect(r2.remaining).toBe(1)
  })

  it('blocks requests over the limit', () => {
    rateLimit('key-b', 2, 1000)
    rateLimit('key-b', 2, 1000)
    const third = rateLimit('key-b', 2, 1000)
    expect(third.success).toBe(false)
    expect(third.remaining).toBe(0)
  })

  it('tracks separate keys independently', () => {
    rateLimit('key-c', 1, 1000)
    const other = rateLimit('key-d', 1, 1000)
    expect(other.success).toBe(true)
  })

  it('resets after the window elapses', async () => {
    rateLimit('key-e', 1, 20)
    const blocked = rateLimit('key-e', 1, 20)
    expect(blocked.success).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 30))
    const afterReset = rateLimit('key-e', 1, 20)
    expect(afterReset.success).toBe(true)
  })
})

describe('getClientIp()', () => {
  it('reads the first x-forwarded-for entry', () => {
    const req = new Request('http://x', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', () => {
    const req = new Request('http://x', { headers: { 'x-real-ip': '9.9.9.9' } })
    expect(getClientIp(req)).toBe('9.9.9.9')
  })

  it('returns "unknown" when no ip headers present', () => {
    const req = new Request('http://x')
    expect(getClientIp(req)).toBe('unknown')
  })
})
