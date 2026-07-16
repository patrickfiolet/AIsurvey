/**
 * Tests for Zod validation schemas
 */
import { describe, it, expect } from '@jest/globals'
import {
  signupSchema,
  loginSchema,
  createSurveySchema,
  integrationEventSchema,
} from '@/lib/validation'

describe('signupSchema', () => {
  it('accepts a valid signup payload', () => {
    const r = signupSchema.safeParse({ email: 'a@b.com', password: 'password123', name: 'Alice' })
    expect(r.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const r = signupSchema.safeParse({ email: 'not-an-email', password: 'password123' })
    expect(r.success).toBe(false)
  })

  it('rejects a too-short password', () => {
    const r = signupSchema.safeParse({ email: 'a@b.com', password: 'short' })
    expect(r.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: 'x' })
    expect(r.success).toBe(true)
  })

  it('rejects a missing password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '' })
    expect(r.success).toBe(false)
  })
})

describe('createSurveySchema', () => {
  it('accepts a minimal valid survey', () => {
    const r = createSurveySchema.safeParse({ title: 'My Survey' })
    expect(r.success).toBe(true)
  })

  it('rejects an empty title', () => {
    const r = createSurveySchema.safeParse({ title: '' })
    expect(r.success).toBe(false)
  })

  it('rejects an invalid survey type', () => {
    const r = createSurveySchema.safeParse({ title: 'X', type: 'BOGUS' })
    expect(r.success).toBe(false)
  })
})

describe('integrationEventSchema', () => {
  it('defaults payload to an empty object', () => {
    const r = integrationEventSchema.safeParse({ eventType: 'sync', source: 'edi' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.payload).toEqual({})
  })

  it('rejects a missing eventType', () => {
    const r = integrationEventSchema.safeParse({ source: 'edi' })
    expect(r.success).toBe(false)
  })
})
