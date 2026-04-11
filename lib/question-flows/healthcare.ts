/**
 * Healthcare Knowledge Capture Template — v2.0
 */

import type { QuestionFlowItem } from '../types'

export const healthcareQuestionFlow: QuestionFlowItem[] = [
  {
    id: 1,
    question: 'Can you describe your role and which patient pathways you are involved in?',
    purpose: 'Map role and care process involvement',
    category: 'role_mapping',
    followUps: [
      'How long have you been working in this role?',
      'Which protocols do you handle most frequently?',
      'Are there specialized tasks that only you perform?',
    ],
    expectedEntities: ['person', 'process', 'department'],
  },
  {
    id: 2,
    question: 'Which clinical protocols do you follow and when do you deviate from them?',
    purpose: 'Capture protocol exceptions and clinical judgment',
    category: 'protocols',
    followUps: [
      'What determines whether you deviate from the protocol?',
      'How do you pass on this decision to colleagues?',
      'Are these deviations documented somewhere?',
    ],
    expectedEntities: ['process', 'exception', 'decision_context'],
  },
  {
    id: 3,
    question: 'What knowledge do you have that you learned from experience rather than training?',
    purpose: 'Direct tacit knowledge elicitation',
    category: 'experiential_knowledge',
    followUps: [
      'Can you give a specific example?',
      'How would you transfer this knowledge to a new colleague?',
      'Why is this not part of the standard training?',
    ],
    expectedEntities: ['decision_context', 'process', 'person'],
  },
  {
    id: 4,
    question: 'Which IT systems do you use in your daily work and what are their limitations?',
    purpose: 'Map healthcare IT landscape and workarounds',
    category: 'systems',
    followUps: [
      'What workarounds do you use for these limitations?',
      'Which information do you track outside the system?',
      'What would the ideal system look like for your work?',
    ],
    expectedEntities: ['system', 'workaround', 'risk'],
  },
  {
    id: 5,
    question: 'How do you handle handoffs between departments or shifts?',
    purpose: 'Capture knowledge transfer in transitions',
    category: 'handoffs',
    followUps: [
      'What information is critical but often missed in handoffs?',
      'Are there informal channels you use for handoffs?',
      'What could be improved in the handoff process?',
    ],
    expectedEntities: ['process', 'risk', 'department'],
  },
  {
    id: 6,
    question: 'Can you describe a critical situation where your experience made the difference?',
    purpose: 'Capture expert pattern recognition',
    category: 'critical_situations',
    followUps: [
      'What signals alerted you to the situation?',
      'How would a less experienced colleague have handled this?',
      'Is this experience captured anywhere for others to learn from?',
    ],
    expectedEntities: ['decision_context', 'risk', 'process'],
  },
  {
    id: 7,
    question: 'What informal knowledge networks exist in your department?',
    purpose: 'Map social knowledge structures',
    category: 'knowledge_networks',
    followUps: [
      'Who do people go to for advice on specific topics?',
      'How does knowledge spread informally?',
      'What happens when key knowledge holders are absent?',
    ],
    expectedEntities: ['person', 'department', 'risk'],
  },
  {
    id: 8,
    question: 'Which quality and safety processes have you seen improve or deteriorate over time?',
    purpose: 'Capture longitudinal quality insights',
    category: 'quality_safety',
    followUps: [
      'What caused these changes?',
      'What interventions worked or did not?',
      'Are there quality risks that are not visible in the metrics?',
    ],
    expectedEntities: ['process', 'risk', 'kpi'],
  },
  {
    id: 9,
    question: 'How do you stay current with new medical developments in your area?',
    purpose: 'Map continuous learning patterns',
    category: 'continuous_learning',
    followUps: [
      'How do you translate new insights into your daily practice?',
      'What barriers exist for implementing new knowledge?',
      'How do you share new knowledge with your team?',
    ],
    expectedEntities: ['process', 'person', 'technology'],
  },
  {
    id: 10,
    question: 'If you were to leave tomorrow, what should your successor absolutely know?',
    purpose: 'The golden tacit knowledge question',
    category: 'tacit_knowledge',
    followUps: [
      'Why is this not written down?',
      'How long did it take you to learn this?',
      'What could go wrong if this knowledge is lost?',
    ],
    expectedEntities: ['decision_context', 'workaround', 'exception'],
  },
]
