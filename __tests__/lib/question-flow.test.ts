/**
 * Tests for question flow engine
 */
import { describe, it, expect } from 'vitest'
import {
  defaultQuestionFlow,
  analyzeResponseQuality,
  shouldProbe,
  availableTemplates,
} from '@/lib/question-flow'

describe('defaultQuestionFlow', () => {
  it('should have 10 questions', () => {
    expect(defaultQuestionFlow).toHaveLength(10)
  })

  it('should have required fields for each question', () => {
    for (const q of defaultQuestionFlow) {
      expect(q).toHaveProperty('id')
      expect(q).toHaveProperty('question')
      expect(q).toHaveProperty('purpose')
      expect(q).toHaveProperty('category')
      expect(q).toHaveProperty('followUps')
      expect(q).toHaveProperty('expectedEntities')
      expect(q.followUps.length).toBeGreaterThan(0)
    }
  })
})

describe('analyzeResponseQuality()', () => {
  const testQuestion = defaultQuestionFlow[0]

  it('should return low for very short answers', () => {
    const result = analyzeResponseQuality('yes', testQuestion)
    expect(result.quality).toBe('low')
  })

  it('should return medium for moderate answers', () => {
    const result = analyzeResponseQuality(
      'We are a medium-sized company with about 200 employees',
      testQuestion
    )
    expect(['medium', 'high']).toContain(result.quality)
  })

  it('should return high for detailed answers with entities', () => {
    const result = analyzeResponseQuality(
      'We are a manufacturing company with 500 employees across 3 locations. Our IT department consists of 15 team members who manage our SAP infrastructure and Microsoft 365 environment.',
      defaultQuestionFlow[1]
    )
    expect(result.quality).toBe('high')
  })
})

describe('shouldProbe()', () => {
  it('should probe for low quality answers', () => {
    expect(shouldProbe('low', 0)).toBe(true)
  })

  it('should probe for medium quality on first follow-up', () => {
    expect(shouldProbe('medium', 0)).toBe(true)
  })

  it('should not probe for high quality', () => {
    expect(shouldProbe('high', 0)).toBe(false)
  })

  it('should not probe if max follow-ups reached', () => {
    expect(shouldProbe('low', 2)).toBe(false)
  })
})

describe('availableTemplates', () => {
  it('should have multiple templates', () => {
    expect(availableTemplates.length).toBeGreaterThanOrEqual(5)
  })

  it('should include SAP template', () => {
    const sap = availableTemplates.find((t) => t.id === 'sap-knowledge')
    expect(sap).toBeDefined()
    expect(sap?.category).toBe('enterprise')
  })
})
