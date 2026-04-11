/**
 * VAPI Phone Configuration
 * POST /api/vapi/phone
 */
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  try {
    const phoneConfig = {
      provider: 'vapi',
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      assistantId: null, // Dynamic assistant via /api/vapi/assistant
    }
    return NextResponse.json(phoneConfig)
  } catch (error) {
    console.error('Phone config error:', error)
    return NextResponse.json({ error: 'Failed to get phone config' }, { status: 500 })
  }
}
