/**
 * Government & Public Sector Knowledge Capture Template — v2.0
 */

import type { QuestionFlowItem } from '../types'

export const governmentQuestionFlow: QuestionFlowItem[] = [
  {
    id: 1,
    question: 'Can you describe your role and which policy areas or public services you are responsible for?',
    purpose: 'Map role and policy domain',
    category: 'role_mapping',
    followUps: [
      'How long have you worked in this domain?',
      'What specific expertise have you built up?',
      'Who depends on your knowledge for their work?',
    ],
    expectedEntities: ['person', 'department', 'process'],
  },
  {
    id: 2,
    question: 'Which regulations or policies do you interpret regularly, and where does your interpretation differ from the written text?',
    purpose: 'Capture regulatory interpretation knowledge',
    category: 'regulation_interpretation',
    followUps: [
      'How did you develop this interpretation?',
      'Are there precedent cases that shaped your approach?',
      'What happens when a new colleague applies the regulation literally?',
    ],
    expectedEntities: ['decision_context', 'exception', 'process'],
  },
  {
    id: 3,
    question: 'What exception processes exist for special cases that do not fit the standard procedure?',
    purpose: 'Map exception handling and discretionary decisions',
    category: 'exceptions',
    followUps: [
      'How do you decide when to apply an exception?',
      'Is this decision-making process documented?',
      'Who approves exceptions and based on what criteria?',
    ],
    expectedEntities: ['exception', 'decision_context', 'person'],
  },
  {
    id: 4,
    question: 'How does coordination with other departments or government agencies work in practice?',
    purpose: 'Capture inter-agency collaboration knowledge',
    category: 'coordination',
    followUps: [
      'What informal channels are essential for getting things done?',
      'Where does coordination break down?',
      'What relationships are critical for your work?',
    ],
    expectedEntities: ['person', 'department', 'process'],
  },
  {
    id: 5,
    question: 'Which IT systems do you use and what workarounds have you developed?',
    purpose: 'Map government IT landscape and practical solutions',
    category: 'it_landscape',
    followUps: [
      'What data do you manage outside official systems?',
      'What Excel sheets or personal databases are essential?',
      'Which system limitation causes the most frustration?',
    ],
    expectedEntities: ['system', 'workaround', 'risk'],
  },
  {
    id: 6,
    question: 'What institutional knowledge about past decisions or policy changes is important for current work?',
    purpose: 'Capture institutional memory',
    category: 'institutional_memory',
    followUps: [
      'Why were those decisions made at the time?',
      'What context is needed to understand the current situation?',
      'Where can someone find this historical context?',
    ],
    expectedEntities: ['decision_context', 'process', 'person'],
  },
  {
    id: 7,
    question: 'How do you handle citizen/stakeholder complaints or escalations?',
    purpose: 'Capture escalation and complaint handling expertise',
    category: 'escalation_handling',
    followUps: [
      'What approaches work best for difficult situations?',
      'Are there unwritten rules for handling sensitive cases?',
      'How do you balance empathy with policy compliance?',
    ],
    expectedEntities: ['process', 'exception', 'decision_context'],
  },
  {
    id: 8,
    question: 'What knowledge is at risk of being lost due to retirements or reorganizations?',
    purpose: 'Assess knowledge risk in the organization',
    category: 'knowledge_risk',
    followUps: [
      'Which key people are approaching retirement?',
      'Has any critical knowledge already been lost?',
      'What impact did that loss have?',
    ],
    expectedEntities: ['person', 'risk', 'department'],
  },
  {
    id: 9,
    question: 'How do political changes or new policy priorities affect your daily work?',
    purpose: 'Capture adaptation and resilience knowledge',
    category: 'political_context',
    followUps: [
      'How do you manage the transition between different policy directions?',
      'What institutional continuity mechanisms exist?',
      'How do you preserve knowledge across political cycles?',
    ],
    expectedEntities: ['process', 'decision_context', 'risk'],
  },
  {
    id: 10,
    question: 'If you were to leave tomorrow, what should your successor absolutely know that is not documented?',
    purpose: 'The golden tacit knowledge question',
    category: 'tacit_knowledge',
    followUps: [
      'Why has this not been documented?',
      'How long did it take you to learn this?',
      'What is the worst-case scenario if this knowledge is lost?',
    ],
    expectedEntities: ['decision_context', 'workaround', 'exception'],
  },
]
