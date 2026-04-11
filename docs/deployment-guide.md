# AIsurvey.me v2.0 — Deployment Guide

## Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- PostgreSQL 14+
- OpenAI API key (GPT-4.1-mini + GPT-4o access)
- VAPI account (for voice agent features)

## Local Development

### 1. Clone and Install

```bash
git clone <repo-url> aisurvey-v2
cd aisurvey-v2
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/aisurvey"
NEXTAUTH_SECRET="your-secret-key"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."
```

### 3. Database Setup

```bash
# Start PostgreSQL (or use docker-compose)
docker-compose up -d postgres

# Run migrations
npx prisma migrate dev

# Seed initial data
npx tsx scripts/seed.ts
```

### 4. Start Development Server

```bash
npm run dev
# → http://localhost:3000
```

## Docker Deployment

### Using docker-compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed data
docker-compose exec app npx tsx scripts/seed.ts
```

The app will be available at `http://localhost:3000`.

### Using Dockerfile directly

```bash
# Build
docker build -t aisurvey-v2 .

# Run (provide DATABASE_URL to external PostgreSQL)
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e OPENAI_API_KEY="..." \
  aisurvey-v2
```

## Production Deployment

### Vercel (Recommended for Next.js)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Use Vercel Postgres or external PostgreSQL (e.g., Supabase, Neon)
5. Deploy

**Important Vercel settings:**
- Build Command: `npx prisma generate && next build`
- Output Directory: `.next`
- Node.js Version: 20.x

### VPS / Bare Metal

```bash
# Install dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Build
npm run build

# Start with PM2
pm2 start npm --name aisurvey -- start
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name aisurvey.me;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Session encryption key |
| `NEXTAUTH_URL` | ✅ | Base URL of the application |
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `VAPI_API_KEY` | Optional | VAPI voice agent API key |
| `VAPI_PHONE_NUMBER_ID` | Optional | VAPI phone number ID |
| `ABACUS_CONVERSATION_URL` | Optional | Abacus.AI conversation endpoint |
| `ABACUS_ANALYSIS_URL` | Optional | Abacus.AI analysis endpoint |
| `KNOWLEDGE_OS_WEBHOOK_URL` | Optional | Knowledge-OS event webhook |
| `KNOWLEDGE_OS_API_KEY` | Optional | Knowledge-OS API key |

## Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Database connectivity
npx prisma db pull --print
```

## Troubleshooting

### Common Issues

**Prisma migration fails:**
```bash
npx prisma migrate reset  # ⚠️ Destroys all data
npx prisma migrate dev
```

**OpenAI rate limits:**
- Implement request queuing in production
- Use GPT-4.1-mini for conversations (cheaper)
- Reserve GPT-4o for analysis operations

**VAPI webhook not receiving events:**
- Ensure webhook URL is publicly accessible
- Check VAPI dashboard for webhook delivery logs
- Verify POST endpoint returns 200 status
