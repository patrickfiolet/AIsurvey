const API_URL = 'https://apps.abacus.ai/v1/chat/completions'

const MAX_QUESTIONS_PER_TURN = 2
const MAX_RESPONSE_CHARS = 700
const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS ?? 30000)

export async function callLLM(messages: any[], options?: { model?: string; stream?: boolean; maxTokens?: number; responseFormat?: any }) {
  const apiKey = process.env.ABACUSAI_API_KEY
  if (!apiKey) throw new Error('ABACUSAI_API_KEY not configured')

  const body: any = {
    model: options?.model ?? 'gpt-4.1-mini',
    messages,
    stream: options?.stream ?? false,
    max_tokens: options?.maxTokens ?? 3000,
  }
  if (options?.responseFormat) body.response_format = options.responseFormat

  // Guard against a hanging upstream AI API with an abortable timeout.
  const controller = new AbortController()
  const timeoutMs = LLM_TIMEOUT_MS
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`LLM API request timed out after ${timeoutMs}ms`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }

  if (!response?.ok) {
    const errText = await response?.text?.() ?? 'Unknown error'
    throw new Error(`LLM API error: ${response?.status} - ${errText}`)
  }

  if (options?.stream) return response

  const data = await response?.json?.()
  return data?.choices?.[0]?.message?.content ?? ''
}

function countQuestions(text: string): number {
  return (text?.match?.(/\?/g) ?? []).length
}

function removeRepetitiveCourtesy(text: string): string {
  return (text ?? '')
    .replace(/dank(?:\s+u|jewel)?\s+voor\s+uw\s+eerlijkheid[.!]?/gi, 'Helder.')
    .replace(/bedankt\s+voor\s+uw\s+eerlijkheid[.!]?/gi, 'Helder.')
    .replace(/thank\s+you\s+for\s+your\s+honesty[.!]?/gi, 'Clear, thanks.')
    .replace(/hartelijk\s+dank\s+voor\s+uw\s+openheid[.!]?/gi, 'Goed om te horen.')
    .replace(/bedankt\s+voor\s+het\s+delen[.!]?/gi, 'Duidelijk.')
    .trim()
}

function trimToSentenceBoundary(text: string, maxChars: number): string {
  if ((text?.length ?? 0) <= maxChars) return text
  const chunk = (text ?? '').slice(0, maxChars)
  const lastPunctuation = Math.max(chunk.lastIndexOf('.'), chunk.lastIndexOf('?'), chunk.lastIndexOf('!'))
  return (lastPunctuation > 80 ? chunk.slice(0, lastPunctuation + 1) : chunk).trim()
}

function dedupeRepeatedSentences(text: string): string {
  const parts = (text ?? '').split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter(Boolean)
  const seen = new Set<string>()
  const kept: string[] = []
  for (const part of parts) {
    const normalized = part.toLowerCase()
    if (seen.has(normalized)) continue
    seen.add(normalized)
    kept.push(part)
  }
  return kept.join(' ').trim()
}

function enforceQuestionLimit(text: string, maxQuestions = MAX_QUESTIONS_PER_TURN): string {
  const parts = (text ?? '').split(/(?<=[.!?])\s+/)
  let questions = 0
  const kept: string[] = []

  for (const part of parts) {
    const questionCountInPart = countQuestions(part)
    if (questions >= maxQuestions && questionCountInPart > 0) continue
    if (questions + questionCountInPart > maxQuestions) continue
    kept.push(part)
    questions += questionCountInPart
  }

  const result = kept.join(' ').trim()
  return result || trimToSentenceBoundary(text ?? '', MAX_RESPONSE_CHARS)
}

export function enforceConversationalConstraints(text: string): string {
  const withoutRepetitiveCourtesy = removeRepetitiveCourtesy(text)
  const deduped = dedupeRepeatedSentences(withoutRepetitiveCourtesy)
  const maxLength = trimToSentenceBoundary(deduped, MAX_RESPONSE_CHARS)
  return enforceQuestionLimit(maxLength, MAX_QUESTIONS_PER_TURN)
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text?.trim?.()) return text ?? ''
  const langNames: Record<string, string> = {
    nl: 'Dutch', de: 'German', en: 'English', fr: 'French', es: 'Spanish', pt: 'Portuguese', it: 'Italian'
  }
  const langName = langNames?.[targetLang] ?? 'English'
  const result = await callLLM([
    { role: 'system', content: `You are a professional translator. Translate the following text to ${langName}. Return only the translation, nothing else.` },
    { role: 'user', content: text }
  ])
  return typeof result === 'string' ? result : text
}

