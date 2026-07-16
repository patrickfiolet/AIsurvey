import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Truncate text to a maximum length, appending an ellipsis when cut. */
export function truncate(text: string, maxLength: number): string {
  if (typeof text !== 'string') return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/** Safe integer percentage; returns 0 when the total is 0 to avoid NaN/Infinity. */
export function percentage(part: number, total: number): number {
  if (!total || total <= 0) return 0
  return Math.round((part / total) * 100)
}

/** Parse JSON without throwing; returns the fallback on any error. */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

/** Generate a collision-resistant, non-cryptographic id (safe for React keys, etc.). */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
