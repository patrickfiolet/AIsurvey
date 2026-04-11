/**
 * Question Flow Engine — v2.0
 *
 * Default 10-question structure with follow-ups for organizational assessment.
 * v2.0 adds domain template support and enhanced quality analysis.
 */

import type { QuestionFlowItem } from './types'

// ============================================================
// Default Question Flow (General IT Assessment)
// ============================================================

export const defaultQuestionFlow: QuestionFlowItem[] = [
  {
    id: 1,
    question:
      'Can you briefly describe your organization? What is the core activity and how many employees do you have?',
    purpose: 'Gather basic information about the organization',
    category: 'organization',
    followUps: [
      'In which sector does your organization operate specifically?',
      'How many locations does your organization have?',
      'Is your organization part of a larger group?',
    ],
    expectedEntities: ['department', 'person'],
  },
  {
    id: 2,
    question: 'What IT systems and software does your organization currently use?',
    purpose: 'Map the current IT landscape',
    category: 'systems',
    followUps: [
      'How satisfied are you with these systems?',
      'Are there any systems you want to replace?',
      'How are these systems integrated with each other?',
    ],
    expectedEntities: ['system', 'technology'],
  },
  {
    id: 3,
    question:
      'What does your current IT infrastructure look like? Think about servers, cloud, network.',
    purpose: 'Assess the technical infrastructure',
    category: 'infrastructure',
    followUps: [
      'Do you use cloud services? If so, which ones?',
      'How is your network secured?',
      'Do you have a disaster recovery plan?',
    ],
    expectedEntities: ['system', 'technology', 'process'],
  },
  {
    id: 4,
    question:
      'What are the biggest challenges or bottlenecks in your current IT environment?',
    purpose: 'Identify pain points and opportunities for improvement',
    category: 'challenges',
    followUps: [
      'What impact do these challenges have on your daily operations?',
      'Have you already taken steps to address these issues?',
      'Which bottleneck has the highest priority?',
    ],
    expectedEntities: ['risk', 'process'],
  },
  {
    id: 5,
    question: 'How does your organization handle cybersecurity and data protection?',
    purpose: 'Assess security maturity',
    category: 'security',
    followUps: [
      'Do you have a security officer or responsible person?',
      'Are employees trained in security awareness?',
      'Have you experienced any security incidents?',
    ],
    expectedEntities: ['person', 'process', 'risk'],
  },
  {
    id: 6,
    question:
      'Which business processes would you like to digitize or improve with technology?',
    purpose: 'Explore digitalization ambitions and opportunities',
    category: 'digitalization',
    followUps: [
      'Which processes are still manual?',
      'What would be the impact of digitizing these processes?',
      'Have you allocated a budget for digitalization?',
    ],
    expectedEntities: ['process', 'kpi', 'department'],
  },
  {
    id: 7,
    question:
      'How does your organization measure IT performance? Which KPIs do you use?',
    purpose: 'Understand IT governance and metrics',
    category: 'kpis',
    followUps: [
      'How often are these KPIs reported?',
      'Who is responsible for IT reporting?',
      'Are you satisfied with the current measurement methods?',
    ],
    expectedEntities: ['kpi', 'person', 'process'],
  },
  {
    id: 8,
    question: 'What is your vision on AI and automation within your organization?',
    purpose: 'Determine AI readiness and future vision',
    category: 'ai_vision',
    followUps: [
      'Are you already using AI tools?',
      'Which processes would benefit most from AI?',
      'How do your employees feel about AI?',
    ],
    expectedEntities: ['technology', 'process', 'risk'],
  },
  {
    id: 9,
    question:
      'How is your IT team organized? Do you have sufficient expertise in-house?',
    purpose: 'Assess IT capacity and competencies',
    category: 'team',
    followUps: [
      'How many FTEs are in your IT team?',
      'What expertise is missing in your team?',
      'Do you use external IT partners?',
    ],
    expectedEntities: ['person', 'department'],
  },
  {
    id: 10,
    question:
      'If you could change one thing about your IT environment, what would it be and why?',
    purpose: 'Understand priorities and decision-making',
    category: 'priorities',
    followUps: [
      'What do you expect the impact of this change would be?',
      'What is preventing you from making this change now?',
      'What budget do you have available for IT improvement?',
    ],
    expectedEntities: ['process', 'risk', 'kpi'],
  },
]

// ============================================================
// Response Quality Analysis
// ============================================================

