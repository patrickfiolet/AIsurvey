/**
 * General Knowledge Retention Template — v2.0
 */

import type { QuestionFlowItem } from '../types'

export const generalKnowledgeQuestionFlow: QuestionFlowItem[] = [
  {
    id: 1,
    question: 'Can you describe your role and what makes your position unique within the organization?',
    purpose: 'Map unique expertise and role specifics',
    category: 'role_unique',
    followUps: [
      'What aspects of your work are hardest to explain to others?',
      'Who comes to you for advice, and on what topics?',
      'What would be most difficult for a replacement to learn?',
    ],
    expectedEntities: ['person', 'department', 'process'],
  },
  {
    id: 2,
    question: 'What critical decisions have you made in the past year and what was the reasoning behind them?',
    purpose: 'Capture decision context and rationale',
    category: 'decisions',
    followUps: [
      'What alternatives were considered?',
      'What information was most important for each decision?',
      'Would you make the same decision today?',
    ],
    expectedEntities: ['decision_context', 'process', 'risk'],
  },
  {
    id: 3,
    question: 'What processes or methods have you developed or improved that are not standard procedure?',
    purpose: 'Capture process innovation and tacit improvements',
    category: 'innovations',
    followUps: [
      'Why was the standard process insufficient?',
      'How did you develop your approach?',
      'Is your method documented for others to follow?',
    ],
    expectedEntities: ['process', 'workaround', 'decision_context'],
  },
  {
    id: 4,
    question: 'What knowledge do you have that took years of experience to develop?',
    purpose: 'Direct tacit knowledge identification',
    category: 'experience_knowledge',
    followUps: [
      'Can you describe specific situations where this experience was crucial?',
      'How would you teach this to someone new?',
      'What mistakes have you learned from?',
    ],
    expectedEntities: ['decision_context', 'exception', 'person'],
  },
  {
    id: 5,
    question: 'Who are the key people you rely on for getting your work done?',
    purpose: 'Map knowledge networks and dependencies',
    category: 'knowledge_network',
    followUps: [
      'What unique knowledge does each person provide?',
      'What would happen if one of them left?',
      'Are there single points of knowledge failure?',
    ],
    expectedEntities: ['person', 'risk', 'department'],
  },
  {
    id: 6,
    question: 'What tools, templates, or resources have you created that others now use?',
    purpose: 'Capture codified tacit knowledge',
    category: 'tools_created',
    followUps: [
      'What was the gap that led you to create these?',
      'Who maintains them now?',
      'What implicit knowledge is needed to use them effectively?',
    ],
    expectedEntities: ['system', 'process', 'person'],
  },
  {
    id: 7,
    question: 'What are the unwritten rules in your team or department?',
    purpose: 'Capture cultural and social knowledge',
    category: 'unwritten_rules',
    followUps: [
      'Why did these unwritten rules develop?',
      'What happens when someone violates them?',
      'How do new employees learn about them?',
    ],
    expectedEntities: ['decision_context', 'process', 'department'],
  },
  {
    id: 8,
    question: 'What external relationships or partnerships are critical for your work?',
    purpose: 'Map external knowledge dependencies',
    category: 'external_relationships',
    followUps: [
      'What unique value does each relationship provide?',
      'How are these relationships maintained?',
      'What would be lost if the relationship ended?',
    ],
    expectedEntities: ['person', 'risk', 'process'],
  },
  {
    id: 9,
    question: 'What are the most common mistakes newcomers make in your area of work?',
    purpose: 'Capture onboarding knowledge gaps',
    category: 'common_mistakes',
    followUps: [
      'How could these be prevented?',
      'What is the typical learning curve?',
      'What training is missing?',
    ],
    expectedEntities: ['process', 'risk', 'exception'],
  },
  {
    id: 10,
    question: 'If you could preserve only 3 things from your knowledge for the organization, what would they be?',
    purpose: 'Prioritized tacit knowledge identification',
    category: 'tacit_knowledge',
    followUps: [
      'Why these 3 specifically?',
      'What would be the impact if they were lost?',
      'How would you transfer this knowledge most effectively?',
    ],
    expectedEntities: ['decision_context', 'workaround', 'exception'],
  },
]
