/**
 * Zod validation schemas & helpers (v3.0)
 *
 * Provides typed, reusable request-body validation for API routes so handlers
 * can reject malformed input early with a consistent 400 response instead of
 * trusting arbitrary JSON.
 */
import { z } from 'zod'
import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const signupSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(1).max(120).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
})

export const createSurveySchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  type: z.enum(['CONVERSATIONAL', 'STATIC', 'VOICE_AGENT']).optional(),
  templateId: z.string().trim().max(100).optional().nullable(),
  templateName: z.string().trim().max(200).optional().nullable(),
})

export const integrationEventSchema = z.object({
  eventType: z.string().trim().min(1, 'eventType is required').max(100),
  source: z.string().trim().min(1, 'source is required').max(100),
  payload: z.record(z.string(), z.any()).default({}),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse }

/**
 * Parse and validate an unknown value against a schema. On failure returns a
 * ready-to-return 400 NextResponse with structured field errors.
 */
export function validate<T>(schema: z.ZodType<T>, value: unknown): ValidationResult<T> {
  const result = schema.safeParse(value)
  if (result.success) {
    return { success: true, data: result.data }
  }

  const fieldErrors = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))

  return {
    success: false,
    response: NextResponse.json(
      { error: 'Validation failed', details: fieldErrors },
      { status: 400 }
    ),
  }
}

/**
 * Convenience: read JSON from a request and validate it. Handles malformed
 * JSON bodies gracefully.
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<ValidationResult<T>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
    }
  }
  return validate(schema, body)
}
