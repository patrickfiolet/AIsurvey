/**
 * VAPI webhook signature verification (v3.0)
 *
 * VAPI can be configured to send a shared secret with each webhook request.
 * We verify it here before trusting/processing any event, preventing spoofed
 * calls to our webhook endpoint from mutating the database.
 *
 * Two verification modes are supported:
 *  1. Plain shared-secret header (`x-vapi-secret`) — constant-time compared.
 *  2. HMAC-SHA256 signature over the raw request body (`x-vapi-signature`).
 */
import crypto from 'crypto'

/** Constant-time string comparison that tolerates length differences. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

export interface VapiVerifyResult {
  valid: boolean
  reason?: string
}

/**
 * Verify an incoming VAPI webhook.
 *
 * @param rawBody     The raw (unparsed) request body string.
 * @param headers     Request headers.
 * @param secret      The configured shared secret (VAPI_WEBHOOK_SECRET).
 */
export function verifyVapiWebhook(
  rawBody: string,
  headers: Headers,
  secret: string | undefined
): VapiVerifyResult {
  if (!secret) {
    // Fail closed: if no secret is configured the endpoint must not be exposed.
    return { valid: false, reason: 'VAPI_WEBHOOK_SECRET not configured' }
  }

  // Mode 1: plain shared secret header.
  const plain = headers.get('x-vapi-secret')
  if (plain) {
    return safeEqual(plain, secret)
      ? { valid: true }
      : { valid: false, reason: 'Invalid x-vapi-secret' }
  }

  // Mode 2: HMAC-SHA256 signature of the raw body.
  const signature = headers.get('x-vapi-signature')
  if (signature) {
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    // Accept an optional "sha256=" prefix.
    const provided = signature.startsWith('sha256=') ? signature.slice(7) : signature
    return safeEqual(provided, expected)
      ? { valid: true }
      : { valid: false, reason: 'Invalid x-vapi-signature' }
  }

  return { valid: false, reason: 'Missing VAPI signature header' }
}
