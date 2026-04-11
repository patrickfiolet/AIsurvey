/**
 * AI Engine for Conversational Surveys — v2.0
 *
 * Enhanced with:
 * - "Waarom-Doorvraag" (Why-Protocol) for tacit knowledge extraction
 * - Decision context, workaround, and exception entity types
 * - Domain-aware prompting based on survey template
 * - Tacit Knowledge Score calculation
 */

import type { AIResponse, ConversationContext, TacitKnowledgeScore } from './types'

const ABACUS_API_URL = 'https://apps.abacus.ai/v1/chat/completions'
const ABACUS_ROUTELLM_URL = 'https://routellm.abacus.ai/v1/chat/completions'

// ============================================================
// Main AI Response Generation
// ============================================================

export async function generateAIResponse(
  userMessage: string,
  context: ConversationContext,
  questionFlow: any[]
): Promise<AIResponse> {
  const currentQuestion = questionFlow[context.currentQuestionIndex]

  if (!currentQuestion) {
    return {
      message: getCompletionMessage(context),
      entities: [],
      progress: 100,
      shouldTransition: false,
    }
  }

  // Build entity summary
  const entitySummary =
    context.extractedEntities.map((e) => `- ${e.type}: ${e.value}`).join('\n') ||
    'No entities extracted yet.'

  // Build answers summary
  const answersSummary =
    context.previousAnswers
      .map((a) => `Q${a.questionIndex + 1}: ${a.question}\nA: ${a.answer}`)
      .join('\n\n') || 'No previous answers yet.'

  // v2.0: Build the enhanced system prompt with Why-Protocol
  const systemPrompt = buildSystemPrompt(context, currentQuestion, answersSummary, entitySummary)

  try {
    const response = await fetch(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const data = await response.json()
    const aiContent = data.choices?.[0]?.message?.content || ''

    // Parse JSON response from AI
    let parsed: any
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: aiContent }
    } catch {
      parsed = { message: aiContent, entities: [], shouldTransition: false }
    }

    const progress = calculateProgress(
      context.currentQuestionIndex,
      questionFlow.length,
      parsed.shouldTransition
    )

    return {
      message: parsed.message || aiContent,
      entities: (parsed.entities || []).map((e: any) => ({
        type: e.type || 'unknown',
        value: e.value || '',
        confidence: e.confidence || 0.8,
        context: userMessage,
        metadata: e.metadata || undefined,
      })),
      progress,
      shouldTransition: parsed.shouldTransition || false,
      nextQuestionIndex: parsed.shouldTransition
        ? context.currentQuestionIndex + 1
        : context.currentQuestionIndex,
    }
  } catch (error) {
    console.error('AI Response generation failed:', error)
    return {
      message: currentQuestion.question,
      entities: [],
      progress: calculateProgress(context.currentQuestionIndex, questionFlow.length, false),
      shouldTransition: false,
    }
  }
}

// ============================================================
// v2.0: Enhanced System Prompt with Why-Protocol
// ============================================================

function buildSystemPrompt(
  context: ConversationContext,
  currentQuestion: any,
  answersSummary: string,
  entitySummary: string
): string {
  const languageName = getLanguageName(context.language)

  // v2.0: Domain-specific context based on template
  const domainContext = getDomainContext(context.templateId)

  return `You are a professional AI consultant conducting an organizational assessment for "${context.surveyTitle}".

CURRENT CONTEXT:
- Respondent: ${context.respondentName}
- Language: ${languageName} (respond in ${languageName})
- Current question (${context.currentQuestionIndex + 1}): ${currentQuestion.question}
- Purpose of this question: ${currentQuestion.purpose}
${domainContext ? `- Domain context: ${domainContext}` : ''}

PREVIOUSLY COLLECTED INFORMATION:
${answersSummary}

EXTRACTED ENTITIES:
${entitySummary}

INSTRUCTIONS:
1. Analyze the respondent's answer to the current question
2. Respond empathetically and professionally in ${languageName}
3. If the answer is incomplete or needs more detail, ask a targeted follow-up question
4. If the answer is complete, make a natural transition to the next question
5. Extract all relevant entities (people, systems, processes, risks, KPIs, departments)
6. Maintain a professional but warm and engaging tone

TACIT KNOWLEDGE PROTOCOL (v2.0 — CRITICAL):
When analyzing each answer, identify if the respondent:
  a) Describes a DECISION → Ask WHY this approach was chosen over alternatives.
     Extract as entity type: "decision_context"
  b) Describes a PROCESS → Ask about EXCEPTIONS: what happens when it goes wrong?
     Extract as entity type: "exception"
  c) Mentions a PERSON → Ask about their UNIQUE KNOWLEDGE that nobody else has.
     Extract as entity type: "person" with metadata about unique skills
  d) Mentions a SYSTEM → Ask about WORKAROUNDS and undocumented configurations.
     Extract as entity type: "workaround"
  e) Describes something routine → Probe for the UNWRITTEN RULES or tribal knowledge.
     Extract as entity type: "decision_context"

Always prioritize extracting the WHY behind answers, not just the WHAT.

FOLLOW-UP SUGGESTIONS FOR THIS QUESTION:
${currentQuestion.followUps?.map((f: string) => `- ${f}`).join('\n') || 'No specific follow-ups.'}

Respond in JSON format:
{
  "message": "Your response to the respondent",
  "entities": [{"type": "system|person|process|risk|kpi|department|decision_context|workaround|exception", "value": "...", "confidence": 0.0-1.0, "metadata": {}}],
  "shouldTransition": true/false,
  "followUpNeeded": true/false
}`
}

