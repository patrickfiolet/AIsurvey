# AIsurvey.me v2.0 — Knowledge-OS Integration Guide

## Architecture Overview

AIsurvey.me is one module in the Knowledge-OS ecosystem:

```
┌─────────────────────────────────────────────────┐
│                  Knowledge-OS                    │
│                                                  │
│  ┌──────────────┐  ┌──────┐  ┌──────────────┐  │
│  │ AIsurvey.me  │  │ EDI  │  │ learning.me  │  │
│  │              │  │      │  │              │  │
│  │ Tacit Know-  │  │Expert│  │ Learning     │  │
│  │ ledge Capture│→ │Direct│→ │ Path         │  │
│  │              │  │ory   │  │ Generation   │  │
│  └──────────────┘  └──────┘  └──────────────┘  │
│         ↕              ↕           ↕            │
│  ┌──────────────────────────────────────────┐   │
│  │         Knowledge Graph (Shared)         │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Module Responsibilities

### AIsurvey.me (This Module)
- **Primary:** Capture tacit knowledge through AI-driven surveys
- **Outputs:** Survey responses, TK-Scores, Knowledge Graph nodes, Expert candidates
- **Events emitted:** KNOWLEDGE_CAPTURED, EXPERT_IDENTIFIED, GRAPH_UPDATED, INSIGHT_GENERATED

### EDI (Expert Directory Index)
- **Primary:** Maintain expert profiles and availability
- **Consumes from AIsurvey:** Expert candidates, domain expertise data
- **Provides to AIsurvey:** Expert validation, cross-reference data

### learning.me
- **Primary:** Generate personalized learning paths from captured knowledge
- **Consumes from AIsurvey:** Knowledge Graph data, TK-scored content
- **Provides to AIsurvey:** Learning gap analysis, knowledge demand signals

## Integration Patterns

### 1. Event-Based (Primary)

AIsurvey publishes events to a webhook endpoint. Each event contains:

```json
{
  "eventId": "unique-id",
  "eventType": "KNOWLEDGE_CAPTURED",
  "timestamp": "2026-04-11T10:00:00Z",
  "source": "aisurvey",
  "payload": {
    "surveyId": "...",
    "responseId": "...",
    "tacitScore": 78.5,
    "domains": ["SAP MM", "Procurement"],
    "entities": ["invoice verification", "GR/IR clearing"]
  }
}
```

**Setup:**
```bash
# Configure webhook in AIsurvey
curl -X POST https://aisurvey.me/api/admin/integration \
  -H "Authorization: Bearer <token>" \
  -d '{
    "action": "configure",
    "module": "edi",
    "config": {
      "webhookUrl": "https://edi.knowledge-os.com/webhooks/aisurvey",
      "apiKey": "edi-api-key",
      "events": ["KNOWLEDGE_CAPTURED", "EXPERT_IDENTIFIED"]
    }
  }'
```

### 2. API-Based (On-Demand)

Other modules can query AIsurvey's API directly:

```bash
# Get knowledge graph for a domain
GET /api/admin/knowledge-graph?type=CONCEPT&search=SAP

# Get expert profiles by risk level
GET /api/admin/expert-profiles?risk=CRITICAL

# Get TK-Score analytics
GET /api/admin/tacit-score?aggregate=survey&surveyId=xxx
```

### 3. Shared Knowledge Graph

All modules read/write to the same Knowledge Graph structure. AIsurvey creates nodes from survey responses; EDI enriches with expert metadata; learning.me adds learning path connections.

**Node ownership:** Each node has a `source` property indicating which module created it.

## Implementing a New Module Integration

### Step 1: Register Webhook

```typescript
// In the consuming module
const registerWithAISurvey = async () => {
  const response = await fetch('https://aisurvey.me/api/admin/integration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      action: 'configure',
      module: 'your-module-name',
      config: {
        webhookUrl: 'https://your-module.com/webhooks/aisurvey',
        apiKey: 'your-webhook-secret',
        events: ['KNOWLEDGE_CAPTURED', 'GRAPH_UPDATED']
      }
    })
  });
};
```

### Step 2: Handle Events

```typescript
// Webhook handler in your module
app.post('/webhooks/aisurvey', async (req, res) => {
  const { eventType, payload } = req.body;
  
  switch (eventType) {
    case 'KNOWLEDGE_CAPTURED':
      await processNewKnowledge(payload);
      break;
    case 'EXPERT_IDENTIFIED':
      await updateExpertDirectory(payload);
      break;
    case 'GRAPH_UPDATED':
      await syncKnowledgeGraph(payload);
      break;
  }
  
  res.status(200).json({ received: true });
});
```

### Step 3: Query AIsurvey Data

```typescript
// Fetch knowledge graph data
const getKnowledgeNodes = async (domain: string) => {
  const response = await fetch(
    `https://aisurvey.me/api/admin/knowledge-graph?search=${domain}`,
    { headers: { 'Authorization': `Bearer ${apiKey}` } }
  );
  return response.json();
};
```

## Data Flow Examples

### Survey → EDI Flow
1. Employee completes AIsurvey on SAP knowledge
2. TK-Score calculated: 85 (high value)
3. AIsurvey emits `EXPERT_IDENTIFIED` event
4. EDI receives event, creates/updates expert profile
5. EDI marks employee as "SAP MM Expert" with risk level

### Survey → learning.me Flow  
1. Multiple surveys reveal knowledge gap in "SAP S/4HANA migration"
2. AIsurvey emits `INSIGHT_GENERATED` with gap analysis
3. learning.me receives insight, generates learning path
4. Learning path includes content from high-TK survey responses
5. learning.me suggests peer connections based on expert profiles

## Security

- All inter-module communication uses API keys
- Webhook payloads are signed with HMAC-SHA256
- PII is minimized in events (IDs only, not full names/emails)
- Each module has scoped access (read-only or read-write per resource)

## Monitoring

Event delivery status is tracked in the `KnowledgeOSEvent` table:
- `pending`: Event created, not yet sent
- `delivered`: Successfully sent to webhook
- `failed`: Delivery failed (will retry with exponential backoff)
- `processed`: Confirmed processed by consuming module

View event status:
```bash
GET /api/admin/integration -d '{"action": "status"}'
```
