# AIsurvey.me v2.0 — Feature Implementation Guide

## Why-Protocol Engine

### Overview
The Why-Protocol is a conversational AI technique that automatically generates follow-up "why" questions to extract tacit knowledge. When a respondent gives a surface-level answer, the engine probes deeper.

### Implementation

**Location:** `lib/ai-helper.ts` → `generateWhyFollowUp()`

**How it works:**
1. User answers a survey question
2. AI analyzes the response for depth and knowledge signals
3. If the response contains actionable knowledge but lacks explanation, the Why-Protocol activates
4. A contextual follow-up is generated: "You mentioned X — why did you choose that approach over alternatives?"
5. This continues up to `whyProtocolDepth` levels (configurable per survey, default: 3)

**Configuration:**
```typescript
// In Survey model
whyProtocolDepth: 3  // 1-5, higher = deeper probing
domainTemplate: 'sap-knowledge'  // Adds domain-specific context
```

**Domain Context:**
Each domain template injects specialized context into the AI prompt:
- SAP: module names, transaction codes, customization terminology
- Healthcare: clinical protocols, patient safety, evidence-based practice
- IT Ops: ITIL framework, incident management, SLA terminology
- Government: policy frameworks, regulatory compliance, stakeholder mapping

### Customization
To add a new domain template:
1. Create `lib/question-flows/your-domain.ts`
2. Define question flow with domain-specific questions
3. Add domain context strings for AI prompts
4. Register in `lib/question-flow.ts` → `getFlowForTemplate()`

---

## Tacit Knowledge Score (TK-Score)

### Overview
A multi-dimensional scoring system that quantifies the tacit knowledge value of each survey response.

### Dimensions

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| Depth | 40% | How deep the knowledge goes (surface vs. expert-level) |
| Uniqueness | 35% | How rare/unique the knowledge is |
| Actionability | 25% | How directly applicable the knowledge is |

### Calculation

**Location:** `lib/ai-helper.ts` → `calculateTacitKnowledgeScore()`

```typescript
composite = (depth * 0.4) + (uniqueness * 0.35) + (actionability * 0.25)
```

The AI evaluates each dimension on a 0-100 scale based on:
- **Depth signals:** Technical detail, cause-effect reasoning, edge cases mentioned
- **Uniqueness signals:** Non-obvious insights, personal experience, counter-intuitive findings
- **Actionability signals:** Step-by-step knowledge, decision criteria, concrete examples

### Integration Points
- Stored on `Response` model after conversation completion
- Displayed in admin dashboard TK-Score tab
- Used to identify expert profiles (high TK-score → potential expert)
- Published as Knowledge-OS events for cross-module use

---

## Knowledge Graph

### Overview
Automatic extraction of knowledge entities and relationships from survey responses, stored as a graph structure.

### Architecture

**Location:** `lib/knowledge-graph.ts`

```
Survey Response → AI Entity Extraction → KnowledgeNode + KnowledgeEdge → Graph Storage
```

### Node Types
- **CONCEPT**: Abstract ideas, methodologies, frameworks
- **SKILL**: Specific competencies and abilities
- **PROCESS**: Workflows, procedures, sequences
- **TOOL**: Software, hardware, instruments
- **PERSON**: Individuals (anonymized) with specific knowledge
- **DECISION**: Key decision points and their rationale
- **EXPERIENCE**: Specific experiences that shaped knowledge

### Edge Types
- **RELATES_TO**: General association
- **DEPENDS_ON**: Prerequisite relationship
- **LEADS_TO**: Causal or sequential relationship
- **CONTRADICTS**: Conflicting knowledge
- **ENABLES**: One thing makes another possible
- **REQUIRES**: Mandatory dependency
- **PART_OF**: Hierarchical containment

### Future Visualization
The admin dashboard includes a placeholder for graph visualization. Recommended libraries:
- **D3.js** — Full control, complex but powerful
- **Cytoscape.js** — Purpose-built for graphs
- **React Flow** — React-native graph rendering

---

## Expert Profile System

### Overview
Automatic identification of knowledge experts based on survey responses and TK-scores.

### Risk Assessment

| Risk Level | Criteria | Action |
|------------|----------|--------|
| LOW | Expert has documented their knowledge | Monitor |
| MEDIUM | Partial documentation, knowledge transferable | Plan transfer |
| HIGH | Critical knowledge, limited documentation | Urgent: schedule knowledge capture |
| CRITICAL | Single point of failure, no backup | Emergency: immediate capture + cross-training |

### Identification Logic
1. Response TK-Score > 75 → Flag respondent as potential expert
2. Multiple high-score sessions → Confirm expert status
3. Domain extraction from responses → Map expertise areas
4. Risk assessment based on uniqueness scores and domain coverage

---

## Knowledge-OS Integration

### Event-Driven Architecture

**Location:** `lib/knowledge-os-integration.ts`

```
AIsurvey.me → Event Bus → EDI / learning.me
```

### Event Types

| Event | Trigger | Consumers |
|-------|---------|----------|
| KNOWLEDGE_CAPTURED | Survey response completed | EDI, learning.me |
| EXPERT_IDENTIFIED | Expert profile created/updated | EDI, HR systems |
| GRAPH_UPDATED | New nodes/edges added | Knowledge Graph UI |
| INSIGHT_GENERATED | AI analysis completed | learning.me, reports |

### Integration Configuration

Set in `.env`:
```env
KNOWLEDGE_OS_WEBHOOK_URL=https://your-knowledge-os.com/webhook
KNOWLEDGE_OS_API_KEY=your-api-key
```

Or configure via API:
```bash
curl -X POST /api/admin/integration \
  -d '{"action": "configure", "module": "edi", "config": {"webhookUrl": "...", "apiKey": "..."}}'
```
