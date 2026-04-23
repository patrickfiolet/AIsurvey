export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateConversationResponse } from '@/lib/ai-helper'
import { questionFlow, getNextPhase } from '@/lib/question-flow'

function getPhaseIndex(phase: string): number {
  return Math.max(0, questionFlow.findIndex((q: any) => q?.phase === phase))
}

function getProgressFromPhase(phase: string, completed = false): number {
  if (completed) return 100
  const total = Math.max(1, questionFlow.length)
  const idx = getPhaseIndex(phase)
  return Math.min(99, Math.round(((idx + 1) / total) * 100))
}

async function upsertPartialResponse(params: {
  conversationId: number
  surveyId: number
  respondentName?: string | null
  respondentEmail?: string | null
  userMessage: string
  phase: string
  completed?: boolean
}) {
  const completed = params.completed === true
  const progressPercent = getProgressFromPhase(params.phase, completed)

  const response = await prisma.response.upsert({
    where: { conversationId: params.conversationId },
    create: {
      surveyId: params.surveyId,
      respondentName: params.respondentName ?? null,
      respondentEmail: params.respondentEmail ?? null,
      conversationId: params.conversationId,
      isCompleted: completed,
      status: completed ? 'COMPLETED' : 'IN_PROGRESS',
      lastAnsweredPhase: params.phase,
      progressPercent,
    },
    update: {
      respondentName: params.respondentName ?? null,
      respondentEmail: params.respondentEmail ?? null,
      isCompleted: completed,
      status: completed ? 'COMPLETED' : 'IN_PROGRESS',
      lastAnsweredPhase: params.phase,
      progressPercent,
    },
  })

  const surveyQuestions = await prisma.question.findMany({
    where: { surveyId: params.surveyId },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  })

  const fallbackIndex = Math.max(0, Math.min(getPhaseIndex(params.phase), Math.max(0, surveyQuestions.length - 1)))
  const mappedQuestion = surveyQuestions[fallbackIndex]

  if (mappedQuestion && params.userMessage?.trim?.()) {
    const existing = await prisma.answer.findFirst({
      where: { responseId: response.id, questionId: mappedQuestion.id },
      orderBy: { id: 'desc' },
    })

    if (existing) {
      await prisma.answer.update({
        where: { id: existing.id },
        data: { textValue: params.userMessage },
      })
    } else {
      await prisma.answer.create({
        data: {
          responseId: response.id,
          questionId: mappedQuestion.id,
          textValue: params.userMessage,
        },
      })
    }
  }

  return response
}

export async function POST(req: NextRequest) {
  try {
    const body = await req?.json?.()
    const { action, surveyId, conversationId, message, respondentName, respondentEmail, language } = body ?? {}

    if (action === 'start') {
      const conv = await prisma.conversation.create({
        data: {
          surveyId: surveyId ?? 1,
          respondentName: respondentName ?? null,
          respondentEmail: respondentEmail ?? null,
          currentPhase: 'opening',
        }
      })

      await prisma.response.create({
        data: {
          surveyId: conv.surveyId,
          respondentName: respondentName ?? null,
          respondentEmail: respondentEmail ?? null,
          isCompleted: false,
          status: 'IN_PROGRESS',
          progressPercent: 0,
          lastAnsweredPhase: 'opening',
          conversationId: conv.id,
        }
      })

      const firstQ = questionFlow?.[0]?.question ?? 'Welkom! Vertel eens over uzelf.'
      await prisma.conversationMessage.create({ data: { conversationId: conv?.id, role: 'AI', content: firstQ, questionPhase: 'opening' } })
      return NextResponse.json({ conversationId: conv?.id, message: firstQ, isCompleted: false, resumed: false })
    }

    if (action === 'resume') {
      let conv = null as any
      const parsedConversationId = Number(conversationId)
      const parsedSurveyId = Number(surveyId || 1)

      if (parsedConversationId) {
        conv = await prisma.conversation.findFirst({
          where: { id: parsedConversationId, surveyId: parsedSurveyId },
          include: { messages: { orderBy: { createdAt: 'asc' } }, response: true },
        })
      }

      if (!conv) {
        conv = await prisma.conversation.findFirst({
          where: {
            surveyId: parsedSurveyId,
            isCompleted: false,
            ...(respondentEmail ? { respondentEmail } : {}),
            ...(respondentName ? { respondentName } : {}),
          },
          include: { messages: { orderBy: { createdAt: 'asc' } }, response: true },
          orderBy: { updatedAt: 'desc' },
        })
      }

      if (!conv) {
        return NextResponse.json({ conversationId: null, messages: [], isCompleted: false, resumed: false })
      }

      return NextResponse.json({
        conversationId: conv.id,
        isCompleted: conv.isCompleted,
        resumed: true,
        currentPhase: conv.currentPhase,
        progressPercent: conv?.response?.progressPercent ?? 0,
        messages: (conv?.messages ?? []).map((m: any) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
      })
    }

    if (action === 'message' && conversationId) {
      const cleanedMessage = (message ?? '').trim()
      if (!cleanedMessage) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

      const conv = await prisma.conversation.findUnique({
        where: { id: Number(conversationId) },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })

      if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

      const phase = conv?.currentPhase ?? 'opening'
      await prisma.conversationMessage.create({ data: { conversationId: conv.id, role: 'USER', content: cleanedMessage, questionPhase: phase } })

      await upsertPartialResponse({
        conversationId: conv.id,
        surveyId: conv.surveyId,
        respondentName: conv.respondentName,
        respondentEmail: conv.respondentEmail,
        userMessage: cleanedMessage,
        phase,
        completed: false,
      })

      const refreshedMessages = await prisma.conversationMessage.findMany({
        where: { conversationId: conv.id },
        orderBy: { createdAt: 'asc' },
      })

      const nextPhase = getNextPhase(phase)
      const context = (refreshedMessages ?? []).map((m: any) => `${m?.role}: ${m?.content}`).join('\n')

      if (!nextPhase) {
        const closingMessage = language === 'nl'
          ? 'We ronden het gesprek hier af. Je input is opgeslagen en je kunt later altijd terugkomen op eerdere punten.'
          : 'We can wrap up here. Your input has been saved, and you can return later if needed.'

        await prisma.conversation.update({ where: { id: conv.id }, data: { isCompleted: true, currentPhase: 'completed' } })
        await prisma.conversationMessage.create({ data: { conversationId: conv.id, role: 'AI', content: closingMessage, questionPhase: 'closing' } })
        const finalResponse = await upsertPartialResponse({
          conversationId: conv.id,
          surveyId: conv.surveyId,
          respondentName: conv.respondentName,
          respondentEmail: conv.respondentEmail,
          userMessage: cleanedMessage,
          phase,
          completed: true,
        })

        return NextResponse.json({ message: closingMessage, isCompleted: true, progressPercent: finalResponse.progressPercent })
      }

      const nextQ = questionFlow?.find?.((q: any) => q?.phase === nextPhase)
      const aiResponse = await generateConversationResponse(context, cleanedMessage, language ?? 'nl', nextQ?.question)

      await prisma.conversation.update({ where: { id: conv.id }, data: { currentPhase: nextPhase } })
      await prisma.conversationMessage.create({ data: { conversationId: conv.id, role: 'AI', content: aiResponse, questionPhase: nextPhase } })

      const updatedResponse = await prisma.response.findUnique({ where: { conversationId: conv.id } })
      return NextResponse.json({ message: aiResponse, isCompleted: false, progressPercent: updatedResponse?.progressPercent ?? 0 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 })
  }
}