// ============================================================
// v2.0: Domain-specific context for templates
// ============================================================

function getDomainContext(templateId?: string): string {
  if (!templateId) return ''

  const domainContexts: Record<string, string> = {
    'sap-knowledge': `Focus on SAP-specific knowledge: custom transactions, ABAP code, configuration decisions, 
module integrations, workarounds for standard processes, and implementation decisions that are not documented.
Pay special attention to: exception logic, custom reports, authorization concepts, and integration points.`,

    'healthcare': `Focus on healthcare-specific knowledge: clinical protocols, patient pathways, 
exception handling in care processes, informal knowledge sharing between specialists, 
and undocumented procedures that ensure quality of care.`,

    'it-operations': `Focus on IT operations knowledge: incident response procedures, 
undocumented system configurations, tribal knowledge about infrastructure, 
monitoring workarounds, and escalation paths that exist only in people's heads.`,

    'government': `Focus on government/public sector knowledge: policy interpretation, 
exception handling in bureaucratic processes, inter-departmental coordination, 
undocumented decision criteria, and institutional knowledge about regulations.`,

    'general-knowledge': `Focus on general organizational knowledge: decision-making processes, 
undocumented procedures, key person dependencies, and institutional memory.`,
  }

  return domainContexts[templateId] || ''
}

// ============================================================
// Entity Extraction
// ============================================================

export async function extractEntitiesWithLLM(
  text: string,
  language: string = 'nl'
): Promise<Array<{ type: string; value: string; confidence: number }>> {
  try {
    const response = await fetch(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `Extract all relevant business entities from the following text.
Categories: person, system, process, risk, kpi, department, technology, tool, decision_context, workaround, exception
- "decision_context": Any explanation of WHY something is done a certain way
- "workaround": Any unofficial/undocumented solution or hack
- "exception": Any case where the standard process does NOT apply
Return as JSON array: [{"type": "category", "value": "entity name", "confidence": 0.0-1.0}]
Only return the JSON array, nothing else.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '[]'

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      return jsonMatch ? JSON.parse(jsonMatch[0]) : []
    } catch {
      return extractEntitiesFromText(text)
    }
  } catch (error) {
    console.error('LLM entity extraction failed:', error)
    return extractEntitiesFromText(text)
  }
}

/** Fallback: regex-based entity extraction */
export function extractEntitiesFromText(
  text: string
): Array<{ type: string; value: string; confidence: number }> {
  const entities: Array<{ type: string; value: string; confidence: number }> = []

  const patterns: Array<{ regex: RegExp; type: string; confidence: number }> = [
    {
      regex:
        /\b(SAP|Microsoft|Oracle|Salesforce|AWS|Azure|Google Cloud|Slack|Teams|Jira|Confluence|ServiceNow|Workday)\b/gi,
      type: 'system',
      confidence: 0.85,
    },
    {
      regex: /\b(IT|HR|Finance|Marketing|Sales|Operations|Legal|R&D|Engineering)\b/gi,
      type: 'department',
      confidence: 0.8,
    },
    {
      regex: /\b(risk|threat|vulnerability|downtime|outage|incident)\b/gi,
      type: 'risk',
      confidence: 0.7,
    },
    {
      regex: /\b(workaround|hack|manual fix|custom script|bypass)\b/gi,
      type: 'workaround',
      confidence: 0.75,
    },
    {
      regex: /\b(exception|special case|edge case|override)\b/gi,
      type: 'exception',
      confidence: 0.75,
    },
  ]

  for (const { regex, type, confidence } of patterns) {
    let match
    while ((match = regex.exec(text)) !== null) {
      entities.push({ type, value: match[0], confidence })
    }
  }

  return entities
}

// ============================================================
// Intelligent Follow-up Generation
// ============================================================

export async function generateIntelligentFollowUp(
  question: string,
  answer: string,
  context: ConversationContext
): Promise<string> {
  try {
    const response = await fetch(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional interviewer specializing in tacit knowledge extraction.
Generate a short, targeted follow-up question that probes for the WHY behind the answer.
Focus on: decision context, exceptions, workarounds, and undocumented knowledge.
Language: ${getLanguageName(context.language)}
Respond only with the follow-up question, no explanation.`,
          },
          {
            role: 'user',
            content: `Question: ${question}\nAnswer: ${answer}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (error) {
    console.error('Follow-up generation failed:', error)
    return ''
  }
}

// ============================================================
// Transition Message Generation
// ============================================================

export async function generateTransitionMessage(
  fromQuestion: string,
  toQuestion: string,
  context: ConversationContext
): Promise<string> {
  try {
    const response = await fetch(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `Create a natural transition from one topic to another in a professional conversation.
Language: ${getLanguageName(context.language)}
Keep it short (1-2 sentences) and professional.`,
          },
          {
            role: 'user',
            content: `From: ${fromQuestion}\nTo: ${toQuestion}\nRespondent name: ${context.respondentName}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 150,
      }),
    })

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (error) {
    return ''
  }
}

