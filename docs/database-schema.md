# AIsurvey.me v2.0 — Database Schema

## Overview

PostgreSQL database managed via Prisma ORM. Contains 22 models and 10 enums.

## Entity Relationship Diagram (Text)

```
User ──< Account
User ──< Session
User ──< Survey
User ──< Analysis
User ──< ExpertProfile

Survey ──< Question ──< QuestionTranslation
Survey ──< Response ──< Answer
Survey ──< Response ──< ConversationMessage
Survey ──< AdminQuestion
Survey ──< VoiceAgentQuestion
Survey ──< VapiCallLog
Survey ──< KnowledgeNode ──< KnowledgeEdge (source/target)
Survey ──< KnowledgeOSEvent

Response ──< Answer
Response ──< ConversationMessage
```

## Models

### Core Authentication

#### User
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String? | Display name |
| email | String | Unique |
| emailVerified | DateTime? | |
| password | String? | Hashed with bcrypt |
| image | String? | Avatar URL |
| role | Role | ADMIN, SUPER_ADMIN, VIEWER |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### Account / Session / VerificationToken
Standard NextAuth.js models for OAuth and session management.

### Survey System

#### Survey
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| title | String | Survey title |
| description | String? | |
| language | String | Default "nl" |
| isActive | Boolean | Default true |
| greetingMessage | String? | Custom greeting |
| closingMessage | String? | Custom closing |
| systemPrompt | String? | AI system prompt override |
| domainTemplate | String? | **v2.0** — sap-knowledge, healthcare, etc. |
| whyProtocolDepth | Int | **v2.0** — Default 3, range 1-5 |
| userId | String | FK → User |
| createdAt/updatedAt | DateTime | Auto |

#### Question
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| text | String | Question text |
| type | QuestionType | OPEN, MULTIPLE_CHOICE, SCALE, YES_NO |
| options | String? | JSON string for MC options |
| order | Int | Display order |
| isRequired | Boolean | Default true |
| followUpLogic | String? | JSON conditional logic |
| surveyId | String | FK → Survey |

#### Response
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| respondentName | String? | |
| respondentEmail | String? | |
| language | String | Default "nl" |
| status | ResponseStatus | IN_PROGRESS, COMPLETED, ABANDONED |
| completedAt | DateTime? | |
| tacitKnowledgeScore | Float? | **v2.0** — Composite TK score |
| tacitScoreDepth | Float? | **v2.0** — Depth dimension |
| tacitScoreUniqueness | Float? | **v2.0** — Uniqueness dimension |
| tacitScoreActionability | Float? | **v2.0** — Actionability dimension |
| surveyId | String | FK → Survey |
| createdAt/updatedAt | DateTime | Auto |

### v2.0 Knowledge Models

#### ExpertProfile
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String | Expert name |
| email | String? | Contact email |
| domains | String | JSON array of domains |
| tacitScore | Float | Aggregated TK score |
| riskLevel | ExpertRisk | LOW, MEDIUM, HIGH, CRITICAL |
| totalSessions | Int | Default 0 |
| isAvailable | Boolean | Default true |
| lastActive | DateTime? | |
| metadata | String? | JSON additional data |
| userId | String? | FK → User (optional) |

#### KnowledgeNode
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| label | String | Node display label |
| type | KnowledgeNodeType | CONCEPT, SKILL, PROCESS, TOOL, PERSON, DECISION, EXPERIENCE |
| properties | String? | JSON properties |
| surveyId | String? | FK → Survey |
| responseId | String? | Source response |
| createdAt | DateTime | Auto |

#### KnowledgeEdge
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| sourceId | String | FK → KnowledgeNode |
| targetId | String | FK → KnowledgeNode |
| type | KnowledgeEdgeType | RELATES_TO, DEPENDS_ON, LEADS_TO, etc. |
| weight | Float | Default 1.0 |
| properties | String? | JSON properties |
| createdAt | DateTime | Auto |

#### KnowledgeOSEvent
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| eventType | String | KNOWLEDGE_CAPTURED, EXPERT_IDENTIFIED, etc. |
| payload | String | JSON event data |
| status | String | Default "pending" |
| processedAt | DateTime? | |
| surveyId | String? | FK → Survey |
| createdAt | DateTime | Auto |

## Enums

| Enum | Values |
|------|--------|
| Role | ADMIN, SUPER_ADMIN, VIEWER |
| QuestionType | OPEN, MULTIPLE_CHOICE, SCALE, YES_NO |
| ResponseStatus | IN_PROGRESS, COMPLETED, ABANDONED |
| AnalysisType | SUMMARY, SENTIMENT, THEMATIC, CUSTOM |
| AnalysisStatus | PENDING, PROCESSING, COMPLETED, FAILED |
| CallStatus | QUEUED, RINGING, IN_PROGRESS, COMPLETED, FAILED, NO_ANSWER |
| VapiCallStatus | QUEUED, RINGING, IN_PROGRESS, FORWARDING, ENDED |
| ExpertRisk | LOW, MEDIUM, HIGH, CRITICAL |
| KnowledgeNodeType | CONCEPT, SKILL, PROCESS, TOOL, PERSON, DECISION, EXPERIENCE |
| KnowledgeEdgeType | RELATES_TO, DEPENDS_ON, LEADS_TO, CONTRADICTS, ENABLES, REQUIRES, PART_OF |

## Indexes

Key indexes for performance:
- `Response.surveyId` — Fast survey-response lookups
- `Answer.responseId` — Fast response-answer lookups  
- `KnowledgeNode.surveyId` — Graph queries by survey
- `KnowledgeNode.type` — Graph queries by node type
- `KnowledgeEdge.sourceId/targetId` — Graph traversal
- `KnowledgeOSEvent.status` — Event processing queue

## Migration

```bash
# Generate migration from schema
npx prisma migrate dev --name v2_knowledge_os

# Apply in production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```
