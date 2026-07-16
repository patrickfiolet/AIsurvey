/**
 * Tests for VAPI webhook signature verification
 */
import { describe, it, expect } from '@jest/globals'
import crypto from 'crypto'
import { verifyVapiWebhook } from '@/lib/vapi-signature'

const SECRET = 'test-secret'
const body = JSON.stringify({ message: { type: 'status-update' } })

function headers(init: Record<string, string>): Headers {
  return new Headers(init)
}

describe('verifyVapiWebhook()', () => {
  it('fails closed when no secret is configured', () => {
    const result = verifyVapiWebhook(body, headers({ 'x-vapi-secret': 'anything' }), undefined)
    expect(result.valid).toBe(false)
  })

  it('accepts a matching plain shared secret', () => {
    const result = verifyVapiWebhook(body, headers({ 'x-vapi-secret': SECRET }), SECRET)
    expect(result.valid).toBe(true)
  })

  it('rejects a wrong plain shared secret', () => {
    const result = verifyVapiWebhook(body, headers({ 'x-vapi-secret': 'wrong' }), SECRET)
    expect(result.valid).toBe(false)
  })

  it('accepts a valid HMAC-SHA256 signature', () => {
    const sig = crypto.createHmac('sha256', SECRET).update(body).digest('hex')
    const result = verifyVapiWebhook(body, headers({ 'x-vapi-signature': sig }), SECRET)
    expect(result.valid).toBe(true)
  })

  it('accepts an HMAC signature with sha256= prefix', () => {
    const sig = crypto.createHmac('sha256', SECRET).update(body).digest('hex')
    const result = verifyVapiWebhook(body, headers({ 'x-vapi-signature': `sha256=${sig}` }), SECRET)
    expect(result.valid).toBe(true)
  })

  it('rejects a tampered body', () => {
    const sig = crypto.createHmac('sha256', SECRET).update(body).digest('hex')
    const result = verifyVapiWebhook('{"message":{"type":"hacked"}}', headers({ 'x-vapi-signature': sig }), SECRET)
    expect(result.valid).toBe(false)
  })

  it('rejects when no signature header present', () => {
    const result = verifyVapiWebhook(body, headers({}), SECRET)
    expect(result.valid).toBe(false)
  })
})
