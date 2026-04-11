/**
 * SAP-Specific Knowledge Extraction Template — v2.0
 *
 * Designed to extract tacit knowledge from SAP consultants, admins,
 * and key users. Focus on: custom configurations, workarounds,
 * implementation decisions, and undocumented knowledge.
 */

import type { QuestionFlowItem } from '../types'

export const sapQuestionFlow: QuestionFlowItem[] = [
  {
    id: 1,
    question:
      'Which SAP modules do you use daily and what customizations have been made to them?',
    purpose: 'Map SAP landscape and customization level',
    category: 'sap_landscape',
    followUps: [
      'Which customizations were absolutely necessary and why?',
      'Are there customizations that you would handle differently today?',
      'Who made these customizations and is that knowledge documented?',
    ],
    expectedEntities: ['system', 'process', 'person'],
  },
  {
    id: 2,
    question:
      'Can you describe a situation where the standard SAP process did not work and you had to use a workaround?',
    purpose: 'Identify undocumented workarounds and exception processes',
    category: 'workarounds',
    followUps: [
      'How often does this workaround need to be applied?',
      'Does anyone else know about this workaround?',
      'What would happen if this workaround was not available?',
    ],
    expectedEntities: ['workaround', 'exception', 'process'],
  },
  {
    id: 3,
    question:
      'Which transaction codes or configurations do you know that are not in the official documentation?',
    purpose: 'Capture undocumented technical knowledge',
    category: 'undocumented_knowledge',
    followUps: [
      'How did you discover these transactions/configurations?',
      'Are there specific settings that are critical but not documented?',
      'What would a new employee need to know that is not in the manuals?',
    ],
    expectedEntities: ['system', 'workaround', 'decision_context'],
  },
  {
    id: 4,
    question:
      'When an error occurs in your SAP module, who do you call and why specifically that person?',
    purpose: 'Map knowledge dependencies and key person risks',
    category: 'knowledge_dependencies',
    followUps: [
      'What does this person know that others do not?',
      'What happens if this person is absent or leaves?',
      'Is there a backup for this knowledge?',
    ],
    expectedEntities: ['person', 'risk', 'decision_context'],
  },
  {
    id: 5,
    question:
      'Which decisions during the SAP implementation would you make differently today, and why?',
    purpose: 'Capture implementation decision context',
    category: 'implementation_decisions',
    followUps: [
      'What was the context in which the original decision was made?',
      'What has changed since then that makes this decision suboptimal?',
      'What would be the impact of changing this now?',
    ],
    expectedEntities: ['decision_context', 'process', 'risk'],
  },
  {
    id: 6,
    question: 'How do the different SAP modules communicate with each other and with external systems?',
    purpose: 'Map integration landscape and hidden dependencies',
    category: 'integrations',
    followUps: [
      'Are there integration points that regularly cause problems?',
      'Which interfaces require manual intervention?',
      'Are there data flows that only you know about?',
    ],
    expectedEntities: ['system', 'process', 'workaround'],
  },
  {
    id: 7,
    question:
      'What happens during month-end/year-end closing in SAP? Which steps are critical and why?',
    purpose: 'Capture critical periodic process knowledge',
    category: 'critical_processes',
    followUps: [
      'Which steps are most error-prone?',
      'What checks do you always perform that are not in the procedure?',
      'What is the impact if a step goes wrong?',
    ],
    expectedEntities: ['process', 'exception', 'risk'],
  },
  {
    id: 8,
    question:
      'Which ABAP reports, custom programs, or Z-transactions does your organization use?',
    purpose: 'Map custom development landscape',
    category: 'custom_development',
    followUps: [
      'Who developed these and is the knowledge available?',
      'Which custom programs are business-critical?',
      'Is the source code documented and maintainable?',
    ],
    expectedEntities: ['system', 'person', 'risk'],
  },
  {
    id: 9,
    question: 'How is authorization management in SAP organized and what are the biggest challenges?',
    purpose: 'Capture authorization and compliance knowledge',
    category: 'authorization',
    followUps: [
      'Are there authorization exceptions that are regularly needed?',
      'How do you handle segregation of duties conflicts?',
      'Which authorization roles were specifically designed for your organization?',
    ],
    expectedEntities: ['process', 'exception', 'risk'],
  },
  {
    id: 10,
    question:
      'If you were to onboard your successor tomorrow, what 3 things should they know that are not written down anywhere?',
    purpose: 'Direct tacit knowledge elicitation — the golden question',
    category: 'tacit_knowledge',
    followUps: [
      'Why is this knowledge not documented?',
      'How long did it take you to acquire this knowledge?',
      'What could go wrong if your successor does not know this?',
    ],
    expectedEntities: ['decision_context', 'workaround', 'exception'],
  },
]
