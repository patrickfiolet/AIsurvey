/**
 * TypeScript interfaces and types for AIsurvey.me v2.0
 */

// ============================================================
// Survey Types
// ============================================================
export type SurveyMode = 'STATIC' | 'CONVERSATIONAL' | 'VOICE_AGENT'

export interface SurveyData {
  id: number
  title: string
  description: string
  welcomeText: string
  thankYouText: string
  isActive: boolean
  type: SurveyMode
  templateId?: string | null
  templateName?: string | null
  userId: number
  createdAt: string
  updatedAt: string
}

// ============================================================
// Conversation Types
// ============================================================
export interface ConversationMessage {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  questionIndex?: number | null
  createdAt: string
}

export interface ConversationData {
  id: number
  respondentName: string
  language: string
  currentQuestion: number
  isCompleted: boolean
  messages: ConversationMessage[]
  entities: ExtractedEntityData[]
  metadata?: ConversationMetadataData
}

export interface ConversationMetadataData {
  summary?: string | null
  keyInsights: string[]
  riskFactors: string[]
  recommendations: string[]
  completionScore: number
  tacitKnowledgeScore: number
  knowledgeDomains: string[]
  uniqueInsightsCount: number
}

// ============================================================
// Entity Types
// ============================================================
export type EntityType =
  | 'person'
  | 'system'
  | 'process'
  | 'risk'
  | 'kpi'
  | 'department'
  | 'technology'
  | 'tool'
  | 'decision_context'  // v2.0
  | 'workaround'        // v2.0
  | 'exception'         // v2.0

export interface ExtractedEntityData {
  id: number
  type: EntityType
  value: string
  context?: string | null
  confidence: number
  questionIndex?: number | null
  metadata?: Record<string, unknown> | null
}

// ============================================================
// AI Types
// ============================================================
export interface AIResponse {
  message: string
  entities: Array<{
    type: string
    value: string
    confidence: number
    context?: string
    metadata?: Record<string, unknown>
  }>
  progress: number
  shouldTransition: boolean
  nextQuestionIndex?: number
}

export interface ConversationContext {
  respondentName: string
  currentQuestionIndex: number
  previousAnswers: Array<{
    questionIndex: number
    question: string
    answer: string
  }>
  extractedEntities: Array<{
    type: string
    value: string
  }>
  language: string
  surveyTitle: string
  templateId?: string // v2.0: Domain template context
}

// ============================================================
// Question Flow Types
// ============================================================
export interface QuestionFlowItem {
  id: number
  question: string
  purpose: string
  category: string
  followUps: string[]
  expectedEntities: string[]
}

// ============================================================
// v2.0: Knowledge Graph Types
// ============================================================
export interface KnowledgeNodeData {
  id: number
  nodeType: string
  label: string
  description?: string | null
  domain?: string | null
  confidence: number
  metadata?: Record<string, unknown> | null
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
// v2.0: Expert Profile Types
// ============================================================
export interface ExpertProfileData {
  id: number
  name: string
  email?: string | null
  role: string
  department: string
  organization?: string | null
  knowledgeDomains: string[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  knowledgeScore: number
  sessionCount: number
  lastSessionAt?: string | null
  nextSessionDue?: string | null
}

// ============================================================
// v2.0: Tacit Knowledge Score
// ============================================================
export interface TacitKnowledgeScore {
  overall: number           // 0-100
  decisionContextScore: number
  uniqueInsightsScore: number
  responseDepthScore: number
  followUpEffectivenessScore: number
  domains: string[]
}

// ============================================================
// v2.0: Knowledge-OS Integration
// ============================================================
export interface KnowledgeObject {
  id: string
  type: 'tacit_insight' | 'document_extract' | 'learning_module'
  source: 'aisurvey' | 'edi' | 'learning'
  domain: string
  content: string
  structuredData: {
    entities: Array<{ type: string; value: string }>
    relationships: Array<{ from: string; to: string; type: string }>
    decisionContext?: string
    exceptions?: string[]
  }
  metadata: {
    expert?: string
    confidence: number
    lastValidated: string
    linkedObjects: string[]
  }
}

export type KnowledgeOSEventType =
  | 'knowledge.extracted'
  | 'document.analyzed'
  | 'learning.completed'
  | 'knowledge.gap.detected'

// ============================================================
// API Response Types
// ============================================================
export interface ApiError {
  error: string
  code?: string
  details?: Record<string, unknown>
}

export interface ApiSuccess<T> {
  data: T
  message?: string
}

// ============================================================
// Supported Languages
// ============================================================
export type SupportedLanguage = 'nl' | 'de' | 'en' | 'fr' | 'es' | 'pt' | 'it'

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  nl: 'Nederlands',
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
}
