/**
 * Free AI Prompt on Survey Data
 * POST /api/admin/free-prompt
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ABACUS_API_URL = 'https://routellm.abacus.ai/v1/chat/completions'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { prompt, surveyId, language = 'nl' } = await request.json()

    // Gather data context
    const conversations = await prisma.conversation.findMany({
      where: surveyId ? { surveyId: parseInt(surveyId) } : {},
      include: { messages: true, extractedEntities: true, metadata: true },
    })

    const context = conversations
      .map((c) => {
        const msgs = c.messages
          .filter((m) => m.role === 'USER')
          .map((m) => m.content)
          .join('\n')
        const ents = c.extractedEntities
          .map((e) => `${e.entityType}: ${e.entityValue}`)
          .join(', ')
        const tacitScore =
          c.metadata.find((m) => m.metadataKey === 'tacitKnowledgeScore')?.metadataValue ?? 'N/A'
        return `Respondent: ${c.respondentName}\n${msgs}\nEntities: ${ents}\nTacit Score: ${tacitScore}`
      })
      .join('\n---\n')

    const response = await fetch(ABACUS_API_URL, {
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
            content: `You are an expert data analyst. Answer the user's question based on the survey data provided. Respond in ${language === 'nl' ? 'Dutch' : language}.`,
          },
          {
            role: 'user',
            content: `Survey data context:\n${context}\n\nUser question: ${prompt}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    })

    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content || 'No response generated'

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('Free prompt error:', error)
    return NextResponse.json({ error: 'Failed to process prompt' }, { status: 500 })
  }
}
