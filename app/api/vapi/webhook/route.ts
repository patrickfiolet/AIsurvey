/**
 * VAPI Webhook Handler
 * POST /api/vapi/webhook
 *
 * Processes VAPI events: assistant-request, status-update, end-of-call-report, transcript
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyVapiWebhook } from '@/lib/vapi-signature'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // SECURITY: verify the webhook is genuinely from VAPI before processing.
    // We read the raw body so HMAC signatures are computed over exact bytes.
    const rawBody = await request.text()
    const verification = verifyVapiWebhook(rawBody, request.headers, process.env.VAPI_WEBHOOK_SECRET)
    if (!verification.valid) {
      console.warn('VAPI webhook rejected:', verification.reason)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { message } = body

    console.log('VAPI webhook received:', message?.type)

    switch (message?.type) {
      case 'assistant-request':
        return handleAssistantRequest()
      case 'status-update':
        return handleStatusUpdate(message)
      case 'end-of-call-report':
        return handleEndOfCallReport(message)
      case 'transcript':
        return NextResponse.json({ ok: true })
      case 'function-call':
        return NextResponse.json({ ok: true })
      default:
        return NextResponse.json({ ok: true })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleAssistantRequest() {
  const questions = await prisma.voiceAgentQuestion.findMany({
    orderBy: { order: 'asc' },
  })

  const questionsPrompt = questions.map((q, i) => `${i + 1}. ${q.title}`).join('\n')

  return NextResponse.json({
    assistant: {
      model: {
        provider: 'custom-llm',
        url: 'https://apps.abacus.ai/v1/chat/completions',
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional AI interviewer. Ask these questions:\n${questionsPrompt}\n\nApply the TACIT KNOWLEDGE PROTOCOL: always probe for the WHY behind answers.`,
          },
        ],
      },
      voice: { provider: '11labs', voiceId: 'rachel' },
      transcriber: { provider: 'deepgram', model: 'nova-2', language: 'nl' },
    },
  })
}

async function handleStatusUpdate(message: any) {
  const { call } = message
  if (!call?.id) return NextResponse.json({ ok: true })

  const statusMap: Record<string, string> = {
    queued: 'INITIATED',
    ringing: 'RINGING',
    'in-progress': 'IN_PROGRESS',
    ended: 'COMPLETED',
    failed: 'FAILED',
    'no-answer': 'NO_ANSWER',
  }

  const status = statusMap[call.status] || 'INITIATED'

  await prisma.agentCall.upsert({
    where: { vapiCallId: call.id },
    update: { status: status as any },
    create: {
      vapiCallId: call.id,
      phoneNumber: call.customer?.number || null,
      status: status as any,
      userId: 1, // Default admin user
    },
  })

  return NextResponse.json({ ok: true })
}

async function handleEndOfCallReport(message: any) {
  const { call, transcript, summary, recordingUrl, costBreakdown } = message
  if (!call?.id) return NextResponse.json({ ok: true })

  await prisma.agentCall.upsert({
    where: { vapiCallId: call.id },
    update: {
      status: 'COMPLETED',
      duration: call.duration || null,
      transcript: transcript || null,
      summary: summary || null,
      recordingUrl: recordingUrl || null,
      costBreakdown: costBreakdown || null,
      vapiMetadata: call,
    },
    create: {
      vapiCallId: call.id,
      phoneNumber: call.customer?.number || null,
      status: 'COMPLETED',
      duration: call.duration || null,
      transcript: transcript || null,
      summary: summary || null,
      recordingUrl: recordingUrl || null,
      costBreakdown: costBreakdown || null,
      vapiMetadata: call,
      userId: 1,
    },
  })

  return NextResponse.json({ ok: true })
}