export async function generateConversationResponse(context: string, userMessage: string, language: string, nextQuestionHint?: string): Promise<string> {
  const langNames: Record<string, string> = {
    nl: 'Dutch', de: 'German', en: 'English', fr: 'French', es: 'Spanish', pt: 'Portuguese', it: 'Italian'
  }
  const hintInstruction = nextQuestionHint?.trim?.()
    ? `If relevant, include this canonical next survey question (exactly once): "${nextQuestionHint}"`
    : 'If relevant, ask one clear follow-up question.'

  const result = await callLLM([
    {
      role: 'system',
      content: `You are a friendly, professional AI interviewer conducting a knowledge transfer survey.
Always respond in ${langNames?.[language] ?? 'Dutch'}.
Stel per conversatiebeurt maximaal 1-2 vragen. Houd je antwoorden kort en gefocust.
Avoid repetitive courtesy phrases (e.g. repeated thanks for honesty/openess). Vary your tone naturally.
Use this structure: 1 short reflection + max 1-2 targeted questions.
${hintInstruction}

Context:
${context}`
    },
    { role: 'user', content: userMessage }
  ])

  const raw = typeof result === 'string' ? result : ''
  return enforceConversationalConstraints(raw)
}

export async function generateAIAnalysis(data: string): Promise<string> {
  const result = await callLLM([
    { role: 'system', content: 'Je bent een expert AI-analist die surveyresultaten analyseert. Geef een uitgebreide analyse in het Nederlands met: 1) Belangrijkste thema\'s, 2) Patronen en trends, 3) Problemen en uitdagingen, 4) Best practices gevonden, 5) Kennislacunes, 6) Aanbevelingen. Gebruik JSON formaat.' },
    { role: 'user', content: `Analyseer de volgende surveydata:\n\n${data}` }
  ], { model: 'gpt-4o', maxTokens: 4000, responseFormat: { type: 'json_object' } })
  return typeof result === 'string' ? result : '{}'
}

export async function generateQuestionsAI(topic: string, count: number, language: string): Promise<string[]> {
  const langNames: Record<string, string> = {
    nl: 'Dutch', de: 'German', en: 'English', fr: 'French', es: 'Spanish', pt: 'Portuguese', it: 'Italian'
  }
  const result = await callLLM([
    { role: 'system', content: `Generate exactly ${count} survey questions in ${langNames?.[language] ?? 'Dutch'} about the given topic. Return a JSON object with a "questions" array of strings. Questions should be open-ended, professional, and suitable for organizational surveys.` },
    { role: 'user', content: `Topic: ${topic}` }
  ], { responseFormat: { type: 'json_object' } })
  try {
    const parsed = JSON.parse(typeof result === 'string' ? result : '{}')
    return Array.isArray(parsed?.questions) ? parsed.questions : []
  } catch {
    return []
  }
}

// ============================================================
// Entity extraction & tacit-knowledge scoring (v3.0)
// ============================================================

export type EntityType =
  | 'system'
  | 'department'
  | 'person'
  | 'process'
  | 'workaround'
  | 'decision_context'
  | 'exception'
  | 'risk'

export interface ExtractedEntity {
  type: EntityType
  value: string
}

// Keyword dictionaries used by the lightweight, deterministic extractor.
// This is a heuristic fallback; the LLM-based extractor is used in production
// flows, but this keeps entity extraction testable and dependency-free.
const SYSTEM_KEYWORDS = [
  'SAP', 'Microsoft', 'Teams', 'Office 365', 'Microsoft 365', 'Salesforce',
  'Oracle', 'Workday', 'ServiceNow', 'Jira', 'Confluence', 'SharePoint',
  'Azure', 'AWS', 'Slack', 'Excel', 'Outlook',
]

const DEPARTMENT_KEYWORDS = [
  'IT', 'HR', 'Finance', 'Legal', 'Sales', 'Marketing', 'Operations',
  'Procurement', 'Support', 'Engineering', 'Compliance',
]

const WORKAROUND_KEYWORDS = [
  'workaround', 'custom script', 'manual step', 'hack', 'temporary fix',
  'quick fix', 'work-around',
]

