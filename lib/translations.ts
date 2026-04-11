/**
 * Dynamic Translations — Database + AI Translation Layer
 * Layer 2 of the multilingual system.
 */

import { prisma } from './db'
import crypto from 'crypto'

const ABACUS_API_URL = 'https://apps.abacus.ai/v1/chat/completions'

/** Get translated survey fields from admin-managed translations */
export async function getTranslatedSurvey(survey: any, language: string) {
  if (language === 'nl') return survey

  const translationRecords = await prisma.translation.findMany({
    where: {
      entityType: { startsWith: 'survey_' },
      entityId: survey.id,
      language,
    },
  })

  const translationMap = new Map(translationRecords.map((t) => [t.field, t.value]))

  return {
    ...survey,
    title: translationMap.get('title') || survey.title,
    description: translationMap.get('description') || survey.description,
    welcomeText: translationMap.get('welcomeText') || survey.welcomeText,
    thankYouText: translationMap.get('thankYouText') || survey.thankYouText,
  }
}

/** Get translated questions */
export async function getTranslatedQuestions(questions: any[], language: string) {
  if (language === 'nl') return questions

  const questionIds = questions.map((q) => q.id)
  const translationRecords = await prisma.translation.findMany({
    where: {
      entityType: 'question_text',
      entityId: { in: questionIds },
      language,
    },
  })

  const translationMap = new Map(translationRecords.map((t) => [t.entityId, t.value]))

  return questions.map((q) => ({
    ...q,
    text: translationMap.get(q.id) || q.text,
  }))
}

/** Translate dynamic content with MD5 cache */
export async function translateDynamicContent(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'nl'
): Promise<{ translatedText: string; cached: boolean }> {
  if (targetLanguage === sourceLanguage) {
    return { translatedText: text, cached: false }
  }

  const sourceHash = crypto.createHash('md5').update(text).digest('hex')

  // Check cache
  const cached = await prisma.dynamicTranslationCache.findUnique({
    where: {
      sourceHash_targetLanguage: {
        sourceHash,
        targetLanguage,
      },
    },
  })

  if (cached) {
    return { translatedText: cached.translatedText, cached: true }
  }

  // AI translation
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
            content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Maintain the original formatting, including Markdown. Only return the translation, no explanation.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    const data = await response.json()
    const translatedText = data.choices?.[0]?.message?.content || text

    // Cache the translation
    await prisma.dynamicTranslationCache.create({
      data: {
        sourceText: text,
        sourceLanguage,
        sourceHash,
        targetLanguage,
        translatedText,
      },
    })

    return { translatedText, cached: false }
  } catch (error) {
    console.error('Translation failed:', error)
    return { translatedText: text, cached: false }
  }
}
