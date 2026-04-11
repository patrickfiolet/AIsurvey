# AIsurvey.me v2.0 — API Documentation

## Base URL

```
Production: https://aisurvey.me/api
Development: http://localhost:3000/api
```

## Authentication

All admin endpoints require NextAuth.js session authentication. Include session cookie or use Bearer token.

---

## Public Endpoints

### POST `/api/survey/submit`

Submit a completed survey response.

**Request Body:**
```json
{
  "surveyId": "string (cuid)",
  "answers": [
    {
      "questionId": "string (cuid)",
      "value": "string"
    }
  ],
  "conversationHistory": [
    {
      "role": "user | assistant",
      "content": "string"
    }
  ],
  "language": "nl | de | en | fr | es | pt | it",
  "respondentName": "string (optional)",
  "respondentEmail": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "responseId": "string",
  "tacitKnowledgeScore": 75.5
}
```

---

### POST `/api/conversation`

Send a message in an AI conversation and receive a response.

**Request Body:**
```json
{
  "surveyId": "string (cuid)",
  "message": "string",
  "conversationHistory": [
    { "role": "user | assistant", "content": "string" }
  ],
  "language": "nl",
  "currentQuestionIndex": 0,
  "responseId": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "reply": "string",
  "isComplete": false,
  "currentQuestionIndex": 1,
  "qualityScore": {
    "relevance": 0.85,
    "depth": 0.72,
    "completeness": 0.90
  },
  "entitiesExtracted": ["SAP MM", "procurement process"],
  "tacitScoreUpdate": {
    "depth": 68,
    "uniqueness": 72,
    "actionability": 65,
    "composite": 68.3
  }
}
```

---

### POST `/api/signup`

Register a new admin user.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

---

## Admin Endpoints

> All require authenticated session (role: ADMIN or SUPER_ADMIN)

### Surveys

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/surveys` | List all surveys |
| POST | `/api/admin/surveys` | Create new survey |
| GET | `/api/admin/surveys/[id]` | Get survey details |
| PUT | `/api/admin/surveys/[id]` | Update survey |
| DELETE | `/api/admin/surveys/[id]` | Delete survey |
| POST | `/api/admin/surveys/[id]/toggle` | Toggle survey active status |
| POST | `/api/admin/surveys/[id]/duplicate` | Duplicate a survey |

**Create Survey Body (v2.0 additions):**
```json
{
  "title": "string",
  "description": "string",
  "language": "nl",
  "domainTemplate": "sap-knowledge | healthcare | it-operations | government | general",
  "whyProtocolDepth": 3
}
```

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/questions?surveyId=xxx` | List questions for survey |
| POST | `/api/admin/questions` | Create question |
| PUT | `/api/admin/questions/[id]` | Update question |
| DELETE | `/api/admin/questions/[id]` | Delete question |

### Responses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/responses?surveyId=xxx` | List responses |
| GET | `/api/admin/responses/export?surveyId=xxx&format=csv` | Export responses |

### Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/analyze` | Run AI analysis on responses |
| GET | `/api/admin/analyses?surveyId=xxx` | List saved analyses |
| POST | `/api/admin/free-prompt` | Free-form AI prompt on response data |

### Users & Translations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List admin users |
| GET | `/api/admin/translations` | Get translations |
| POST | `/api/admin/translate-dynamic` | Translate dynamic content |

### Voice Agent

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/voice-agent-questions` | Manage voice agent questions |
| POST | `/api/vapi/assistant` | VAPI assistant configuration |
| POST | `/api/vapi/phone` | Initiate phone call |
| POST | `/api/vapi/webhook` | VAPI event webhook |

---

## v2.0 New Endpoints

### Knowledge Graph

#### GET `/api/admin/knowledge-graph`

Query knowledge graph nodes and edges.

**Query Parameters:**
- `surveyId` (optional) — Filter by survey
- `type` (optional) — Filter by node type
- `search` (optional) — Search node labels
- `limit` (default: 100)

**Response:**
```json
{
  "nodes": [
    {
      "id": "string",
      "label": "SAP MM Module",
      "type": "CONCEPT",
      "properties": {},
      "surveyId": "string",
      "createdAt": "ISO date"
    }
  ],
  "edges": [
    {
      "id": "string",
      "sourceId": "string",
      "targetId": "string",
      "type": "RELATES_TO",
      "weight": 0.85,
      "properties": {}
    }
  ],
  "stats": {
    "totalNodes": 150,
    "totalEdges": 280,
    "nodesByType": { "CONCEPT": 45, "SKILL": 30 }
  }
}
```

#### POST `/api/admin/knowledge-graph`

Add nodes/edges to the knowledge graph.

**Request Body:**
```json
{
  "action": "addNode | addEdge | deleteNode | deleteEdge",
  "data": { ... }
}
```

---

### Tacit Knowledge Score

#### GET `/api/admin/tacit-score`

Get TK-Score analytics.

**Query Parameters:**
- `surveyId` (optional)
- `responseId` (optional)
- `aggregate` — `survey | response | overall`

**Response:**
```json
{
  "scores": [
    {
      "responseId": "string",
      "depth": 72,
      "uniqueness": 68,
      "actionability": 80,
      "composite": 73.2,
      "respondentName": "string"
    }
  ],
  "aggregation": {
    "avgComposite": 65.4,
    "maxComposite": 92.1,
    "minComposite": 23.0,
    "totalResponses": 45,
    "highValueResponses": 12
  }
}
```

---

### Expert Profiles

#### GET `/api/admin/expert-profiles`

List identified knowledge experts.

**Query Parameters:**
- `domain` (optional) — Filter by domain
- `risk` (optional) — Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)

**Response:**
```json
{
  "experts": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "domains": ["SAP MM", "Procurement"],
      "tacitScore": 85.2,
      "riskLevel": "HIGH",
      "totalSessions": 5,
      "lastActive": "ISO date"
    }
  ]
}
```

#### POST `/api/admin/expert-profiles`

Create or update an expert profile.

---

### Integration

#### POST `/api/admin/integration`

Manage Knowledge-OS integrations.

**Request Body:**
```json
{
  "action": "status | configure | test | sync",
  "module": "edi | learning-me | knowledge-graph",
  "config": { ... }
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

| Status Code | Meaning |
|-------------|--------|
| 400 | Bad Request — Invalid parameters |
| 401 | Unauthorized — No valid session |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## Rate Limiting

- Public endpoints: 60 requests/minute per IP
- Admin endpoints: 120 requests/minute per session
- AI conversation: 30 requests/minute per session
