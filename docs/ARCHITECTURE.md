# prajwalraj.me - Enterprise Portfolio Architecture

> **Version:** 1.0  
> **Last Updated:** April 2026  
> **Status:** Architecture Finalized

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Philosophy](#2-core-philosophy)
3. [Technology Stack](#3-technology-stack)
4. [Services Architecture](#4-services-architecture)
5. [AI System](#5-ai-system)
6. [Database Design](#6-database-design)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Design](#8-api-design)
9. [Infrastructure](#9-infrastructure)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Observability](#11-observability)
12. [Security](#12-security)
13. [Scalability & Reliability](#13-scalability--reliability)
14. [Cost Estimation](#14-cost-estimation)
15. [Build Phases](#15-build-phases)
16. [Monorepo Structure](#16-monorepo-structure)

---

## 1. Overview

### What We're Building

**prajwalraj.me** is an enterprise-grade portfolio website that demonstrates production engineering skills by being the proof itself — not just talking about it.

This is not a simple frontend + data portfolio. It's a complete distributed system built with:
- Microservices architecture
- AI-powered features (chatbot, semantic search, action agents)
- Full DevOps automation
- Production-grade observability
- Enterprise security

### Domain & Subdomains

| Subdomain | Service | Purpose |
|-----------|---------|---------|
| `prajwalraj.me` | Frontend | Main portfolio (Next.js) |
| `api.prajwalraj.me` | API Gateway | Central API routing |
| `ai.prajwalraj.me` | AI Service | Chat, RAG, agents |
| `mcp.prajwalraj.me` | MCP Server | Public MCP for external clients |
| `grafana.prajwalraj.me` | Grafana | Live observability (public read) |
| `argocd.prajwalraj.me` | ArgoCD | GitOps dashboard |
| `staging.prajwalraj.me` | Staging | Pre-production environment |

---

## 2. Core Philosophy

### The Portfolio IS the Proof

Every architectural decision demonstrates expertise:

| Feature | What It Proves |
|---------|----------------|
| Live AI assistant that knows you | LLM + RAG + Agentic skills |
| Public Grafana dashboard | Full observability mindset |
| Terraform repo linked in footer | IaC discipline |
| GitHub Actions workflows visible | CI/CD maturity |
| Sub-100ms TTFB globally | CDN + edge architecture |
| Architecture diagram page | Systems thinking |
| MCP server publicly accessible | MCP expertise |

### Design Principles

1. **Microservices** — Each service does one thing well
2. **GitOps** — Git is the single source of truth
3. **Infrastructure as Code** — Everything reproducible
4. **Zero Trust Security** — Defense in depth
5. **Observable by Default** — Metrics, logs, traces everywhere
6. **Automation First** — Nobody deploys manually

---

## 3. Technology Stack

### Summary Table

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion | SSR/SSG, beautiful UI |
| **API Gateway** | Node.js, Fastify, Zod | Central routing, validation |
| **AI Service** | Python, FastAPI, LangGraph | ReAct agent, RAG |
| **Other Services** | Node.js, Fastify | Contact, analytics, notifications |
| **Database** | Aurora PostgreSQL Serverless v2 | Primary data store |
| **Vector Store** | pgvector (on Aurora) | RAG embeddings |
| **Cache** | ElastiCache Redis | Sessions, rate limiting, cache |
| **Queue** | SQS + SNS | Async job processing |
| **Storage** | S3 + CloudFront | Static assets, uploads |
| **Container Registry** | AWS ECR | Docker images |
| **Orchestration** | EKS (Kubernetes 1.30) | Container orchestration |
| **IaC** | Terraform + Terragrunt | Infrastructure management |
| **GitOps** | ArgoCD | Kubernetes deployments |
| **CI/CD** | GitHub Actions | Build, test, deploy |
| **Observability** | Prometheus, Grafana, Loki, Tempo | Metrics, logs, traces |
| **Error Tracking** | Sentry | Frontend + backend errors |
| **Instrumentation** | OpenTelemetry | Auto-instrumentation |
| **CDN** | CloudFront | Global edge distribution |
| **DNS** | Route 53 | DNS management |
| **WAF** | AWS WAF | Application firewall |
| **Secrets** | AWS Secrets Manager | Secret storage |

### Language Breakdown

| Service | Language | Framework |
|---------|----------|-----------|
| frontend-service | TypeScript | Next.js 15 |
| api-gateway-service | TypeScript | Node.js + Fastify |
| ai-service | Python 3.12 | FastAPI + LangGraph |
| contact-service | TypeScript | Node.js + Fastify |
| analytics-service | TypeScript | Node.js + Fastify |
| notification-service | TypeScript | Node.js + Fastify |

---

## 4. Services Architecture

### High-Level Architecture Diagram

```
                                    INTERNET
                                        │
                                        ▼
                              ┌─────────────────┐
                              │    Route 53     │
                              │      (DNS)      │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   CloudFront    │
                              │     (CDN)       │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │    AWS WAF      │
                              │  (Firewall)     │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │      ALB        │
                              │ (Load Balancer) │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
           ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
           │   frontend    │  │  api-gateway  │  │  ai-service   │
           │   (Next.js)   │  │   (Fastify)   │  │   (FastAPI)   │
           └───────────────┘  └───────┬───────┘  └───────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
           ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
           │   contact     │  │  analytics    │  │ notification  │
           │   service     │  │   service     │  │   service     │
           └───────┬───────┘  └───────────────┘  └───────┬───────┘
                   │                                     │
                   └──────────────┬──────────────────────┘
                                  │
                                  ▼
                         ┌───────────────┐
                         │      SQS      │
                         │    (Queue)    │
                         └───────────────┘
```

### Service Details

#### 1. Frontend Service (Next.js)

**Purpose:** Pure UI rendering, no business logic

**Features:**
- Server-Side Rendering (SSR) for dynamic pages
- Static Site Generation (SSG) for content pages
- Incremental Static Regeneration (ISR) for blogs
- Edge Middleware for auth guards
- Framer Motion animations
- Dark/Light mode with system preference
- Perfect Lighthouse scores (95+)

**Pages:**
```
/                       Home (hero, skills, featured projects)
/about                  About me, story
/projects               All projects grid
/projects/:slug         Project detail
/experience             Work timeline
/skills                 Skills visualization
/testimonials           Wall of love
/contact                Contact form
/chat                   AI chat interface
/mcp                    MCP client (auth required)
/login                  OAuth login
/admin                  Admin panel (admin only)
/admin/projects         Manage projects
/admin/inquiries        View leads
/admin/testimonials     Approve testimonials
/admin/analytics        Visitor analytics
```

---

#### 2. API Gateway Service (Node.js + Fastify)

**Purpose:** Central routing, authentication, rate limiting

**Responsibilities:**
- JWT authentication (issue, verify, refresh)
- Request validation (Zod schemas)
- Rate limiting (Redis-based)
- Request routing to microservices
- Admin role enforcement
- CORS policy
- OpenTelemetry trace propagation

**Key Middleware:**
```
authMiddleware      → Validates JWT, attaches user to request
adminGuard          → Checks user.role === 'admin'
rateLimitMiddleware → Redis incr/check per route
validateMiddleware  → Zod schema validation
```

---

#### 3. AI Service (Python + FastAPI + LangGraph)

**Purpose:** AI-powered features

**Components:**

1. **LangGraph ReAct Agent**
   - State machine for multi-step reasoning
   - Tool selection based on query
   - Streaming response generation

2. **RAG Pipeline**
   - Document chunking (resume, projects, about)
   - OpenAI embeddings (text-embedding-3-small)
   - pgvector similarity search
   - Reranking for relevance

3. **Tool Registry**
   ```
   rag_tool           → Search vector store
   github_tool        → GET repos, READMEs, stars
   portfolio_tool     → GET projects/skills from API
   calendar_tool      → GET availability + POST event
   lead_capture_tool  → POST inquiry to DB
   email_tool         → POST via SendGrid
   slack_tool         → POST webhook notification
   web_search_tool    → Search web for context
   ```

4. **MCP Server**
   - Public endpoint at mcp.prajwalraj.me
   - Tools: get_projects, get_skills, get_experience, search_portfolio
   - External clients can query your portfolio programmatically

5. **MCP Client Proxy**
   - Users can connect their own MCP servers
   - Credentials encrypted in DB
   - Proxy calls through ai-service

---

#### 4. Contact Service

**Purpose:** Handle contact form submissions

**Flow:**
```
User submits form
    → Validate input
    → Save to inquiries table
    → Push message to SQS
    → Return success immediately
```

---

#### 5. Analytics Service

**Purpose:** Privacy-friendly visitor tracking

**Events Tracked:**
- Page views
- Project clicks
- Chat sessions started
- Resume downloads
- Geographic distribution (from CloudFront header)

---

#### 6. Notification Service

**Purpose:** Async notification processing

**Consumes SQS messages for:**
- Contact form → Send email to you + confirmation to them
- Meeting booked → Calendar invite + Slack notification
- Testimonial submitted → Slack notification
- Lead captured → Email + Slack

---

## 5. AI System

### Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER QUERY                                   │
│         "What has Prajwal built with Kubernetes?"               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LangGraph ReAct Agent                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│   │  State  │───▶│ Router  │───▶│  Tool   │───▶│Synthesize│    │
│   │  Init   │    │(LLM)    │    │ Execute │    │ Response │    │
│   └─────────┘    └─────────┘    └─────────┘    └─────────┘     │
│                       │                                         │
│                       ▼                                         │
│            ┌─────────────────────┐                             │
│            │    TOOL REGISTRY    │                             │
│            ├─────────────────────┤                             │
│            │ • rag_tool          │                             │
│            │ • github_tool       │                             │
│            │ • portfolio_tool    │                             │
│            │ • calendar_tool     │                             │
│            │ • lead_capture_tool │                             │
│            │ • email_tool        │                             │
│            │ • slack_tool        │                             │
│            │ • web_search_tool   │                             │
│            └─────────────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STREAMED RESPONSE                            │
│    "Prajwal has built several Kubernetes projects including..." │
└─────────────────────────────────────────────────────────────────┘
```

### RAG Pipeline

```
Documents (resume.md, about.md, projects.md)
    │
    ▼
Chunking (500 tokens, 100 overlap)
    │
    ▼
OpenAI Embeddings (text-embedding-3-small, 1536 dims)
    │
    ▼
pgvector (HNSW index for fast search)
    │
    ▼
Query → Embed → Similarity Search → Top-K chunks
    │
    ▼
Rerank → Most relevant chunks
    │
    ▼
LLM + Context → Response
```

### Action-Taking Agent Flows

#### Flow 1: Schedule Meeting

```
User: "I'd like to schedule a call with Prajwal"
    │
    ▼
Agent asks: Name, email, topic
    │
    ▼
calendar_tool.get_availability() → ["Mon 2pm", "Tue 10am"]
    │
    ▼
User picks: "Tuesday 10am"
    │
    ▼
calendar_tool.create_event()
email_tool.send_confirmation()
slack_tool.notify()
lead_capture_tool.save()
    │
    ▼
Agent: "Done! Check your email for the invite."
```

#### Flow 2: Submit Testimonial

```
User: "I want to leave a recommendation"
    │
    ▼
Agent collects: Name, role, company, message
    │
    ▼
Validates content (spam check via LLM)
    │
    ▼
POST /testimonials (status: 'pending')
    │
    ▼
slack_tool.notify() → You get notified
    │
    ▼
You approve in admin panel → Auto-publishes
```

#### Flow 3: Hire Me Inquiry

```
User: "We have a DevOps project, can Prajwal help?"
    │
    ▼
Agent collects: Company, budget, timeline, requirements
    │
    ▼
lead_capture_tool.save()
email_tool.send_confirmation()
slack_tool.notify()
    │
    ▼
Agent: "Thanks! Prajwal will respond within 24 hours."
```

### MCP Server (Public)

Exposed at `mcp.prajwalraj.me`:

```
Tools:
├── get_projects()        → Returns all projects with metadata
├── get_skills()          → Returns skills graph
├── get_experience()      → Returns work history
├── search_portfolio()    → Semantic search over your work
└── get_contact_info()    → Returns contact details
```

Anyone can point their Claude/Cursor to `mcp.prajwalraj.me` and query your portfolio programmatically.

### MCP Client (For Users)

Logged-in users can:
1. Add their remote MCP server credentials
2. Credentials encrypted (AES-256) in DB
3. Chat with AI that has access to their MCP tools
4. Example: "Book a meeting via my Calendly MCP"

---

## 6. Database Design

### Database Technology

- **Primary DB:** Aurora PostgreSQL Serverless v2
- **Vector Store:** pgvector extension on Aurora
- **Cache:** ElastiCache Redis
- **Region:** ap-south-1 (Mumbai)

### Why Aurora Serverless v2?

```
Portfolio traffic pattern:
Day:    ████████░░  moderate traffic
Night:  █░░░░░░░░░  near zero traffic

Aurora Serverless v2:
→ Scales DOWN to 0.5 ACU at night → costs almost nothing
→ Scales UP instantly when traffic comes
→ Perfect for variable portfolio traffic
```

### Complete Schema (15 Tables)

#### Users Table
```sql
users
├── id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
├── email             VARCHAR(255) UNIQUE NOT NULL
├── name              VARCHAR(255)
├── avatar_url        TEXT
├── provider          VARCHAR(50)  -- 'google', 'github'
├── provider_id       VARCHAR(255)
├── role              VARCHAR(20) DEFAULT 'user'  -- 'user', 'admin'
├── is_active         BOOLEAN DEFAULT true
├── created_at        TIMESTAMP DEFAULT NOW()
└── updated_at        TIMESTAMP DEFAULT NOW()
```

#### Admin Credentials Table
```sql
admin_credentials
├── id                UUID PRIMARY KEY
├── email             VARCHAR(255) UNIQUE NOT NULL
├── password_hash     TEXT NOT NULL           -- bcrypt
├── totp_secret       TEXT NOT NULL           -- encrypted TOTP secret
├── allowed_ips       INET[]                  -- IP allowlist
├── last_login_at     TIMESTAMP
├── last_login_ip     INET
└── updated_at        TIMESTAMP DEFAULT NOW()
```

#### Sessions Table
```sql
sessions
├── id                UUID PRIMARY KEY
├── user_id           UUID REFERENCES users(id) ON DELETE CASCADE
├── token             TEXT UNIQUE NOT NULL
├── expires_at        TIMESTAMP NOT NULL
├── ip_address        INET
├── user_agent        TEXT
├── created_at        TIMESTAMP DEFAULT NOW()
└── last_active_at    TIMESTAMP DEFAULT NOW()
```

#### Categories Table
```sql
categories
├── id                UUID PRIMARY KEY
├── name              VARCHAR(100) NOT NULL    -- "DevOps"
├── slug              VARCHAR(100) UNIQUE      -- "devops"
├── description       TEXT
├── icon              VARCHAR(100)
├── color             VARCHAR(20)              -- hex color
├── is_visible        BOOLEAN DEFAULT true
├── display_order     INTEGER
└── created_at        TIMESTAMP DEFAULT NOW()
```

#### Projects Table
```sql
projects
├── id                UUID PRIMARY KEY
├── slug              VARCHAR(255) UNIQUE
├── title             VARCHAR(255) NOT NULL
├── description       TEXT
├── long_description  TEXT
├── tech_stack        TEXT[]
├── category_id       UUID REFERENCES categories(id)
├── github_url        TEXT
├── live_url          TEXT
├── thumbnail_url     TEXT
├── images            TEXT[]
├── is_featured       BOOLEAN DEFAULT false
├── is_published      BOOLEAN DEFAULT true
├── github_stars      INTEGER DEFAULT 0
├── github_forks      INTEGER DEFAULT 0
├── display_order     INTEGER
├── created_at        TIMESTAMP DEFAULT NOW()
└── updated_at        TIMESTAMP DEFAULT NOW()
```

#### Skills Table
```sql
skills
├── id                UUID PRIMARY KEY
├── name              VARCHAR(100) NOT NULL
├── category          VARCHAR(50)  -- 'frontend', 'backend', 'devops', 'ai'
├── proficiency       INTEGER CHECK (proficiency BETWEEN 1 AND 100)
├── icon_url          TEXT
├── years_experience  DECIMAL(3,1)
├── is_featured       BOOLEAN DEFAULT false
└── display_order     INTEGER
```

#### Experience Table
```sql
experience
├── id                UUID PRIMARY KEY
├── company           VARCHAR(255) NOT NULL
├── role              VARCHAR(255) NOT NULL
├── description       TEXT
├── responsibilities  TEXT[]
├── tech_stack        TEXT[]
├── start_date        DATE NOT NULL
├── end_date          DATE                   -- NULL = current job
├── is_current        BOOLEAN DEFAULT false
├── company_url       TEXT
├── company_logo_url  TEXT
├── location          VARCHAR(255)
└── display_order     INTEGER
```

#### Testimonials Table
```sql
testimonials
├── id                UUID PRIMARY KEY
├── author_name       VARCHAR(255) NOT NULL
├── author_role       VARCHAR(255)
├── author_company    VARCHAR(255)
├── author_avatar_url TEXT
├── content           TEXT NOT NULL
├── rating            INTEGER CHECK (rating BETWEEN 1 AND 5)
├── status            VARCHAR(20) DEFAULT 'pending'  -- 'pending', 'approved', 'rejected'
├── source            VARCHAR(20)  -- 'agent', 'manual'
├── linkedin_url      TEXT
├── created_at        TIMESTAMP DEFAULT NOW()
└── approved_at       TIMESTAMP
```

#### Inquiries Table
```sql
inquiries
├── id                UUID PRIMARY KEY
├── name              VARCHAR(255) NOT NULL
├── email             VARCHAR(255) NOT NULL
├── company           VARCHAR(255)
├── budget            VARCHAR(100)
├── timeline          VARCHAR(100)
├── project_type      VARCHAR(255)
├── description       TEXT NOT NULL
├── tech_stack        TEXT[]
├── status            VARCHAR(20) DEFAULT 'new'  -- 'new', 'read', 'replied', 'closed'
├── source            VARCHAR(50)  -- 'contact_form', 'agent', 'mcp_client'
├── session_id        UUID REFERENCES chat_sessions(id)
├── ip_address        INET
├── created_at        TIMESTAMP DEFAULT NOW()
└── updated_at        TIMESTAMP DEFAULT NOW()
```

#### Chat Sessions Table
```sql
chat_sessions
├── id                UUID PRIMARY KEY
├── user_id           UUID REFERENCES users(id) ON DELETE SET NULL
├── guest_ip          INET
├── title             VARCHAR(255)
├── status            VARCHAR(20) DEFAULT 'active'
├── message_count     INTEGER DEFAULT 0
├── created_at        TIMESTAMP DEFAULT NOW()
└── updated_at        TIMESTAMP DEFAULT NOW()
```

#### Chat Messages Table
```sql
chat_messages
├── id                UUID PRIMARY KEY
├── session_id        UUID REFERENCES chat_sessions(id) ON DELETE CASCADE
├── role              VARCHAR(20)  -- 'user', 'assistant', 'tool'
├── content           TEXT NOT NULL
├── tool_name         VARCHAR(100)
├── tool_input        JSONB
├── tool_output       JSONB
├── tokens_used       INTEGER
├── latency_ms        INTEGER
├── created_at        TIMESTAMP DEFAULT NOW()
└── INDEX             (session_id, created_at)
```

#### MCP Credentials Table
```sql
mcp_credentials
├── id                UUID PRIMARY KEY
├── user_id           UUID REFERENCES users(id) ON DELETE CASCADE
├── name              VARCHAR(255)
├── server_url        TEXT NOT NULL
├── auth_type         VARCHAR(20)  -- 'none', 'api_key', 'oauth', 'bearer'
├── encrypted_token   TEXT         -- AES-256 encrypted
├── headers           JSONB
├── is_active         BOOLEAN DEFAULT true
├── last_used_at      TIMESTAMP
├── created_at        TIMESTAMP DEFAULT NOW()
└── updated_at        TIMESTAMP DEFAULT NOW()
```

#### Analytics Events Table
```sql
analytics_events
├── id                UUID PRIMARY KEY
├── session_id        VARCHAR(255)
├── user_id           UUID REFERENCES users(id)
├── event_type        VARCHAR(100)  -- 'page_view', 'project_click'
├── page              VARCHAR(255)
├── referrer          TEXT
├── country           VARCHAR(10)
├── device_type       VARCHAR(20)  -- 'desktop', 'mobile', 'tablet'
├── metadata          JSONB
└── created_at        TIMESTAMP DEFAULT NOW()
```

#### Resume Versions Table
```sql
resume_versions
├── id                UUID PRIMARY KEY
├── version           VARCHAR(50)
├── label             VARCHAR(255)
├── s3_url            TEXT NOT NULL
├── is_default        BOOLEAN DEFAULT false
├── download_count    INTEGER DEFAULT 0
└── created_at        TIMESTAMP DEFAULT NOW()
```

#### Embeddings Metadata Table
```sql
embeddings_metadata
├── id                UUID PRIMARY KEY
├── source_type       VARCHAR(50)  -- 'resume', 'project', 'experience'
├── source_id         UUID
├── chunk_index       INTEGER
├── chunk_text        TEXT
├── embedding         vector(1536)  -- pgvector column
├── token_count       INTEGER
├── embedded_at       TIMESTAMP DEFAULT NOW()
└── UNIQUE            (source_type, source_id, chunk_index)

-- Index for fast similarity search
CREATE INDEX ON embeddings_metadata USING ivfflat (embedding vector_cosine_ops);
```

---

## 7. Authentication & Authorization

### Auth Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      GUEST (Not logged in)                      │
├─────────────────────────────────────────────────────────────────┤
│   Access:                                                       │
│   ├── Browse all public pages                                   │
│   ├── AI chat (5 messages/day limit)                           │
│   ├── Contact form (3 submissions/day)                         │
│   └── No MCP client access                                      │
│                                                                 │
│   Rate Limiting: By IP address (Redis)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      USER (OAuth Login)                         │
├─────────────────────────────────────────────────────────────────┤
│   Providers: Google, GitHub                                     │
│   Role: 'user'                                                  │
│                                                                 │
│   Access:                                                       │
│   ├── Unlimited AI chat                                         │
│   ├── Chat history saved                                        │
│   ├── MCP client (connect own MCPs)                            │
│   └── Can leave testimonials                                    │
│                                                                 │
│   Token: JWT (15 min access + 7 day refresh)                    │
│   Storage: httpOnly, secure, sameSite cookie                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN (Only You)                           │
├─────────────────────────────────────────────────────────────────┤
│   Auth Method: Email + Password + TOTP (2FA mandatory)          │
│   Extra Protection: IP allowlist (WAF blocks all others)        │
│   Role: 'admin'                                                 │
│                                                                 │
│   Access:                                                       │
│   ├── Everything users can do                                   │
│   ├── Full admin panel                                          │
│   ├── CRUD all content                                          │
│   ├── Approve/reject testimonials                               │
│   ├── View all inquiries                                        │
│   ├── Analytics dashboard                                       │
│   ├── AI embeddings control                                     │
│   └── Feature flags                                             │
│                                                                 │
│   Token: JWT (1 hr expiry, no refresh)                          │
└─────────────────────────────────────────────────────────────────┘
```

### Admin Auth Flow

```
You go to prajwalraj.me/admin/login
    │
    ▼
WAF checks: Is request from allowed IP?
    ├── No  → 403 immediately (attacker sees nothing)
    └── Yes → Show login form
                │
                ▼
        Enter email + password
                │
                ▼
        bcrypt.compare(password, hash)
                │
                ▼
        Success → Prompt TOTP code
                │
                ▼
        TOTP verified → Admin JWT issued (1hr)
                │
                ▼
        Access /admin panel
```

### JWT Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1713456789,
  "exp": 1713457689
}
```

---

## 8. API Design

### API Style

- **Protocol:** REST
- **Format:** JSON
- **Validation:** Zod schemas
- **Auth:** JWT Bearer token
- **Errors:** Consistent error format

### Base URLs

```
Production:
  https://api.prajwalraj.me      (API Gateway)
  https://ai.prajwalraj.me       (AI Service)
  https://mcp.prajwalraj.me      (MCP Server)

Staging:
  https://api.staging.prajwalraj.me
```

### Complete API Routes

#### Health & Metrics
```
GET  /health                    Liveness probe
GET  /ready                     Readiness probe
GET  /metrics                   Prometheus scrape endpoint
```

#### Authentication
```
POST /auth/oauth/google         Initiate Google OAuth
POST /auth/oauth/github         Initiate GitHub OAuth
GET  /auth/callback             OAuth callback handler
POST /auth/refresh              Refresh access token
POST /auth/logout               Invalidate session
POST /auth/admin/login          Admin email + password
POST /auth/admin/totp           Admin TOTP verification
```

#### User
```
GET    /user/me                 Get current user profile
PATCH  /user/me                 Update profile
DELETE /user/me                 Delete account
```

#### Projects
```
GET    /projects                Get all published projects
GET    /projects/featured       Get featured projects
GET    /projects/:slug          Get single project
POST   /projects                Create project (admin)
PATCH  /projects/:id            Update project (admin)
DELETE /projects/:id            Delete project (admin)
POST   /projects/sync-github    Sync stars/forks (admin)
```

#### Categories
```
GET    /categories              Get all visible categories
POST   /categories              Create category (admin)
PATCH  /categories/:id          Update category (admin)
DELETE /categories/:id          Delete category (admin)
```

#### Skills
```
GET    /skills                  Get all skills
GET    /skills/:category        Get skills by category
POST   /skills                  Create skill (admin)
PATCH  /skills/:id              Update skill (admin)
DELETE /skills/:id              Delete skill (admin)
```

#### Experience
```
GET    /experience              Get all experience
POST   /experience              Create experience (admin)
PATCH  /experience/:id          Update experience (admin)
DELETE /experience/:id          Delete experience (admin)
```

#### Testimonials
```
GET    /testimonials            Get approved testimonials
POST   /testimonials            Submit testimonial
PATCH  /testimonials/:id/approve    Approve (admin)
PATCH  /testimonials/:id/reject     Reject (admin)
DELETE /testimonials/:id        Delete (admin)
```

#### Inquiries
```
POST   /inquiries               Submit contact inquiry
GET    /inquiries               Get all inquiries (admin)
GET    /inquiries/:id           Get single inquiry (admin)
PATCH  /inquiries/:id/status    Update status (admin)
```

#### Chat
```
POST   /chat/session            Create new chat session
GET    /chat/sessions           Get user's chat history
GET    /chat/sessions/:id       Get single session
DELETE /chat/sessions/:id       Delete session
GET    /chat/rate-limit         Check remaining messages (guest)
```

#### AI Service Routes (ai.prajwalraj.me)
```
POST   /chat/stream             Stream AI response (SSE)
POST   /embeddings/ingest       Re-ingest documents (admin)
GET    /embeddings/status       Embedding status (admin)
POST   /mcp/invoke              Invoke user's remote MCP tool
GET    /health                  Liveness probe
GET    /ready                   Readiness probe
```

#### MCP Credentials
```
GET    /mcp/credentials         Get user's saved MCP servers
POST   /mcp/credentials         Add new MCP server
PATCH  /mcp/credentials/:id     Update MCP server
DELETE /mcp/credentials/:id     Delete MCP server
POST   /mcp/credentials/:id/test    Test connection
GET    /mcp/credentials/:id/tools   List available tools
```

#### Resume
```
GET    /resume                  Get signed S3 URL for download
GET    /resume/versions         Get all versions (admin)
POST   /resume/upload           Upload new version (admin)
```

#### Analytics
```
POST   /analytics/event         Track visitor event
GET    /analytics/summary       Analytics summary (admin)
GET    /analytics/visitors      Visitor count (admin)
GET    /analytics/events        Raw events (admin)
```

### Request/Response Examples

#### POST /chat/stream (SSE)

Request:
```json
{
  "session_id": "uuid-or-null",
  "message": "What has Prajwal built with Kubernetes?",
  "mcp_credential_id": null
}
```

Response (Server-Sent Events):
```
event: delta
data: {"type": "text", "content": "Prajwal has built "}

event: tool_call
data: {"type": "tool_call", "tool": "rag_tool", "input": {"query": "kubernetes projects"}}

event: tool_result
data: {"type": "tool_result", "tool": "rag_tool", "output": {...}}

event: delta
data: {"type": "text", "content": "several Kubernetes projects including..."}

event: done
data: {"type": "done", "session_id": "uuid", "tokens_used": 342, "latency_ms": 1823}
```

#### GET /projects

Request:
```
GET /projects?category=devops&featured=true&limit=10
```

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "portfolio-eks",
      "title": "Portfolio on EKS",
      "description": "Production-grade portfolio...",
      "tech_stack": ["Next.js", "Kubernetes", "Terraform"],
      "category": {
        "id": "uuid",
        "name": "DevOps",
        "slug": "devops"
      },
      "github_url": "https://github.com/...",
      "live_url": "https://prajwalraj.me",
      "thumbnail_url": "https://cdn.prajwalraj.me/...",
      "github_stars": 142,
      "is_featured": true
    }
  ],
  "pagination": {
    "total": 24,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

#### Standard Error Response

```json
{
  "error": "VALIDATION_ERROR",
  "message": "email is required",
  "field": "email",
  "trace_id": "abc123"
}
```

Error Codes:
- `400` VALIDATION_ERROR
- `401` UNAUTHORIZED
- `403` FORBIDDEN
- `404` NOT_FOUND
- `429` RATE_LIMIT_EXCEEDED
- `500` INTERNAL_ERROR

---

## 9. Infrastructure

### AWS Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                               │
│                     Region: ap-south-1                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    EDGE SERVICES                         │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │  Route 53 ──▶ CloudFront ──▶ WAF ──▶ ALB               │   │
│   │     │              │                  │                  │   │
│   │     │         (Cache at              (OWASP rules,      │   │
│   │  (DNS)        400+ PoPs)          rate limiting)        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│   ┌──────────────────────────┼──────────────────────────────┐   │
│   │                     VPC (10.0.0.0/16)                    │   │
│   ├──────────────────────────┼──────────────────────────────┤   │
│   │                          │                               │   │
│   │   PUBLIC SUBNETS (10.0.1-3.0/24)                        │   │
│   │   ├── ALB (Application Load Balancer)                   │   │
│   │   └── NAT Gateway (x2 for HA)                           │   │
│   │                          │                               │   │
│   │   PRIVATE SUBNETS (10.0.11-13.0/24)                     │   │
│   │   └── EKS Worker Nodes                                  │   │
│   │       ├── system-ng (t3.medium x2)                      │   │
│   │       ├── app-ng (t3.large x2) - Spot                   │   │
│   │       └── ai-ng (c5.xlarge x1) - Spot                   │   │
│   │                          │                               │   │
│   │   ISOLATED SUBNETS (10.0.21-23.0/24)                    │   │
│   │   ├── Aurora PostgreSQL (Serverless v2)                 │   │
│   │   └── ElastiCache Redis                                 │   │
│   │                                                          │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    STORAGE                               │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │  S3 Buckets:                                            │   │
│   │  ├── prajwalraj-assets-prod (images, resume)            │   │
│   │  ├── prajwalraj-backups-prod (DB snapshots)             │   │
│   │  └── prajwalraj-terraform-state (IaC state)             │   │
│   │                                                          │   │
│   │  ECR: Docker images per service                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    SECURITY                              │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │  ├── AWS Secrets Manager (secrets)                      │   │
│   │  ├── KMS (encryption keys)                              │   │
│   │  ├── IAM Roles (IRSA for pods)                          │   │
│   │  ├── GuardDuty (threat detection)                       │   │
│   │  └── Security Hub (unified findings)                    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### EKS Cluster Configuration

```yaml
Cluster:
  version: "1.30"
  region: ap-south-1

Node Groups:
  system-ng:
    instance_types: ["t3.medium"]
    desired: 2
    min: 2
    max: 4
    purpose: "ArgoCD, monitoring, ingress"
    
  app-ng:
    instance_types: ["t3.large"]
    desired: 2
    min: 2
    max: 10
    capacity_type: SPOT
    purpose: "Application services"
    
  ai-ng:
    instance_types: ["c5.xlarge"]
    desired: 1
    min: 1
    max: 4
    capacity_type: SPOT
    purpose: "AI service (compute intensive)"

Add-ons:
  - CoreDNS
  - kube-proxy
  - VPC CNI
  - EBS CSI Driver
  - AWS Load Balancer Controller

Namespaces:
  - portfolio         # Your services
  - monitoring        # Prometheus, Grafana, Loki, Tempo
  - argocd           # GitOps controller
  - ingress-nginx    # Ingress controller
  - cert-manager     # TLS automation
  - external-secrets # Secrets Manager sync
```

### Per-Service Kubernetes Resources

Every service gets:

```yaml
Deployment:
  replicas: 2 (minimum)
  strategy: RollingUpdate
  resources:
    requests:
      cpu: "100m"
      memory: "256Mi"
    limits:
      cpu: "500m"
      memory: "512Mi"
  probes:
    livenessProbe: /health
    readinessProbe: /ready
    startupProbe: /health
  topologySpreadConstraints: spread across AZs
  podAntiAffinity: no 2 pods on same node
  securityContext: non-root, read-only filesystem

HorizontalPodAutoscaler:
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - cpu: 70%
    - memory: 80%

PodDisruptionBudget:
  minAvailable: 1

Service:
  type: ClusterIP

ServiceAccount:
  annotations:
    eks.amazonaws.com/role-arn: <IRSA role>

NetworkPolicy:
  ingress: only from allowed services
  egress: only to required services + DNS

ServiceMonitor:
  interval: 30s
  path: /metrics
```

### Terraform Module Structure

```
infrastructure/
├── terraform/
│   └── modules/
│       ├── vpc/                 # VPC, subnets, NAT, IGW
│       ├── eks/                 # EKS cluster, node groups
│       ├── rds/                 # Aurora PostgreSQL
│       ├── elasticache/         # Redis cluster
│       ├── s3/                  # S3 buckets
│       ├── cloudfront/          # CDN distribution
│       ├── route53/             # DNS records
│       ├── acm/                 # SSL certificates
│       ├── waf/                 # WAF rules
│       ├── ecr/                 # Container registry
│       ├── sqs/                 # Message queues
│       ├── secrets-manager/     # Secrets
│       └── monitoring/          # CloudWatch, alarms
│
└── terragrunt/
    ├── terragrunt.hcl           # Root config
    ├── staging/
    │   ├── vpc/terragrunt.hcl
    │   ├── eks/terragrunt.hcl
    │   └── ...
    └── prod/
        ├── vpc/terragrunt.hcl
        ├── eks/terragrunt.hcl
        └── ...
```

---

## 10. CI/CD Pipeline

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Write Code ──▶ git push ──▶ PR Opened                        │
│                                   │                             │
│                                   ▼                             │
│                    ┌──────────────────────────┐                 │
│                    │   GitHub Actions - CI    │                 │
│                    ├──────────────────────────┤                 │
│                    │  1. Lint (ESLint, Ruff)  │                 │
│                    │  2. Type check (tsc)     │                 │
│                    │  3. Unit tests           │                 │
│                    │  4. Security scan        │                 │
│                    │  5. Docker build         │                 │
│                    │  6. Trivy scan           │                 │
│                    └──────────────────────────┘                 │
│                                   │                             │
│                                   ▼                             │
│                         PR Merged to main                       │
│                                   │                             │
│                                   ▼                             │
│                    ┌──────────────────────────┐                 │
│                    │   GitHub Actions - CD    │                 │
│                    ├──────────────────────────┤                 │
│                    │  1. Build Docker image   │                 │
│                    │  2. Tag with git SHA     │                 │
│                    │  3. Push to ECR          │                 │
│                    │  4. Update Helm values   │                 │
│                    │  5. Commit to repo       │                 │
│                    └──────────────────────────┘                 │
│                                   │                             │
│                                   ▼                             │
│                    ┌──────────────────────────┐                 │
│                    │      ArgoCD Sync         │                 │
│                    ├──────────────────────────┤                 │
│                    │  Detects Helm values     │                 │
│                    │  change, syncs to EKS    │                 │
│                    └──────────────────────────┘                 │
│                                   │                             │
│                                   ▼                             │
│                    ┌──────────────────────────┐                 │
│                    │  Rolling/Blue-Green      │                 │
│                    │      Deploy              │                 │
│                    └──────────────────────────┘                 │
│                                   │                             │
│                                   ▼                             │
│                    Slack: "ai-service deployed ✅"               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### GitHub Actions Workflows

#### CI Pipeline (on PR)

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm test

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx semgrep --config auto
      - run: npx gitleaks detect

  docker-build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [web, api-gateway, ai-service]
    steps:
      - uses: actions/checkout@v4
      - run: docker build -f apps/${{ matrix.service }}/Dockerfile .
      - run: trivy image --exit-code 1 --severity CRITICAL
```

#### CD Pipeline (on merge to main)

```yaml
name: CD

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [web, api-gateway, ai-service]
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push to ECR
        run: |
          docker build -t $ECR_REPO:$GITHUB_SHA .
          docker push $ECR_REPO:$GITHUB_SHA
      
      - name: Update Helm values
        run: |
          yq -i '.image.tag = "${{ github.sha }}"' \
            helm/values-prod.yaml
          git commit -am "Deploy ${{ matrix.service }}:${{ github.sha }}"
          git push
      
      - name: Notify Slack
        run: |
          curl -X POST $SLACK_WEBHOOK \
            -d '{"text": "Deployed ${{ matrix.service }} ✅"}'
```

### ArgoCD Configuration

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: portfolio-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/prajwalraj/portfolio
    targetRevision: main
    path: helm/portfolio
  destination:
    server: https://kubernetes.default.svc
    namespace: portfolio
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Deployment Strategies

| Service | Strategy | Reason |
|---------|----------|--------|
| frontend-service | Blue/Green | Zero downtime, instant rollback |
| api-gateway | Rolling | Gradual, resource efficient |
| ai-service | Blue/Green | Heavy service, safe swap |
| contact-service | Rolling | Stateless, simple |
| analytics-service | Rolling | Stateless, simple |
| notification-service | Rolling | SQS handles retries |

---

## 11. Observability

### The Three Pillars + One

```
METRICS  ──▶  Prometheus + Grafana
LOGS     ──▶  Loki + Grafana
TRACES   ──▶  Tempo + Grafana
ERRORS   ──▶  Sentry
```

All unified in Grafana as single pane of glass.

### OpenTelemetry Instrumentation

Every service has:
```
├── OTel SDK (auto-instrumentation)
├── OTel Collector sidecar
└── Exports to:
    ├── Prometheus (metrics)
    ├── Loki (logs)
    └── Tempo (traces)
```

What gets traced automatically:
```
├── Every HTTP request (duration, status, path)
├── Every DB query (duration, query, rows)
├── Every Redis call
├── Every external API call
├── Every AI LLM call (tokens, latency, model)
└── Every SQS message
```

### Grafana Dashboards

#### Dashboard 1: System Overview
```
├── Total requests/sec across all services
├── P50 / P95 / P99 latency per service
├── Error rate %
├── Pod count per service
└── Node CPU/Memory
```

#### Dashboard 2: AI Service
```
├── Chat queries per hour
├── RAG retrieval latency
├── LLM response latency
├── Token usage over time
└── Tool call breakdown
```

#### Dashboard 3: Infrastructure
```
├── EKS node utilization
├── RDS connections + query latency
├── Redis hit/miss ratio
├── CloudFront cache hit ratio
└── SQS queue depth
```

#### Dashboard 4: Business Metrics
```
├── Unique visitors per day
├── Chat sessions started
├── Meeting requests submitted
├── Testimonials submitted
└── Geographic visitor distribution
```

### Alerting Rules

```yaml
Alerts:
  - name: HighErrorRate
    condition: error_rate > 1% for 5 minutes
    severity: critical
    
  - name: HighLatency
    condition: p95_latency > 2s for 5 minutes
    severity: warning
    
  - name: PodCrashLoop
    condition: pod restarts > 3 in 10 minutes
    severity: critical
    
  - name: RDSHighCPU
    condition: rds_cpu > 80%
    severity: warning
    
  - name: CertExpiringSoon
    condition: cert_expiry < 30 days
    severity: warning

Notification Channels:
  - Slack: #portfolio-alerts
  - Email: prajwal@prajwalraj.me
```

---

## 12. Security

### Defense in Depth

```
Layer 1: AWS Shield Standard
    │     └── Volumetric DDoS protection
    ▼
Layer 2: CloudFront
    │     └── Traffic distributed across 400+ PoPs
    │     └── Origin IP hidden
    ▼
Layer 3: WAF
    │     └── OWASP Top 10 rules
    │     └── Rate limiting (1000 req/5min per IP)
    │     └── AI endpoint limit (50 req/hr per IP)
    │     └── IP reputation blocking
    ▼
Layer 4: ALB
    │     └── Only accepts CloudFront traffic
    │     └── SSL termination
    ▼
Layer 5: ingress-nginx
    │     └── Request size limits
    │     └── Connection timeouts
    ▼
Layer 6: Network Policies
    │     └── Service-to-service whitelist
    │     └── DB only from app pods
    ▼
Layer 7: VPC Security Groups
          └── EKS nodes: only from ALB
          └── RDS: only from EKS
          └── Redis: only from EKS
```

### OWASP Top 10 Protection

| Threat | Mitigation |
|--------|------------|
| SQL Injection | WAF + parameterized queries |
| XSS | WAF + CSP headers + React escaping |
| CSRF | CSRF tokens on state-changing requests |
| Broken Auth | JWT validation + refresh rotation |
| Security Misconfig | Terraform enforces correct config |
| Sensitive Data | Never in logs/URLs, encrypted at rest |
| XXE | Disabled XML parsers |
| Insecure Deserialize | Input validation on all endpoints |
| Known Vulnerabilities | Trivy + Dependabot |
| Logging/Monitoring | Full OTel + CloudTrail |

### Secrets Management

```
❌ Never:
├── Secrets in code
├── Secrets in env vars baked into images
├── Secrets in Git
└── IAM user access keys

✅ Always:
├── Secrets in AWS Secrets Manager
├── External Secrets Operator syncs to K8s
├── Pods access via mounted volumes
├── IRSA for AWS permissions
└── Automatic rotation (RDS, Redis)
```

### Runtime Security (Falco)

Alerts on:
```
├── Shell spawned inside container
├── Container reads /etc/passwd or /etc/shadow
├── Unexpected outbound connections
├── Writes to unexpected filesystem paths
├── kubectl exec in production
└── Privilege escalation attempts
```

---

## 13. Scalability & Reliability

### Horizontal Pod Autoscaling

```yaml
frontend-service:
  min: 2, max: 10
  scale_on: CPU > 70% OR Memory > 80%

api-gateway:
  min: 2, max: 10
  scale_on: CPU > 70% OR RPS > 1000/pod

ai-service:
  min: 2, max: 8
  scale_on: CPU > 60% OR active_llm_requests > 5/pod
```

### Cluster Autoscaling

```
Pending pods detected
    ▼
Cluster Autoscaler adds EC2 node
    ▼
Node joins cluster (~2-3 min)
    ▼
Pods scheduled

Underutilized nodes detected
    ▼
Cluster Autoscaler drains + terminates
    ▼
Cost saved
```

### Multi-AZ Reliability

| Component | AZs | Failover |
|-----------|-----|----------|
| EKS nodes | 3 | Pods reschedule |
| ALB | 3 | Routes around failed AZ |
| Aurora | 2 | Automatic < 30 sec |
| Redis | 2 | Replica promotes |
| NAT Gateway | 2 | Routes switch |

### Circuit Breaker Pattern

```
ai-service is slow
    ▼
Circuit breaker: 5 failures in 10 seconds
    ▼
Circuit OPENS → stop calling ai-service
    ▼
Return fallback response
    ▼
After 30 seconds → HALF-OPEN → try again
    ▼
ai-service recovered → CLOSE → normal flow
```

### Rate Limiting Layers

```
Layer 1: WAF (Edge)
├── 1000 req/5min per IP (general)
├── 50 req/hr per IP on /ai/*
└── 10 req/min per IP on /auth/*

Layer 2: API Gateway (Redis)
├── Guest: 5 AI messages/day
├── Guest: 100 API req/hour
├── Logged in: 500 API req/hour
└── Logged in: Unlimited chat

Layer 3: AI Service
├── Max 10 tool calls per query
├── Max 2000 tokens per response
├── Request timeout: 30 seconds
└── Daily budget alert at $10

Layer 4: ingress-nginx
├── /api/* → 30 req/sec per IP
├── /ai/* → 2 req/sec per IP
└── /auth/* → 5 req/sec per IP
```

---

## 14. Cost Estimation

### Monthly Cost Breakdown

| Service | Staging | Production |
|---------|---------|------------|
| EKS Cluster (control plane) | $73 | $73 |
| EC2 Nodes (Spot) | $80 | $150 |
| Aurora Serverless v2 | $30 | $60 |
| ElastiCache Redis | $12 | $25 |
| NAT Gateway | $65 | $65 |
| ALB | $20 | $25 |
| CloudFront | $5 | $15 |
| S3 | $2 | $5 |
| Route 53 | $1 | $1 |
| WAF | $8 | $10 |
| Secrets Manager | $2 | $2 |
| **Total** | **~$300** | **~$430** |

### AI API Costs (Variable)

```
OpenAI / Anthropic:
├── ~$3/million input tokens
├── 1000 chat sessions/month → ~$10-20/month
└── Always set spend limits!
```

### Cost Optimization Strategies

```
✅ Spot instances for app + ai node groups (70% cheaper)
✅ Aurora Serverless scales to near-zero at night
✅ VPC Endpoints (avoid NAT charges for ECR/S3)
✅ CloudFront caching (reduce origin hits)
✅ pgvector instead of Pinecone ($70/month saved)
✅ Shared EKS cluster for staging + prod
✅ S3 Intelligent-Tiering
✅ Budget alerts at $200 threshold
```

---

## 15. Build Phases

| Phase | What | Deliverables |
|-------|------|--------------|
| **1** | Foundation | Monorepo scaffold, Terraform VPC/EKS, ECR, GitHub Actions skeleton |
| **2** | Frontend Core | Next.js app, design system, core pages, animations |
| **3** | API Gateway | Fastify setup, auth (JWT), rate limiting, validation |
| **4** | Database & Content | Aurora setup, Prisma schema, projects/skills CRUD |
| **5** | AI Service | FastAPI, LangGraph agent, RAG pipeline, basic chat |
| **6** | AI Tools | GitHub tool, calendar tool, lead capture, email/Slack |
| **7** | MCP | Public MCP server, MCP client proxy |
| **8** | Observability | Prometheus, Grafana, Loki, Tempo, Sentry |
| **9** | Admin Panel | Full CRUD UI, analytics dashboard, embeddings control |
| **10** | Security | WAF rules, Network Policies, Falco, penetration testing |
| **11** | Polish | Performance optimization, SEO, accessibility, load testing |
| **12** | Go Live | Production deploy, domain cutover, monitoring |

---

## 16. Monorepo Structure

```
prajwalraj.me/
│
├── apps/
│   ├── web/                        # Next.js 15 frontend
│   │   ├── app/                    # App Router pages
│   │   ├── components/             # React components
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                    # Utilities
│   │   ├── store/                  # Zustand stores
│   │   ├── styles/                 # Global CSS
│   │   ├── public/                 # Static assets
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── api-gateway/                # Node.js + Fastify
│   │   ├── src/
│   │   │   ├── routes/             # API routes
│   │   │   ├── middleware/         # Auth, rate limit, validation
│   │   │   ├── services/           # Business logic
│   │   │   ├── db/                 # Database queries
│   │   │   └── config/             # Configuration
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── ai-service/                 # Python + FastAPI
│   │   ├── api/                    # API routes
│   │   ├── agent/                  # LangGraph agent
│   │   ├── tools/                  # Agent tools
│   │   ├── rag/                    # RAG pipeline
│   │   ├── mcp/                    # MCP server + client
│   │   ├── services/               # LLM, streaming
│   │   ├── Dockerfile
│   │   └── pyproject.toml
│   │
│   ├── contact-service/            # Node.js + Fastify
│   ├── analytics-service/          # Node.js + Fastify
│   └── notification-service/       # Node.js + Fastify
│
├── packages/
│   ├── ui/                         # Shared React components
│   ├── types/                      # Shared TypeScript types
│   ├── config/                     # ESLint, Tailwind, TS configs
│   ├── database/                   # Prisma/Drizzle schema
│   └── utils/                      # Shared utilities
│
├── infrastructure/
│   ├── terraform/
│   │   └── modules/                # Reusable Terraform modules
│   ├── terragrunt/
│   │   ├── staging/                # Staging environment
│   │   └── prod/                   # Production environment
│   ├── helm/
│   │   └── charts/                 # Helm charts per service
│   ├── k8s/
│   │   ├── base/                   # Kustomize base
│   │   └── overlays/               # Environment overlays
│   └── argocd/                     # ArgoCD app definitions
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Lint, test, build
│       ├── cd.yml                  # Build + deploy
│       └── infra.yml               # Terraform plan/apply
│
├── docker/
│   ├── docker-compose.yml          # Local development
│   └── docker-compose.prod.yml     # Production-like local
│
├── docs/
│   ├── ARCHITECTURE.md             # This document
│   ├── adr/                        # Architecture Decision Records
│   └── runbooks/                   # Incident runbooks
│
├── scripts/
│   ├── setup-local.sh              # Local dev setup
│   ├── seed-database.sh            # Seed data
│   └── generate-embeddings.sh      # Re-embed documents
│
├── turbo.json                      # Turborepo config
├── pnpm-workspace.yaml             # pnpm workspaces
├── package.json                    # Root package.json
├── .env.example                    # Environment variables template
└── README.md                       # Project overview
```

---

## Appendix A: Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Next.js 15 | SSR/SSG, React ecosystem, App Router |
| Backend Framework | Fastify + REST | Familiar to developer, 5x faster than Express |
| AI Framework | LangGraph | ReAct pattern, multi-step reasoning, tool calling |
| Database | Aurora PostgreSQL Serverless v2 | Auto-scaling, cost-effective, pgvector support |
| Vector Store | pgvector | Same DB, no extra service, good for <100K vectors |
| Container Orchestration | EKS | Full Kubernetes, IRSA, production-grade |
| IaC | Terraform + Terragrunt | DRY, multi-environment, team-standard |
| GitOps | ArgoCD | Self-heal, Git as truth, visual dashboard |
| Observability | Grafana stack | Unified metrics/logs/traces, public dashboard |
| Auth | JWT + OAuth | Stateless, scalable, standard |
| Admin Auth | Email + TOTP + IP allowlist | Maximum security for admin access |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **IRSA** | IAM Roles for Service Accounts - K8s pods get AWS permissions |
| **HPA** | Horizontal Pod Autoscaler - auto-scale pods based on metrics |
| **PDB** | Pod Disruption Budget - guarantees availability during updates |
| **OIDC** | OpenID Connect - standard for OAuth authentication |
| **SSE** | Server-Sent Events - streaming responses from server |
| **RAG** | Retrieval Augmented Generation - LLM + knowledge base |
| **MCP** | Model Context Protocol - standard for AI tool integration |
| **pgvector** | PostgreSQL extension for vector similarity search |
| **ArgoCD** | GitOps controller for Kubernetes deployments |
| **Terragrunt** | Wrapper for Terraform for DRY multi-environment configs |

---

*Document maintained by: Prajwal Raj*  
*Last reviewed: April 2026*
