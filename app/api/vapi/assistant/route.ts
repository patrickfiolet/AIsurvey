/**
 * VAPI Assistant Configuration
 * POST /api/vapi/assistant
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest) {
  try {
    const questions = await prisma.voiceAgentQuestion.findMany({
      orderBy: { order: 'asc' },
    })

    const questionsPrompt = questions.map((q, i) => `${i + 1}. ${q.title}`).join('\n')

    const assistantConfig = {
      name: 'AI Survey Assistant',
      model: {
        provider: 'custom-llm',
        url: 'https://apps.abacus.ai/v1/chat/completions',
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional AI consultant from aisurvey.me conducting an organizational assessment via phone.

INSTRUCTIONS:
- Ask the following questions in order
- Wait for an answer before asking the next question
- Ask follow-up questions if the answer is not detailed enough
- Apply the TACIT KNOWLEDGE PROTOCOL: always ask WHY behind decisions, exceptions, and workarounds
- Be professional but friendly
- Speak Dutch
- Summarize the conversation briefly at the end

QUESTIONS:
${questionsPrompt}

Start the conversation with a brief introduction and then ask the first question.`,
          },
        ],
      },
      voice: { provider: '11labs', voiceId: 'rachel' },
      transcriber: { provider: 'deepgram', model: 'nova-2', language: 'nl' },
      firstMessage:
        'Goedendag! Ik ben de AI-assistent van aisurvey.me. Ik ga u een aantal vragen stellen over uw organisatie. Zullen we beginnen?',
      serverUrl: `${process.env.NEXTAUTH_URL}/api/vapi/webhook`,
      serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET,
    }

    return NextResponse.json(assistantConfig)
  } catch (error) {
    console.error('Assistant config error:', error)
    return NextResponse.json({ error: 'Failed to get assistant config' }, { status: 500 })
  }
}