// ============================================================
// Streaming Analysis Generation (for admin dashboard)
// ============================================================

export async function generateStreamingAnalysis(
  prompt: string,
  systemPrompt: string
): Promise<ReadableStream> {
  const response = await fetch(ABACUS_ROUTELLM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 4000,
      stream: true,
    }),
  })

  return response.body as ReadableStream
}

// ============================================================
// v2.0: Tacit Knowledge Score Calculation
// ============================================================

export function calculateTacitKnowledgeScore(params: {
  decisionContextCount: number
  workaroundCount: number
  exceptionCount: number
  uniqueEntityCount: number
  totalEntityCount: number
  avgAnswerWordCount: number
  followUpResponseCount: number
  totalFollowUps: number
}): TacitKnowledgeScore {
  const {
    decisionContextCount,
    workaroundCount,
    exceptionCount,
    uniqueEntityCount,
    totalEntityCount,
    avgAnswerWordCount,
    followUpResponseCount,
    totalFollowUps,
  } = params

  // Decision context score (0-30): weighted heavily — this is the core of tacit knowledge
  const decisionContextScore = Math.min(
    30,
    decisionContextCount * 6 + workaroundCount * 5 + exceptionCount * 4
  )

  // Unique insights score (0-25): how many novel entities were identified
  const uniqueRatio = totalEntityCount > 0 ? uniqueEntityCount / totalEntityCount : 0
  const uniqueInsightsScore = Math.min(25, Math.round(uniqueRatio * 25 + uniqueEntityCount * 1.5))

  // Response depth score (0-25): based on average answer length
  const responseDepthScore = Math.min(
    25,
    Math.round((Math.min(avgAnswerWordCount, 100) / 100) * 25)
  )

  // Follow-up effectiveness score (0-20): did follow-ups generate new information?
  const followUpEffectiveness =
    totalFollowUps > 0 ? followUpResponseCount / totalFollowUps : 0
  const followUpEffectivenessScore = Math.min(20, Math.round(followUpEffectiveness * 20))

  const overall = Math.min(
    100,
    decisionContextScore + uniqueInsightsScore + responseDepthScore + followUpEffectivenessScore
  )

  return {
    overall,
    decisionContextScore,
    uniqueInsightsScore,
    responseDepthScore,
    followUpEffectivenessScore,
    domains: [], // populated separately
  }
}

// ============================================================
// Helper Functions
// ============================================================

function calculateProgress(
  currentIndex: number,
  totalQuestions: number,
  isTransitioning: boolean
): number {
  if (totalQuestions === 0) return 0
  const baseProgress = (currentIndex / totalQuestions) * 100
  const transitionBonus = isTransitioning ? (1 / totalQuestions) * 50 : 0
  return Math.min(Math.round(baseProgress + transitionBonus), 100)
}

function getCompletionMessage(context: ConversationContext): string {
  const messages: Record<string, string> = {
    nl: `Heel erg bedankt, ${context.respondentName}! Uw antwoorden zijn zeer waardevol. We hebben alle benodigde informatie verzameld.`,
    en: `Thank you so much, ${context.respondentName}! Your answers are very valuable. We have collected all the information we need.`,
    de: `Vielen Dank, ${context.respondentName}! Ihre Antworten sind sehr wertvoll. Wir haben alle benötigten Informationen gesammelt.`,
    fr: `Merci beaucoup, ${context.respondentName} ! Vos réponses sont très précieuses. Nous avons collecté toutes les informations nécessaires.`,
    es: `¡Muchas gracias, ${context.respondentName}! Sus respuestas son muy valiosas. Hemos recopilado toda la información que necesitamos.`,
    pt: `Muito obrigado, ${context.respondentName}! Suas respostas são muito valiosas. Coletamos todas as informações de que precisamos.`,
    it: `Grazie mille, ${context.respondentName}! Le sue risposte sono molto preziose. Abbiamo raccolto tutte le informazioni di cui abbiamo bisogno.`,
  }
  return messages[context.language] || messages['nl']
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    nl: 'Dutch',
    en: 'English',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    pt: 'Portuguese',
    it: 'Italian',
  }
  return names[code] || 'Dutch'
}