const DECISION_KEYWORDS = [
  'decided', 'decision', 'because', 'reasoning', 'chose', 'trade-off',
  'tradeoff', 'we opted',
]

const EXCEPTION_KEYWORDS = [
  'exception', 'edge case', 'special case', 'unless', 'only when', 'fails when',
]

const RISK_KEYWORDS = [
  'risk', 'single point of failure', 'if they leave', 'lost knowledge',
  'no backup', 'critical dependency',
]

function matchKeywords(text: string, keywords: string[], type: EntityType): ExtractedEntity[] {
  const found: ExtractedEntity[] = []
  const seen = new Set<string>()
  for (const kw of keywords) {
    // Word-boundary, case-insensitive match. Escape regex-special chars.
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`\\b${escaped}\\b`, 'i')
    if (re.test(text) && !seen.has(kw.toLowerCase())) {
      seen.add(kw.toLowerCase())
      found.push({ type, value: kw })
    }
  }
  return found
}

/**
 * Deterministic, keyword-based entity extractor. Returns the tacit-knowledge
 * relevant entities detected in a piece of text. Unrelated text yields [].
 */
export function extractEntitiesFromText(text: string): ExtractedEntity[] {
  const input = text ?? ''
  if (input.trim().length === 0) return []

  return [
    ...matchKeywords(input, SYSTEM_KEYWORDS, 'system'),
    ...matchKeywords(input, DEPARTMENT_KEYWORDS, 'department'),
    ...matchKeywords(input, WORKAROUND_KEYWORDS, 'workaround'),
    ...matchKeywords(input, DECISION_KEYWORDS, 'decision_context'),
    ...matchKeywords(input, EXCEPTION_KEYWORDS, 'exception'),
    ...matchKeywords(input, RISK_KEYWORDS, 'risk'),
  ]
}

export interface TacitKnowledgeInput {
  decisionContextCount: number
  workaroundCount: number
  exceptionCount: number
  uniqueEntityCount: number
  totalEntityCount: number
  avgAnswerWordCount: number
  followUpResponseCount: number
  totalFollowUps: number
}

export interface TacitKnowledgeScore {
  overall: number
  decisionContext: number
  workarounds: number
  exceptions: number
  entityRichness: number
  depth: number
  engagement: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Computes a 0-100 "tacit knowledge" score from aggregated conversation
 * signals. The score rewards captured decision context, workarounds,
 * exceptions, entity richness, answer depth and follow-up engagement.
 */
export function calculateTacitKnowledgeScore(input: TacitKnowledgeInput): TacitKnowledgeScore {
  const {
    decisionContextCount = 0,
    workaroundCount = 0,
    exceptionCount = 0,
    uniqueEntityCount = 0,
    totalEntityCount = 0,
    avgAnswerWordCount = 0,
    followUpResponseCount = 0,
    totalFollowUps = 0,
  } = input ?? ({} as TacitKnowledgeInput)

  // Each sub-score is normalized to its own 0-100 range, then weighted.
  const decisionContext = clamp((decisionContextCount / 5) * 100, 0, 100)
  const workarounds = clamp((workaroundCount / 3) * 100, 0, 100)
  const exceptions = clamp((exceptionCount / 3) * 100, 0, 100)
  const entityRichness = clamp((uniqueEntityCount / 12) * 100, 0, 100)
  const depth = clamp((avgAnswerWordCount / 50) * 100, 0, 100)
  const engagement =
    totalFollowUps > 0
      ? clamp((followUpResponseCount / totalFollowUps) * 100, 0, 100)
      : 0

  const weights = {
    decisionContext: 0.25,
    workarounds: 0.2,
    exceptions: 0.15,
    entityRichness: 0.15,
    depth: 0.15,
    engagement: 0.1,
  }

  const overall = clamp(
    Math.round(
      decisionContext * weights.decisionContext +
        workarounds * weights.workarounds +
        exceptions * weights.exceptions +
        entityRichness * weights.entityRichness +
        depth * weights.depth +
        engagement * weights.engagement
    ),
    0,
    100
  )

  return {
    overall,
    decisionContext: Math.round(decisionContext),
    workarounds: Math.round(workarounds),
    exceptions: Math.round(exceptions),
    entityRichness: Math.round(entityRichness),
    depth: Math.round(depth),
    engagement: Math.round(engagement),
  }
}
