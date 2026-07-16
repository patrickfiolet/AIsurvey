/**
 * Shared application types for AIsurvey.me v3.0
 *
 * NOTE (audit v3): This file previously contained an unrelated "Expense"
 * template left over from project scaffolding. Those types were dead code and
 * caused broken imports across lib/knowledge-graph.ts, lib/knowledge-os-integration.ts
 * and lib/question-flows/*.ts. They have been replaced with the actual domain types.
 */

// ============================================================
// Date helpers
// ============================================================
export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// ============================================================
// Question flow templates (lib/question-flows/*.ts)
// ============================================================
export interface QuestionFlowItem {
  id: number
  question: string
  purpose: string
  category: string
  followUps: string[]
  expectedEntities: string[]
}

export interface SurveyTemplate {
  id: string
  name: string
  description: string
  category: string
  questionFlow: QuestionFlowItem[]
}

// ============================================================
// Knowledge graph (lib/knowledge-graph.ts)
// ============================================================
export interface KnowledgeNodeData {
  id: number
  nodeType: string
  label: string
  description?: string | null
  domain?: string | null
  confidence: number
  metadata?: unknown
}

export interface KnowledgeEdgeData {
  id: number
  edgeType: string
  label?: string | null
  weight: number
  fromNodeId: number
  toNodeId: number
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNodeData[]
  edges: KnowledgeEdgeData[]
}

// ============================================================
// Knowledge-OS integration (lib/knowledge-os-integration.ts)
// ============================================================
export type KnowledgeOSEventType =
  | 'survey.completed'
  | 'knowledge.extracted'
  | 'knowledge.gap.detected'
  | 'document.analyzed'
  | 'learning.completed'

export interface KnowledgeObject {
  id: string | number
  type: string
  domain?: string
  title?: string
  content?: unknown
  metadata?: Record<string, unknown>
}
