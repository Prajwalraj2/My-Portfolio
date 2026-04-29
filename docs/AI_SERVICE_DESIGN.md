# AI Service Design Document

> **Version:** 1.0  
> **Last Updated:** April 2026  
> **Status:** Implementation Starting

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture Flow](#2-architecture-flow)
3. [Technology Choices](#3-technology-choices)
4. [Chat Session Management](#4-chat-session-management)
5. [Implementation Plan](#5-implementation-plan)
6. [File Structure](#6-file-structure)
7. [API Endpoints](#7-api-endpoints)
8. [Future Enhancements](#8-future-enhancements)

---

## 1. Overview

### What We're Building (Phase 1)

A basic AI chat service that:
- Uses **OpenAI GPT-4o** for responses
- **Streams responses** in real-time (typing effect)
- **Persists chat history** for both guests and logged-in users
- Runs as a **separate Python service** (FastAPI)

### What We're NOT Building Yet

- RAG (Retrieval Augmented Generation) - Later
- Agent tools (calendar, email, etc.) - Later
- MCP Server - Later
- pgvector embeddings - Later

---

## 2. Architecture Flow

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│   API Gateway   │────▶│   AI Service    │
│   (Next.js)     │     │   (Fastify)     │     │   (FastAPI)     │
│   Port: 3000    │◀────│   Port: 8000    │◀────│   Port: 8001    │
└─────────────────┘ SSE └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │   OpenAI    │
                                                 │   GPT-4o    │
                                                 └─────────────┘
```

### Detailed Request Flow

```
USER                 FRONTEND              API GATEWAY           AI SERVICE            OPENAI
 │                      │                      │                      │                   │
 │ 1. Types message     │                      │                      │                   │
 │─────────────────────▶│                      │                      │                   │
 │                      │ 2. POST /api/chat/stream                    │                   │
 │                      │─────────────────────▶│                      │                   │
 │                      │                      │ 3. POST /chat/stream │                   │
 │                      │                      │─────────────────────▶│                   │
 │                      │                      │                      │ 4. Call OpenAI    │
 │                      │                      │                      │──────────────────▶│
 │                      │                      │                      │                   │
 │                      │                      │                      │ 5. Stream tokens  │
 │                      │                      │                      │◀──────────────────│
 │                      │                      │ 6. SSE events        │                   │
 │                      │                      │◀─────────────────────│                   │
 │                      │ 7. Pass through SSE  │                      │                   │
 │                      │◀─────────────────────│                      │                   │
 │ 8. UI updates live   │                      │                      │                   │
 │◀─────────────────────│                      │                      │                   │
```

### Why This Architecture?

| Question | Answer |
|----------|--------|
| Why not call OpenAI from Frontend? | API key would be exposed in browser |
| Why not call OpenAI from API Gateway? | Python has better AI ecosystem; keeps concerns separated |
| Why separate AI Service? | Can scale independently; easier to add RAG, tools later |
| Why SSE (Server-Sent Events)? | Enables real-time streaming (typing effect) |

---

## 3. Technology Choices

### AI Service Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| Language | Python 3.12 | Best AI/ML ecosystem |
| Framework | FastAPI | Async, fast, great OpenAPI docs |
| LLM Provider | OpenAI GPT-4o | Best general performance |
| Streaming | SSE (sse-starlette) | Real-time token streaming |
| Package Manager | uv | Fast, modern Python tooling |

### Ports

| Service | Port |
|---------|------|
| Frontend (Next.js) | 3000 |
| API Gateway (Fastify) | 8000 |
| AI Service (FastAPI) | 8001 |

---

## 4. Chat Session Management

### Guest User (Not Logged In)

```
1. First message → API creates ChatSession with userId=null, stores guestIp
2. Response includes session_id
3. Frontend stores session_id in localStorage
4. Subsequent messages include session_id
5. Sessions expire after 24 hours
6. Rate limit: 5 messages/day (by IP)
```

### Logged In User

```
1. JWT token sent in Authorization header
2. First message → API creates ChatSession with userId from JWT
3. All sessions linked to user account (permanent)
4. Can view history from any device
5. Rate limit: Unlimited (or higher limit)
```

### Database Schema

```prisma
model ChatSession {
  id           String        @id @default(uuid())
  userId       String?       @map("user_id")      // For logged-in users
  guestIp      String?       @map("guest_ip")     // For guests
  title        String?                             // Auto from first message
  status       String        @default("active")
  messageCount Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  expiresAt    DateTime?                           // Guest session expiry
  
  messages     ChatMessage[]
  
  @@index([userId])
  @@index([guestIp])
  @@map("chat_sessions")
}

model ChatMessage {
  id         String      @id @default(uuid())
  sessionId  String      @map("session_id")
  role       String      // "user" | "assistant"
  content    String
  tokensUsed Int?        @map("tokens_used")
  latencyMs  Int?        @map("latency_ms")
  createdAt  DateTime    @default(now())
  
  session    ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@index([sessionId, createdAt])
  @@map("chat_messages")
}
```

### Comparison Table

| Feature | Guest | Logged In |
|---------|-------|-----------|
| Session Storage | localStorage + DB | DB (linked to userId) |
| History Duration | 24 hours | Permanent |
| Cross-device | No | Yes |
| Rate Limit | 5/day | Unlimited |
| Can Resume Chat | Same browser only | Any device |

---

## 5. Implementation Plan

### Phase 1: Basic Chat (Current)

| Step | Task | Files |
|------|------|-------|
| 1 | Set up Python environment | `apps/ai-service/` |
| 2 | Create FastAPI app with health endpoints | `main.py`, `health.py` |
| 3 | Add OpenAI streaming chat | `llm.py`, `chat.py` |
| 4 | Update database schema | `schema.prisma` |
| 5 | Add API Gateway chat routes | `routes/chat.ts` |
| 6 | Create frontend chat UI | `app/chat/page.tsx` |
| 7 | Test end-to-end | Manual testing |

### Phase 2: RAG (Future)

- Add pgvector extension to Neon
- Create embeddings for portfolio content
- Implement semantic search
- Add rag_tool to agent

### Phase 3: Agent Tools (Future)

- portfolio_tool - Query projects/skills
- github_tool - Fetch repos, stars
- lead_capture_tool - Save inquiries
- calendar_tool - Check availability
- email_tool - Send notifications

### Phase 4: MCP Server (Future)

- Public endpoint at mcp.prajwalraj.me
- External clients can query portfolio
- Tools: get_projects, get_skills, search_portfolio

---

## 6. File Structure

### AI Service

```
apps/ai-service/
├── pyproject.toml              # Dependencies
├── .env.example                # Environment template
├── .env                        # Local env (gitignored)
├── .python-version             # Python 3.12
├── Dockerfile                  # Container build
├── README.md                   # Documentation
│
└── src/
    ├── __init__.py
    ├── main.py                 # FastAPI entry point
    ├── config.py               # Settings
    │
    ├── api/
    │   ├── __init__.py
    │   └── routes/
    │       ├── __init__.py
    │       ├── health.py       # GET /health, /ready
    │       └── chat.py         # POST /chat/stream
    │
    ├── services/
    │   ├── __init__.py
    │   └── llm.py              # OpenAI client
    │
    ├── models/
    │   ├── __init__.py
    │   └── schemas.py          # Pydantic models
    │
    └── core/
        ├── __init__.py
        └── prompts.py          # System prompts
```

### Frontend Chat Components

```
apps/web/
├── app/chat/page.tsx           # Chat page
├── components/chat/
│   ├── ChatContainer.tsx       # Main wrapper
│   ├── ChatInput.tsx           # Message input
│   ├── ChatMessage.tsx         # Message bubble
│   └── ChatMessages.tsx        # Message list
└── hooks/useChat.ts            # Chat state hook
```

---

## 7. API Endpoints

### AI Service (Port 8001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Liveness probe |
| GET | `/ready` | Readiness probe |
| POST | `/chat/stream` | Stream chat response (SSE) |

### API Gateway Chat Routes (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/stream` | Proxy to AI service |
| GET | `/api/chat/sessions` | Get user's sessions (auth required) |
| GET | `/api/chat/sessions/:id` | Get session messages |
| DELETE | `/api/chat/sessions/:id` | Delete session |

### Request/Response Examples

#### POST /chat/stream

Request:
```json
{
  "messages": [
    {"role": "user", "content": "What projects has Prajwal built?"}
  ],
  "session_id": null
}
```

Response (SSE):
```
event: delta
data: {"content": "Prajwal"}

event: delta
data: {"content": " has"}

event: delta
data: {"content": " built"}

event: done
data: {"session_id": "abc-123", "tokens_used": 150}
```

---

## 8. Future Enhancements

### RAG Pipeline (Phase 2)

```
Documents (resume.md, projects data)
    │
    ▼
Chunking (500 tokens, 100 overlap)
    │
    ▼
OpenAI Embeddings (text-embedding-3-small)
    │
    ▼
pgvector (HNSW index)
    │
    ▼
Query → Embed → Similarity Search → Top-K
    │
    ▼
LLM + Context → Response
```

### Agent Tools (Phase 3)

```
rag_tool          → Search portfolio knowledge
github_tool       → Fetch repos, stars, READMEs
portfolio_tool    → Query projects/skills from API
calendar_tool     → Check availability, book meetings
lead_capture_tool → Save inquiry to DB
email_tool        → Send via SendGrid
slack_tool        → Post to Slack webhook
```

### MCP Server (Phase 4)

```
mcp.prajwalraj.me
├── get_projects()      → Returns all projects
├── get_skills()        → Returns skills
├── get_experience()    → Returns work history
├── search_portfolio()  → Semantic search
└── get_contact_info()  → Contact details
```

---

## Environment Variables

```bash
# AI Service (.env)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
ENVIRONMENT=development
PORT=8001

# API Gateway (.env) - Add these
AI_SERVICE_URL=http://127.0.0.1:8001
```

---

*Document maintained by: Prajwal Raj*  
*Created: April 2026*
