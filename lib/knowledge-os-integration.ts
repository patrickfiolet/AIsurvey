/**
 * Knowledge-OS Integration Layer — v2.0
 *
 * Handles event publishing and API communication between
 * AIsurvey.me, EDI, and learning.me.
 *
 * Phase 1: Event logging to database
 * Phase 2: HTTP API calls to other modules (stubs)
 * Phase 3: Full event bus integration (future)
 */

import { prisma } from './db'
import type { KnowledgeOSEventType, KnowledgeObject } from './types'

// ============================================================
// Event Publishing
// ============================================================

/** Publish an event to the Knowledge-OS event log */
export async function publishEvent(
  eventType: KnowledgeOSEventType,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.knowledgeOSEvent.create({
      data: {
        eventType,
        source: 'aisurvey',
        payload: payload as any,
        status: 'pending',
      },
    })

    // Phase 2: Forward to external event bus if configured
    if (process.env.KNOWLEDGE_OS_EVENT_BUS_URL) {
      try {
        await fetch(`${process.env.KNOWLEDGE_OS_EVENT_BUS_URL}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType, source: 'aisurvey', payload }),
        })
      } catch (error) {
        console.warn('Knowledge-OS event bus not available:', error)
      }
    }
  } catch (error) {
    console.error('Failed to publish Knowledge-OS event:', error)
  }
}

// ============================================================
// EDI Integration (stubs)
// ============================================================

/** Send extracted knowledge to EDI for document enrichment */
export async function sendToEDI(knowledgeObject: KnowledgeObject): Promise<boolean> {
  if (!process.env.EDI_API_URL || !process.env.EDI_API_KEY) {
    console.warn('EDI integration not configured')
    return false
  }

  try {
    const response = await fetch(`${process.env.EDI_API_URL}/knowledge/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EDI_API_KEY}`,
      },
      body: JSON.stringify(knowledgeObject),
    })

    if (response.ok) {
      await publishEvent('knowledge.extracted', {
        knowledgeObjectId: knowledgeObject.id,
        sentToEDI: true,
      })
      return true
    }
    return false
  } catch (error) {
    console.error('EDI integration failed:', error)
    return false
  }
}

/** Request relevant documents from EDI for a knowledge domain */
export async function getEDIDocuments(domain: string): Promise<any[]> {
  if (!process.env.EDI_API_URL || !process.env.EDI_API_KEY) {
    return []
  }

  try {
    const response = await fetch(
      `${process.env.EDI_API_URL}/documents/search?domain=${encodeURIComponent(domain)}`,
      {
        headers: { Authorization: `Bearer ${process.env.EDI_API_KEY}` },
      }
    )
    if (response.ok) {
      const data = await response.json()
      return data.documents || []
    }
    return []
  } catch (error) {
    console.error('EDI document retrieval failed:', error)
    return []
  }
}

// ============================================================
// learning.me Integration (stubs)
// ============================================================

/** Send structured knowledge to learning.me for course generation */
export async function sendToLearningMe(knowledgeObject: KnowledgeObject): Promise<boolean> {
  if (!process.env.LEARNING_ME_API_URL || !process.env.LEARNING_ME_API_KEY) {
    console.warn('learning.me integration not configured')
    return false
  }

  try {
    const response = await fetch(`${process.env.LEARNING_ME_API_URL}/knowledge/create-module`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LEARNING_ME_API_KEY}`,
      },
      body: JSON.stringify(knowledgeObject),
    })

    if (response.ok) {
      await publishEvent('knowledge.extracted', {
        knowledgeObjectId: knowledgeObject.id,
        sentToLearningMe: true,
      })
      return true
    }
    return false
  } catch (error) {
    console.error('learning.me integration failed:', error)
    return false
  }
}

// ============================================================
// Event Processing (incoming from other modules)
// ============================================================

/** Process incoming events from EDI or learning.me */
export async function processIncomingEvent(
  eventType: string,
  source: string,
  payload: Record<string, unknown>
): Promise<void> {
  await prisma.knowledgeOSEvent.create({
    data: {
      eventType,
      source,
      payload: payload as any,
      status: 'pending',
    },
  })

  switch (eventType) {
    case 'document.analyzed':
      // EDI analyzed a document — could trigger targeted survey questions
      console.log('EDI document analyzed event received:', payload)
      break

    case 'learning.completed':
      // A user completed a learning module — could trigger follow-up session
      console.log('learning.me completion event received:', payload)
      break

    case 'knowledge.gap.detected':
      // A knowledge gap was detected — trigger new survey session
      console.log('Knowledge gap detected:', payload)
      break

    default:
      console.log(`Unknown event type: ${eventType}`)
  }

  // Mark as processed
  // In production, this would trigger actual actions
}
