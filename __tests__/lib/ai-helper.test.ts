/**
 * Tests for AI helper functions
 */
import { describe, it, expect } from 'vitest'
import { extractEntitiesFromText, calculateTacitKnowledgeScore } from '@/lib/ai-helper'

describe('extractEntitiesFromText()', () => {
  it('should extract system entities', () => {
    const entities = extractEntitiesFromText('We use SAP and Microsoft Teams')
    expect(entities.some((e) => e.type === 'system' && e.value === 'SAP')).toBe(true)
    expect(entities.some((e) => e.type === 'system' && e.value === 'Microsoft')).toBe(true)
  })

  it('should extract department entities', () => {
    const entities = extractEntitiesFromText('The IT and HR departments need attention')
    expect(entities.some((e) => e.type === 'department' && e.value === 'IT')).toBe(true)
    expect(entities.some((e) => e.type === 'department' && e.value === 'HR')).toBe(true)
  })

  it('should extract workaround entities', () => {
    const entities = extractEntitiesFromText('We use a workaround with a custom script')
    expect(entities.some((e) => e.type === 'workaround')).toBe(true)
  })

  it('should return empty for unrelated text', () => {
    const entities = extractEntitiesFromText('The weather is nice today')
    expect(entities).toHaveLength(0)
  })
})

describe('calculateTacitKnowledgeScore()', () => {
  it('should return 0 for empty data', () => {
    const score = calculateTacitKnowledgeScore({
      decisionContextCount: 0,
      workaroundCount: 0,
      exceptionCount: 0,
      uniqueEntityCount: 0,
      totalEntityCount: 0,
      avgAnswerWordCount: 0,
      followUpResponseCount: 0,
      totalFollowUps: 0,
    })
    expect(score.overall).toBe(0)
  })

  it('should score higher with more decision contexts', () => {
    const lowScore = calculateTacitKnowledgeScore({
      decisionContextCount: 1,
      workaroundCount: 0,
      exceptionCount: 0,
      uniqueEntityCount: 2,
      totalEntityCount: 5,
      avgAnswerWordCount: 20,
      followUpResponseCount: 1,
      totalFollowUps: 2,
    })

    const highScore = calculateTacitKnowledgeScore({
      decisionContextCount: 5,
      workaroundCount: 3,
      exceptionCount: 2,
      uniqueEntityCount: 15,
      totalEntityCount: 20,
      avgAnswerWordCount: 60,
      followUpResponseCount: 5,
      totalFollowUps: 5,
    })

    expect(highScore.overall).toBeGreaterThan(lowScore.overall)
  })

  it('should cap at 100', () => {
    const score = calculateTacitKnowledgeScore({
      decisionContextCount: 100,
      workaroundCount: 100,
      exceptionCount: 100,
      uniqueEntityCount: 100,
      totalEntityCount: 100,
      avgAnswerWordCount: 500,
      followUpResponseCount: 100,
      totalFollowUps: 100,
    })
    expect(score.overall).toBeLessThanOrEqual(100)
  })
})
