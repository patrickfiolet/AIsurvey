# 🧠 AIsurvey.me v2.0

> AI-Driven Tacit Knowledge Extraction Platform — Part of [Knowledge-OS](https://knowledge-os.net)

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-proprietary-red.svg)]()
[![Stack](https://img.shields.io/badge/stack-Next.js%2014%20%2B%20Prisma%20%2B%20Abacus.AI-green.svg)]()

## Overview

AIsurvey.me is an AI-powered survey platform that goes beyond traditional surveys to capture **tacit knowledge** — the undocumented decisions, workarounds, exceptions, and institutional memory that lives in people's heads. Built as a core component of the Knowledge-OS ecosystem.

### Three Modes of Knowledge Capture

| Mode | Description | Technology |
|------|-------------|------------|
| **Conversational AI** | Intelligent chatbot with Why-Protocol | Abacus.AI (GPT-4.1-mini) |
| **Voice Agent** | Phone-based interviews | VAPI (Deepgram + ElevenLabs) |
| **Static Survey** | Traditional form-based questionnaires | Next.js Forms |

### v2.0 New Features

- 🧠 **"Why-Protocol"** — AI probes for decision context, workarounds, and exceptions
- 🎯 **Domain Templates** — SAP, Healthcare, IT Operations, Government-specific question sets
- 📊 **Tacit Knowledge Score** — Measure implicit vs. explicit knowledge capture (0-100)
- 🔗 **Knowledge Graph** — Connect entities into a searchable knowledge network
- 👤 **Expert Profiles** — Multi-session knowledge dossiers per expert
- ↔️ **Knowledge-OS Integration** — Event-based integration with EDI and learning.me

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router, RSC) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (JWT) |
| AI/LLM | Abacus.AI API (GPT-4.1-mini, GPT-4o) |
| Voice | VAPI (Deepgram Nova-2 STT, 11Labs TTS) |
| UI | Tailwind CSS + shadcn/ui + Framer Motion |
| Testing | Vitest + Testing Library |
| Export | xlsx (Excel), jsPDF (PDF) |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd aisurvey-v2
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database URL and API keys

# 3. Setup database
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Start development server
npm run dev
```

### Docker Setup

```bash
docker-compose up -d
```

### Login Credentials (Seed Data)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aisurvey.me | admin123 |
| Editor | editor@aisurvey.me | editor123 |

## Project Structure

```
aisurvey-v2/
├── prisma/
│   └── schema.prisma          # Database models (22 models, 10 enums)
├── app/
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   ├── survey/page.tsx        # Survey interface (all 3 modes)
│   ├── admin/
│   │   ├── page.tsx           # Admin dashboard (11 tabs)
│   │   └── login/page.tsx     # Admin login
│   └── api/
│       ├── auth/              # NextAuth
│       ├── conversation/      # 🔑 Conversational AI API
│       ├── survey/submit/     # Static survey submission
│       ├── admin/             # All admin CRUD APIs
│       │   ├── surveys/       # Survey management
│       │   ├── analyze/       # AI analysis (streaming)
│       │   ├── knowledge-graph/ # v2.0: Knowledge graph API
│       │   ├── tacit-score/   # v2.0: Tacit score dashboard
│       │   ├── expert-profiles/ # v2.0: Expert profiles
│       │   └── integration/   # v2.0: Knowledge-OS integration
│       └── vapi/              # VAPI webhook + config
├── lib/
│   ├── ai-helper.ts           # 🔑 AI engine (Why-Protocol)
│   ├── question-flow.ts       # Question engine + templates
│   ├── question-flows/        # Domain-specific templates
│   │   ├── sap-knowledge.ts   # SAP template
│   │   ├── healthcare.ts      # Healthcare template
│   │   ├── it-operations.ts   # IT Ops template
│   │   ├── government.ts      # Government template
│   │   └── general-knowledge.ts
│   ├── knowledge-graph.ts     # Knowledge graph service
│   ├── knowledge-os-integration.ts # Integration layer
│   ├── i18n.ts                # 7-language translations
│   ├── translations.ts        # Dynamic translation engine
│   ├── auth.ts                # NextAuth config
│   ├── db.ts                  # Prisma singleton
│   ├── types.ts               # TypeScript interfaces
│   └── utils.ts               # Utility functions
├── components/
│   ├── admin/                 # Admin dashboard components
│   ├── survey/                # Survey interface components
│   ├── providers/             # Context providers
│   └── ui/                    # shadcn/ui components
├── hooks/                     # React hooks
├── scripts/                   # Database seeds
├── docs/                      # Documentation
├── __tests__/                 # Test files
└── .github/workflows/         # CI/CD
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Browser/Phone)               │
│   Landing Page │ Survey Interface │ Admin Dashboard   │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────┐
│                 NEXT.JS APP ROUTER                    │
│   ┌─────────────────────────────────────────────┐   │
│   │              API Routes                      │   │
│   │  Auth │ Conversation │ Admin CRUD │ VAPI     │   │
│   │       │ + Why-Protocol│ + KG + TK Score      │   │
│   └───────┼──────────────┼───────────┼──────────┘   │
│           │              │           │               │
│   ┌───────▼──────────────▼───────────▼──────────┐   │
│   │                Prisma ORM                    │   │
│   └──────────────────────┬──────────────────────┘   │
└──────────────────────────┼──────────────────────────┘
          ┌────────────────┼────────────────┐
┌─────────▼────┐  ┌────────▼────┐  ┌───────▼──────┐
│  PostgreSQL  │  │ Abacus.AI   │  │   VAPI API   │
│  22 models   │  │ GPT-4.1/4o  │  │ Voice Agent  │
└──────────────┘  └─────────────┘  └──────────────┘
          │
          └─── Knowledge-OS Event Bus (future)
               ├── EDI (Document Intelligence)
               └── learning.me (E-learning)
```

## Environment Variables

See [.env.example](.env.example) for all required variables.

## API Documentation

See [docs/api-documentation.md](docs/api-documentation.md) for complete API reference.

## Contributing

1. Create a feature branch from `develop`
2. Follow TypeScript strict mode
3. Write tests for new features
4. Run `npm run lint && npm run type-check && npm test` before committing

## License

Proprietary — Filos-IT B.V. / knowledge-os.net

---

*Built with ❤️ by Filos-IT B.V. as part of the Knowledge-OS ecosystem.*
