/**
 * Conversational Survey API — v2.0
 * POST /api/conversation
 *
 * Actions: start, respond, get_history
 * Enhanced with tacit knowledge protocol and domain template support.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateAIResponse, extractEntitiesWithLLM, calculateTacitKnowledgeScore } from '@/lib/ai-helper'
import {
  defaultQuestionFlow,
  analyzeResponseQuality,
  shouldProbe,
  getQuestionFlowForTemplate,
} from '@/lib/question-flow'
import { processEntitiesToGraph } from '@/lib/knowledge-graph'
import { publishEvent } from '@/lib/knowledge-os-integration'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'start':
        return handleStart(body)
      case 'respond':
        return handleRespond(body)
      case 'get_history':
        return handleGetHistory(body)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Conversation error:', error)
    return NextResponse.json({ error: 'Failed to process conversation' }, { status: 500 })
  }
}

async function handleStart(body: any) {
  const { surveyId, respondentName, language = 'nl', expertProfileId } = body

  const survey = await prisma.survey.findUnique({
    where: { id: parseInt(surveyId) },
  })

  if (!survey || !survey.isActive) {
    return NextResponse.json({ error: 'Survey not found or inactive' }, { status: 404 })
  }

  // Get template-specific question flow
  const questionFlow = getQuestionFlowForTemplate(survey.templateId)

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      surveyId: parseInt(surveyId),
      respondentName: respondentName || 'Anonymous',
      language,
      currentQuestion: 0,
      expertProfileId: expertProfileId ? parseInt(expertProfileId) : null,
    },
  })

  // Create metadata
  await prisma.conversationMetadata.create({
    data: { conversationId: conversation.id },
  })

  const firstQuestion = questionFlow[0]
  const welcomeMessage = `${survey.welcomeText}\n\n${firstQuestion.question}`

  // Save welcome message
  await prisma.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'assistant',
      content: welcomeMessage,
      questionIndex: 0,
    },
  })

  return NextResponse.json({
    conversationId: conversation.id,
    message: welcomeMessage,
    progress: 0,
    currentQuestion: 0,
    isCompleted: false,
    templateId: survey.templateId,
  })
}

async function handleRespond(body: any) {
  const { conversationId, message } = body

  const conversation = await prisma.conversation.findUnique({
    where: { id: parseInt(conversationId) },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      entities: true,
      metadata: true,
      survey: true,
    },
  })

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  if (conversation.isCompleted) {
    return NextResponse.json({ error: 'Conversation already completed' }, { status: 400 })
  }

  // Get template-specific question flow
  const questionFlow = getQuestionFlowForTemplate(conversation.survey.templateId)

  // Save user message
  await prisma.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: message,
      questionIndex: conversation.currentQuestion,
    },
  })

  // Build context
  const previousAnswers = conversation.messages
    .filter((m) => m.role === 'user')
    .map((m, i) => ({
      questionIndex: m.questionIndex || i,
      question: questionFlow[m.questionIndex || i]?.question || '',
      answer: m.content,
    }))

  const context = {
    respondentName: conversation.respondentName,
    currentQuestionIndex: conversation.currentQuestion,
    previousAnswers,
    extractedEntities: conversation.entities.map((e) => ({
      type: e.type,
      value: e.value,
    })),
    language: conversation.language,
    surveyTitle: conversation.survey.title,
    templateId: conversation.survey.templateId || undefined,
  }

  // Generate AI response
  const aiResponse = await generateAIResponse(message, context, questionFlow)

  // Extract entities (enhanced with v2.0 types)
  const entities = await extractEntitiesWithLLM(message, conversation.language)

  // Save entities
  for (const entity of entities) {
    await prisma.extractedEntity.create({
      data: {
        conversationId: conversation.id,
        type: entity.type,
        value: entity.value,
        confidence: entity.confidence,
        context: message,
        questionIndex: conversation.currentQuestion,
      },
    })
  }

  // v2.0: Process entities into knowledge graph
  try {
    await processEntitiesToGraph(
      entities,
      conversation.survey.templateId || undefined,
      conversation.expertProfileId || undefined
    )
  } catch (error) {
    console.error('Knowledge graph processing error:', error)
  }

  // Update question index
  const newQuestionIndex = aiResponse.shouldTransition
    ? conversation.currentQuestion + 1
    : conversation.currentQuestion

  const isCompleted = newQuestionIndex >= questionFlow.length

  // Save AI response
  await prisma.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'assistant',
      content: aiResponse.message,
      questionIndex: newQuestionIndex,
    },
  })

  // Update conversation
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      currentQuestion: newQuestionIndex,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  })

  // v2.0: Update metadata with tacit knowledge score when completed
  if (isCompleted && conversation.metadata) {
    const allEntities = await prisma.extractedEntity.findMany({
      where: { conversationId: conversation.id },
    })

    const decisionContextCount = allEntities.filter(
      (e) => e.type === 'decision_context'
    ).length
    const workaroundCount = allEntities.filter((e) => e.type === 'workaround').length
    const exceptionCount = allEntities.filter((e) => e.type === 'exception').length

    const allUserMessages = conversation.messages.filter((m) => m.role === 'user')
    const avgWordCount =
      allUserMessages.reduce((sum, m) => sum + m.content.split(/\s+/).length, 0) /
      Math.max(allUserMessages.length, 1)

    const tacitScore = calculateTacitKnowledgeScore({
      decisionContextCount,
      workaroundCount,
      exceptionCount,
      uniqueEntityCount: new Set(allEntities.map((e) => `${e.type}:${e.value}`)).size,
      totalEntityCount: allEntities.length,
      avgAnswerWordCount: avgWordCount,
      followUpResponseCount: allUserMessages.length - questionFlow.length,
      totalFollowUps: Math.max(0, allUserMessages.length - questionFlow.length),
    })

    const domains = [...new Set(allEntities.map((e) => e.type))]

    await prisma.conversationMetadata.update({
      where: { id: conversation.metadata.id },
      data: {
        completionScore: 100,
        tacitKnowledgeScore: tacitScore.overall,
        knowledgeDomains: domains,
        uniqueInsightsCount: tacitScore.uniqueInsightsScore,
        decisionContextCount,
        workaroundCount,
        exceptionCount,
        summary: `Conversation completed with ${conversation.respondentName}`,
      },
    })

    // v2.0: Publish knowledge extraction event
    await publishEvent('knowledge.extracted', {
      conversationId: conversation.id,
      surveyId: conversation.surveyId,
      tacitKnowledgeScore: tacitScore.overall,
      entityCount: allEntities.length,
      domains,
    })
  }

  return NextResponse.json({
    message: aiResponse.message,
    progress: aiResponse.progress,
    currentQuestion: newQuestionIndex,
    isCompleted,
    entities: entities.map((e) => ({
      type: e.type,
      value: e.value,
      confidence: e.confidence,
    })),
  })
}

async function handleGetHistory(body: any) {
  const { conversationId } = body

  const conversation = await prisma.conversation.findUnique({
    where: { id: parseInt(conversationId) },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      entities: true,
      metadata: true,
    },
  })

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  return NextResponse.json({ conversation })
}
