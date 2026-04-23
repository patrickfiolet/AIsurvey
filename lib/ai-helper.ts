const API_URL = 'https://apps.abacus.ai/v1/chat/completions'

const MAX_QUESTIONS_PER_TURN = 2
const MAX_RESPONSE_CHARS = 700

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

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })

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
