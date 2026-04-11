# Changelog

All notable changes to AIsurvey.me will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-04-11

### 🚀 Major Features — Knowledge-OS Integration

#### Why-Protocol Engine
- AI-driven follow-up questioning that probes tacit knowledge ("Why did you choose that approach?")
- Domain-aware context injection for SAP, Healthcare, IT Operations, Government
- Configurable depth levels (1-5) per survey
- Automatic detection of knowledge-rich moments in conversation

#### Tacit Knowledge Score (TK-Score)
- Multi-dimensional scoring: depth (0-100), uniqueness (0-100), actionability (0-100)
- Composite score calculation with weighted formula
- Real-time scoring during conversation via AI analysis
- Dashboard visualization with per-response and per-survey aggregation

#### Knowledge Graph Integration
- Automatic entity extraction from survey responses
- Node types: CONCEPT, SKILL, PROCESS, TOOL, PERSON, DECISION, EXPERIENCE
- Edge types: RELATES_TO, DEPENDS_ON, LEADS_TO, CONTRADICTS, ENABLES, REQUIRES, PART_OF
- Graph CRUD API with query capabilities
- Entity-to-graph pipeline in conversation flow

#### Expert Profile System
- Automatic expert identification from high-TK responses
- Risk assessment for knowledge holders (LOW, MEDIUM, HIGH, CRITICAL)
- Domain expertise tracking and availability status
- Integration-ready for learning.me module

#### Domain-Specific Survey Templates
- **SAP Knowledge Capture**: Module expertise, customization rationale, integration patterns, migration lessons
- **Healthcare**: Clinical decision-making, patient safety protocols, interdisciplinary coordination
- **IT Operations**: Incident resolution, system architecture decisions, automation strategies
- **Government**: Policy implementation, stakeholder management, regulatory compliance
- **General Knowledge**: Cross-domain tacit knowledge extraction

#### Knowledge-OS Event Bus
- Event publishing for cross-module communication
- Event types: KNOWLEDGE_CAPTURED, EXPERT_IDENTIFIED, GRAPH_UPDATED, INSIGHT_GENERATED
- Webhook-based integration with EDI and learning.me
- Retry logic with exponential backoff

### ✨ Enhancements (from v1.69)

#### Conversation Engine
- Enhanced AI prompts with domain context injection
- Quality analysis for each response (relevance, depth, completeness)
- Automatic language detection and context-aware follow-ups
- Multi-session support for longitudinal knowledge capture

#### Admin Dashboard
- 11-tab interface: Surveys, Questions, Responses, Analysis, AI Analysis, Free Prompt, Users, Translations, Voice Agent, TK Score, Knowledge Graph
- Tacit Knowledge Score dashboard with visual indicators
- Knowledge Graph viewer (placeholder for D3/Cytoscape integration)
- Expert profile management
- Integration status monitoring

#### API Expansion
- `POST /api/admin/knowledge-graph` — Graph CRUD operations
- `GET /api/admin/tacit-score` — TK-Score aggregation and analytics
- `GET /api/admin/expert-profiles` — Expert discovery and management
- `POST /api/admin/integration` — Knowledge-OS module integration control
- Enhanced `/api/conversation` with KG extraction and TK scoring

#### Internationalization
- 7 languages: Dutch, German, English, French, Spanish, Portuguese, Italian
- Dynamic translation with MD5-based caching
- Language context provider for client-side components

#### Infrastructure
- Docker multi-stage build with Prisma support
- docker-compose with PostgreSQL service
- GitHub Actions CI/CD pipeline
- Vitest test suite with API and unit tests
- Comprehensive seed data scripts

### 🔧 Technical Changes

#### Database Schema
- Added `ExpertProfile` model with risk assessment
- Added `KnowledgeNode` and `KnowledgeEdge` models for graph storage
- Added `KnowledgeOSEvent` model for event tracking
- Added enums: `ExpertRisk`, `KnowledgeNodeType`, `KnowledgeEdgeType`
- Added `tacitKnowledgeScore`, `tacitScoreDepth`, `tacitScoreUniqueness`, `tacitScoreActionability` to `Response` model
- Added `domainTemplate`, `whyProtocolDepth` to `Survey` model

#### Dependencies
- Next.js 14.2.x with App Router
- Prisma 5.x ORM
- NextAuth.js 4.x with credentials provider
- Tailwind CSS 3.4.x + shadcn/ui components
- OpenAI SDK 4.x for AI conversations
- Recharts for dashboard visualizations

---

## [1.69.0] - 2026-03-xx (Previous Release)

### Features
- Conversational AI survey engine with GPT-4.1-mini
- Multi-language support (NL, DE, EN, FR, ES, PT, IT)
- VAPI voice agent integration
- Admin dashboard with survey management
- Response analysis with GPT-4o
- CSV/JSON export functionality
- Dynamic question flows
- Real-time translation system
- Phone-based survey collection

### Models (16)
- User, Account, Session, VerificationToken
- Survey, Question, QuestionTranslation
- Response, Answer, ConversationMessage
- Analysis, AdminQuestion
- VoiceAgentQuestion, VapiCallLog, PhoneRespondent
- DynamicTranslation

---

## [1.0.0] - 2025-xx-xx (Initial Release)

### Features
- Basic survey creation and management
- AI-powered conversational interviews
- Admin panel with authentication
- Response collection and viewing
- Multi-language foundation
