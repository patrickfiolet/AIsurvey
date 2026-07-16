/**
 * Tests for utility functions
 */
import { describe, it, expect } from '@jest/globals'
import { cn, truncate, percentage, safeJsonParse, generateId } from '@/lib/utils'

describe('cn()', () => {
  it('should merge class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('should handle conflicting classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible')
  })
})

describe('truncate()', () => {
  it('should not truncate short text', () => {
    expect(truncate('short', 10)).toBe('short')
  })

  it('should truncate long text', () => {
    expect(truncate('this is a long text', 10)).toBe('this is a ...')
  })
})

describe('percentage()', () => {
  it('should calculate percentage correctly', () => {
    expect(percentage(25, 100)).toBe(25)
    expect(percentage(1, 3)).toBe(33)
  })

  it('should handle zero total', () => {
    expect(percentage(5, 0)).toBe(0)
  })
})

describe('safeJsonParse()', () => {
  it('should parse valid JSON', () => {
    expect(safeJsonParse('{"a": 1}', {})).toEqual({ a: 1 })
  })

  it('should return fallback for invalid JSON', () => {
    expect(safeJsonParse('invalid', { default: true })).toEqual({ default: true })
  })
})

describe('generateId()', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })
})
