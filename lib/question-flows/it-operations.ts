/**
 * IT Operations Knowledge Capture Template — v2.0
 */

import type { QuestionFlowItem } from '../types'

export const itOperationsQuestionFlow: QuestionFlowItem[] = [
  {
    id: 1,
    question: 'Can you describe the IT infrastructure you manage and your specific responsibilities?',
    purpose: 'Map infrastructure landscape and ownership',
    category: 'infrastructure',
    followUps: [
      'Which parts of the infrastructure are the most complex?',
      'Are there undocumented dependencies between systems?',
      'What is the single point of failure you worry about most?',
    ],
    expectedEntities: ['system', 'person', 'risk'],
  },
  {
    id: 2,
    question: 'What does your incident response process look like in practice (not on paper)?',
    purpose: 'Capture real vs. documented incident process',
    category: 'incident_response',
    followUps: [
      'Where does the actual process differ from the documented one?',
      'What are the first 3 things you check when you get an alert?',
      'Which incidents require tribal knowledge to resolve?',
    ],
    expectedEntities: ['process', 'workaround', 'decision_context'],
  },
  {
    id: 3,
    question: 'What system configurations or settings exist that only you know about?',
    purpose: 'Identify undocumented configuration knowledge',
    category: 'undocumented_configs',
    followUps: [
      'Why are these not documented?',
      'What would happen if these settings were accidentally changed?',
      'How did you learn about these configurations?',
    ],
    expectedEntities: ['system', 'workaround', 'risk'],
  },
  {
    id: 4,
    question: 'What monitoring workarounds or custom scripts do you use that are not official?',
    purpose: 'Capture shadow IT and operational hacks',
    category: 'monitoring_workarounds',
    followUps: [
      'What gap does each workaround fill?',
      'Who else knows how to maintain these scripts?',
      'What would be the proper solution for these gaps?',
    ],
    expectedEntities: ['workaround', 'system', 'person'],
  },
  {
    id: 5,
    question: 'How do you handle change management and deployments in practice?',
    purpose: 'Capture deployment knowledge and risk awareness',
    category: 'change_management',
    followUps: [
      'What goes wrong most often during deployments?',
      'Are there rollback procedures that are not documented?',
      'What checks do you always do that are not in the checklist?',
    ],
    expectedEntities: ['process', 'exception', 'risk'],
  },
  {
    id: 6,
    question: 'Which vendor relationships and external dependencies are critical for your operations?',
    purpose: 'Map external knowledge dependencies',
    category: 'vendor_dependencies',
    followUps: [
      'Are there vendor contacts with essential tribal knowledge?',
      'What happens when a critical vendor is unresponsive?',
      'Are there license or contract nuances that only you track?',
    ],
    expectedEntities: ['person', 'system', 'risk'],
  },
  {
    id: 7,
    question: 'What security practices do you follow that go beyond the official policy?',
    purpose: 'Capture practical security knowledge',
    category: 'security_practices',
    followUps: [
      'Are there known vulnerabilities that are being tracked informally?',
      'What security compromises were made for operational reasons?',
      'How do you prioritize security vs. availability?',
    ],
    expectedEntities: ['process', 'risk', 'decision_context'],
  },
  {
    id: 8,
    question: 'Can you describe the disaster recovery scenario you worry about most?',
    purpose: 'Capture DR/BC expert assessment',
    category: 'disaster_recovery',
    followUps: [
      'Have you ever had to execute a DR plan?',
      'What would fail in the current DR plan?',
      'What knowledge is needed during a DR event that is not documented?',
    ],
    expectedEntities: ['risk', 'process', 'exception'],
  },
  {
    id: 9,
    question: 'How do you manage capacity and performance tuning?',
    purpose: 'Capture performance optimization knowledge',
    category: 'performance',
    followUps: [
      'What performance issues are predictable but not well-documented?',
      'Are there tuning parameters you adjust based on intuition?',
      'What tools or metrics do you wish you had?',
    ],
    expectedEntities: ['system', 'kpi', 'workaround'],
  },
  {
    id: 10,
    question: 'If you were to hand over all your responsibilities tomorrow, what 3 things must your successor know?',
    purpose: 'The golden tacit knowledge question',
    category: 'tacit_knowledge',
    followUps: [
      'Why is this knowledge not documented?',
      'How long would it take someone to figure this out on their own?',
      'What is the worst-case scenario if this knowledge is lost?',
    ],
    expectedEntities: ['decision_context', 'workaround', 'exception'],
  },
]