export function analyzeResponseQuality(
  answer: string,
  question: QuestionFlowItem
): { quality: 'low' | 'medium' | 'high'; reason: string } {
  const wordCount = answer.trim().split(/\s+/).length

  if (wordCount < 5) {
    return { quality: 'low', reason: 'Answer is too short for meaningful analysis' }
  }

  // Check if expected entities are present
  const hasExpectedContent = question.expectedEntities.some((entityType) => {
    switch (entityType) {
      case 'system':
        return /\b(SAP|Microsoft|Oracle|Salesforce|AWS|Azure|Google|Slack|software|system|application)\b/i.test(
          answer
        )
      case 'person':
        return /\b(manager|director|employee|team|department|colleague)\b/i.test(answer)
      case 'process':
        return /\b(process|workflow|procedure|step|phase|approach)\b/i.test(answer)
      case 'risk':
        return /\b(risk|danger|problem|challenge|vulnerability|threat)\b/i.test(answer)
      case 'kpi':
        return /\b(KPI|metric|indicator|performance|score|percentage|uptime|SLA)\b/i.test(
          answer
        )
      case 'department':
        return /\b(IT|HR|Finance|Marketing|Sales|Operations|department)\b/i.test(answer)
      default:
        return false
    }
  })

  // v2.0: Check for tacit knowledge indicators
  const hasTacitIndicators =
    /\b(because|reason|decided|chose|workaround|exception|normally|usually|actually|secret|trick|only I know)\b/i.test(
      answer
    )

  if (wordCount > 20 && (hasExpectedContent || hasTacitIndicators)) {
    return { quality: 'high', reason: 'Detailed answer with relevant information' }
  }

  if (wordCount > 10 || hasExpectedContent) {
    return {
      quality: 'medium',
      reason: 'Answer contains relevant information but could be expanded',
    }
  }

  return { quality: 'low', reason: 'Answer lacks specific details' }
}

// ============================================================
// Follow-up Decision
// ============================================================

export function shouldProbe(
  quality: 'low' | 'medium' | 'high',
  followUpCount: number,
  maxFollowUps: number = 2
): boolean {
  if (followUpCount >= maxFollowUps) return false
  if (quality === 'low') return true
  if (quality === 'medium' && followUpCount === 0) return true
  return false
}

// ============================================================
// Get Question Flow by Template ID
// ============================================================

export function getQuestionFlowForTemplate(templateId?: string | null): QuestionFlowItem[] {
  if (!templateId) return defaultQuestionFlow

  // Dynamic import of domain-specific templates
  const templates: Record<string, QuestionFlowItem[]> = {
    'sap-knowledge': require('./question-flows/sap-knowledge').sapQuestionFlow,
    'healthcare': require('./question-flows/healthcare').healthcareQuestionFlow,
    'it-operations': require('./question-flows/it-operations').itOperationsQuestionFlow,
    'government': require('./question-flows/government').governmentQuestionFlow,
    'general-knowledge': require('./question-flows/general-knowledge').generalKnowledgeQuestionFlow,
  }

  return templates[templateId] || defaultQuestionFlow
}

// ============================================================
// Available Templates Metadata
// ============================================================

export const availableTemplates = [
  {
    id: 'default',
    name: 'General IT Assessment',
    description: 'Standard 10-question organizational IT assessment',
    category: 'general',
    questionCount: 10,
  },
  {
    id: 'sap-knowledge',
    name: 'SAP Knowledge Extraction',
    description: 'Targeted questions for SAP/ERP tacit knowledge capture',
    category: 'enterprise',
    questionCount: 10,
  },
  {
    id: 'healthcare',
    name: 'Healthcare Knowledge Capture',
    description: 'Questions for capturing clinical and operational healthcare knowledge',
    category: 'healthcare',
    questionCount: 10,
  },
  {
    id: 'it-operations',
    name: 'IT Operations Knowledge',
    description: 'Focus on infrastructure, incident response, and operational tribal knowledge',
    category: 'it',
    questionCount: 10,
  },
  {
    id: 'government',
    name: 'Government & Public Sector',
    description: 'Policy, regulation, and institutional knowledge capture',
    category: 'government',
    questionCount: 10,
  },
  {
    id: 'general-knowledge',
    name: 'General Knowledge Retention',
    description: 'Broad organizational knowledge and decision-making capture',
    category: 'general',
    questionCount: 10,
  },
]
