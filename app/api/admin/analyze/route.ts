/**
 * Consolidated AI Analysis API (Streaming)
 * POST /api/admin/analyze
 *
 * Analyzes data from all three sources: static, conversational, and voice.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const ABACUS_API_URL = 'https://routellm.abacus.ai/v1/chat/completions'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { surveyId, language = 'nl' } = await request.json()

    // Gather all data sources
    const [staticResponses, conversations, agentCalls] = await Promise.all([
      prisma.response.findMany({
        where: { surveyId: parseInt(surveyId) },
        include: { answers: { include: { question: true } } },
      }),
      prisma.conversation.findMany({
        where: { surveyId: parseInt(surveyId) },
        include: { messages: true, entities: true, metadata: true },
      }),
      prisma.agentCall.findMany({
        include: { answers: true },
      }),
    ])

    // Build data summary for AI
    let dataSummary = ''

    if (staticResponses.length > 0) {
      dataSummary += '\n=== STATIC SURVEY RESPONSES ===\n'
      for (const resp of staticResponses) {
        dataSummary += `\nRespondent: ${resp.respondentName}\n`
        for (const answer of resp.answers) {
          dataSummary += `Q: ${answer.question.text}\nA: ${answer.text}\n`
        }
      }
    }

    if (conversations.length > 0) {
      dataSummary += '\n=== CONVERSATIONAL AI CONVERSATIONS ===\n'
      for (const conv of conversations) {
        dataSummary += `\nRespondent: ${conv.respondentName} (Language: ${conv.language})\n`
        dataSummary += `Tacit Knowledge Score: ${conv.metadata?.tacitKnowledgeScore || 'N/A'}\n`
        const userMessages = conv.messages.filter((m) => m.role === 'user')
        for (const msg of userMessages) {
          dataSummary += `A: ${msg.content}\n`
        }
        if (conv.entities.length > 0) {
          dataSummary += `Entities: ${conv.entities.map((e) => `${e.type}:${e.value}`).join(', ')}\n`
        }
      }
    }

    if (agentCalls.length > 0) {
      dataSummary += '\n=== VOICE AGENT CONVERSATIONS ===\n'
      for (const call of agentCalls) {
        dataSummary += `\nCall: ${call.vapiCallId} (Duration: ${call.duration}s)\n`
        if (call.summary) dataSummary += `Summary: ${call.summary}\n`
        for (const answer of call.answers) {
          dataSummary += `Q: ${answer.questionText}\nA: ${answer.answerText}\n`
        }
      }
    }

    if (!dataSummary.trim()) {
      return NextResponse.json({ error: 'No data available for analysis' }, { status: 400 })
    }

    // Stream AI analysis
    const aiResponse = await fetch(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert organizational consultant analyzing survey data.
Language: ${language === 'nl' ? 'Dutch' : language}

Provide a comprehensive analysis including:
1. Executive Summary
2. Key Findings per data source
3. Identified Patterns and Themes
4. Entity Analysis (systems, people, processes, risks)
5. Tacit Knowledge Insights (decision contexts, workarounds, exceptions)
6. Risk Assessment
7. Recommendations
8. Knowledge Graph Summary (entities and their relationships)

Format the output in clear Markdown with headers.`,
          },
          {
            role: 'user',
            content: `Analyze the following survey data:\n${dataSummary}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 4000,
        stream: true,
      }),
    })

    // Return streaming response
    return new NextResponse(aiResponse.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 })
  }
}
