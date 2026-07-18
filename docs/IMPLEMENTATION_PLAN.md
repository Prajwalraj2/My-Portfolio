# Implementation Plan

> How we build everything agreed in [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md).
> This is the file-by-file / folder-by-folder plan: what's **new**, **changed**, **kept**.
> Nothing here is built yet — it's the blueprint we execute against.
> Last updated: 2026-07-14

**Decisions applied:**
- **Remote MCP server is logged-in-users-only** — no anonymous/public tool tier. Every
  MCP call (remote OAuth or local bearer key) maps to a real user.
- **Self-contained apps, NO shared packages** (revised). DB lives only in api-gateway;
  each app owns its own types/utils/config. `packages/*` are removed/unused. See
  [DESIGN_DECISIONS §3](./DESIGN_DECISIONS.md).

---

## 0. Legend & phasing

- 🆕 new file/folder · ✏️ modify existing · ✅ keep as-is · 🗑️ remove · 📦 new package/app

**Build order (each phase independently shippable):**

| Phase | Goal | Touches |
|---|---|---|
| **P1** | Unified auth layer + user auth (OAuth login/signup) + `ApiKey` model | db, api-gateway, web |
| **P2** | Backend capability endpoints (bookings, email, github, blogs, guides, recommendations) + service layer | db, api-gateway |
| **P3** | AI service → LangChain `create_agent` + tools (thin wrappers) | ai-service |
| **P4** | Local npm MCP server using bearer key (self-contained) | apps/local-npm-mcp-server |
| **P5** | Remote MCP server with OAuth 2.1 (logged-in only) | apps/remote-mcp-server, auth provider |
| **P6** | Frontend pages (public/user/admin), chat UI primitives, `/mcp` key manager | web |
| **P7** | Stub services (notification/approval, analytics, contact) + infra/CI | apps/*, infrastructure |

Each app carries its own types/utils; nothing is shared across apps.

---

## 1. Target monorepo structure (self-contained apps, no shared packages)

```
My Portfolioo/
├── apps/
│   ├── web/                        ✏️  Next.js — pages + auth + chat UI (own types in web/types)
│   ├── api-gateway/                ✏️  Fastify — unified auth, capability routes, service layer,
│   │                                    OWNS the database (prisma/schema.prisma = source of truth)
│   ├── ai-service/                 ✏️  FastAPI — migrate to LangChain create_agent + tools
│   ├── remote-mcp-server/     🆕📦 Remote MCP (HTTP + OAuth 2.1, logged-in only)  → CONTAINER :8002
│   ├── local-npm-mcp-server/  🆕📦 publishable npm package (stdio, bearer key)    → NOT deployed
│   ├── local-python-mcp-server/🆕📦 publishable pip package (stdio, bearer key)   → NOT deployed
│   ├── analytics-service/          ✅  stub → filled P7
│   ├── contact-service/            ✅  stub → filled P7
│   └── notification-service/       ✏️  stub → filled P7 (approval/notify for write tools)
├── packages/                       🗑️  REMOVED — no shared packages (database/types/ui/utils/config)
├── docs/                           ✏️  this plan + decisions
├── k8s/                            ✏️  add remote-mcp-server manifests; fix secrets hygiene
├── infrastructure/                 ✏️  fill argocd/helm/terraform (P7)
└── .github/workflows/              ✏️  CI/CD (P7)
```

**Deployment = 4 app containers:** `web` :3000, `api-gateway` :8000, `ai-service` :8001,
`remote-mcp-server` :8002. Postgres = Neon (external). Redis = optional (per-key rate
limiting). OAuth provider = external SaaS. **Local MCP servers are published packages,
run on the user's machine (`npx`/`uvx`) — never deployed.** See §15.

> **Duplication to watch (deferred):** `remote-mcp-server` and `local-npm-mcp-server` are
> both TS with near-identical tool code. Extract a shared bit later only if it hurts.
>
> **Optional trim:** ship `local-npm-mcp-server` first (covers Cursor + Claude Desktop via
> `npx`); add `local-python-mcp-server` later only if pip users ask.

---

## 2. Database — `apps/api-gateway/prisma/schema.prisma` (SINGLE SOURCE OF TRUTH)

> Only the backend touches the DB. All Prisma lives in api-gateway.
> **Action (P1):** delete the leftover `packages/database/` entirely; api-gateway's
> `prisma/schema.prisma` is the one and only schema.

### 2.1 🆕 New model — `ApiKey` (keys to access OUR MCP server / API — the local-MCP path)
```prisma
model ApiKey {
  id           String    @id @default(uuid())
  userId       String    @map("user_id")
  name         String                                 // user-facing label
  keyHash      String    @unique @map("key_hash")     // store HASH only; show raw once
  prefix       String                                 // e.g. "pk_live_ab12" for display
  scopes       String[]                               // tool names / categories this key may call
  rateLimitPerHour Int   @default(120) @map("rate_limit_per_hour")
  lastUsedAt   DateTime? @map("last_used_at")
  expiresAt    DateTime? @map("expires_at")
  revokedAt    DateTime? @map("revoked_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("api_keys")
}
```

### 2.2 ✏️ `User` — support email/password + OAuth users + relations
- Add `passwordHash String? @map("password_hash")` (nullable — OAuth users have none).
- Add relation `apiKeys ApiKey[]`.
- (Regular users primarily via Google/GitHub OAuth per USER_FLOWS; password optional.)

### 2.3 🆕 New models for capability endpoints (P2)
- `Meeting` — bookings (online/offline/date): `type`, `userId`, `requestedAt`, `slot`,
  `status` ('requested'|'approved'|'declined'|'cancelled'), `notes`, `contactEmail`.
- `Blog` + `BlogTag` — `slug`, `title`, `excerpt`, `contentMd`, `coverUrl`, `status`
  ('draft'|'published'), `publishedAt`, `tags`.
- `Guide` — `slug`, `title`, `bodyMd`, `category`, `displayOrder`, `isPublished`.
- `Recommendation` — reuse/extend existing `Testimonial` (already has status/approval) OR
  add a thin `Recommendation` if fields differ. **Decision:** extend `Testimonial`.
- `EmailLog` / `NotificationLog` — audit of outbound emails/Slack (for write-tool approval).

### 2.4 ✅ Keep as-is
`AdminCredential`, `Session`, `Category`, `Project`, `Skill`, `Experience`, `Inquiry`,
`ChatSession`, `ChatMessage`, `AnalyticsEvent`, `ResumeVersion`, `EmbeddingMetadata`,
`McpCredential` (parked, untouched).

### 2.5 Migrations
- `pnpm --filter api-gateway db:migrate` (or the api-gateway script) after each change.
- Seed script additions for blogs/guides sample data.

---

## 3. Types — local to each app (NO shared package)

No `packages/types`. Each app owns its own type definitions:
- `apps/api-gateway/src/types/` — DTOs, `Principal`, and the **tool catalog**
  (`tools.ts`: name, method, read|write, scope, description) — the gateway is the natural
  home since it enforces scoping.
- `apps/web/types/` — frontend-facing API response shapes (keep existing `types/api.ts`).
- `apps/ai-service/src/tools/` — Python tool definitions (own copy).
- Each MCP app — its own tool definitions.

**Trade-off accepted:** the tool list is written more than once (gateway TS, AI Python,
each MCP app). Kept in sync by hand for now; revisit only if it hurts.

---

## 4. `apps/api-gateway` — the hub

### 4.1 🆕 Unified auth layer (P1)
```
src/auth/
├── principal.ts       🆕  type Principal = { id, kind: 'user'|'admin'|'apikey', scopes[], rateBucket }
├── resolve.ts         🆕  resolvePrincipal(req): from JWT cookie | Bearer JWT | ApiKey | OAuth token
├── apiKey.ts          🆕  hash/verify keys, load ApiKey, check revoked/expired, touch lastUsedAt
└── oauth/             🆕  (P5) resource-server token validation (see §9)
```
- ✏️ `src/middleware/auth.ts`: `requireAuth`/`requireAdmin` rewritten to use `resolvePrincipal`.
  Add `requireScopes(...scopes)` for tool endpoints. Uncomment/finish IP allowlist for admin.

### 4.2 ✏️ Rate limiting
- `src/plugins/rateLimit.ts` 🆕 — per-principal token bucket (Redis-backed). Global
  `@fastify/rate-limit` stays as coarse IP guard; per-key limit enforced from `ApiKey.rateLimitPerHour`.

### 4.3 🆕 Service layer (business logic lives here, not in routes)
```
src/services/
├── content.service.ts        🆕  projects/skills/experience/categories reads
├── booking.service.ts        🆕  meetings (online/offline/date) + approval hooks
├── email.service.ts          🆕  send email to Prajwal (→ notification-service)
├── github.service.ts         🆕  GitHub API fetch (repos/langs/stars), cached
├── blog.service.ts           🆕  blogs CRUD
├── guide.service.ts          🆕  guides CRUD
├── recommendation.service.ts 🆕  testimonials/recommendations submit + approve
├── inquiry.service.ts        🆕  service inquiries / freelance proposals
├── apiKey.service.ts         🆕  create/list/revoke MCP keys
└── notify.service.ts         🆕  enqueue Slack/email notifications (→ notification-service)
```

### 4.4 🆕/✏️ Routes (registered in `src/app.ts` ✏️)
```
src/routes/
├── auth.ts            ✏️  add user signup/login (OAuth Google/GitHub) + session cookies
├── users.ts           🆕  /api/users/me, settings, profile (P1)
├── apikeys.ts         🆕  /api/apikeys  CRUD for MCP keys (P1)   [requireAuth]
├── meetings.ts        🆕  /api/meetings  book date/online/offline (P2) [write, requireScopes]
├── email.ts           🆕  /api/email/contact (P2) [write]
├── github.ts          🆕  /api/github  (P2) [read]
├── blogs.ts           🆕  /api/blogs, /api/blogs/:slug (P2)
├── guides.ts          🆕  /api/guides, /api/guides/:slug (P2)
├── recommendations.ts 🆕  /api/recommendations (P2) [write]
├── portfolio.ts       🆕  /api/portfolio (aggregate: bio+links+resume) (P2) [read]
├── categories.ts      ✅   projects.ts ✅  skills.ts ✅  experience.ts ✅
├── testimonials.ts    ✏️   wire to recommendation.service
├── inquiries.ts       ✏️   add freelance-proposal shape
├── resume.ts          ✅   chat.ts ✅ (still proxies to ai-service)
└── health.ts          ✅
```

### 4.5 ✏️ Config / env — `src/config/env.ts`
Add: `GITHUB_TOKEN`, `SMTP_*` / email provider, `SLACK_WEBHOOK_URL`, `REDIS_URL`,
`OAUTH_*` (Google/GitHub client id/secret), `API_KEY_PEPPER`, `MCP_OAUTH_ISSUER`.

---

## 5. `apps/ai-service` — migrate to LangChain `create_agent`

Keep **own FastAPI SSE** (decided). Keep `main.py`, `api/routes/chat.py`, `health.py`.

```
src/
├── agent/                     🆕
│   ├── build.py               🆕  create_agent(model, tools, system_prompt) via init_chat_model
│   ├── prompts.py             ✏️  moved/extended from core/prompts.py
│   └── streaming.py           🆕  agent event stream → existing SSE delta/tool/done events
├── tools/                     🆕  thin @tool wrappers → httpx call to api-gateway
│   ├── __init__.py            🆕  registry (own Python copy of the tool catalog)
│   ├── gateway_client.py      🆕  authenticated httpx client (forwards caller identity)
│   ├── content_tools.py       🆕  get_projects/skills/experience/github/portfolio [read]
│   ├── action_tools.py        🆕  book_meeting/send_email/leave_recommendation/inquiry [write]
│   └── guide_tools.py         🆕  portfolio_guide
├── services/
│   ├── context.py             ✅  (still fetches portfolio context, cached)
│   └── llm.py                 🗑️→✏️  replaced by agent/streaming.py (raw OpenAI calls removed)
└── config.py                  ✏️  add MODEL_PROVIDER, MODEL_NAME (model-agnostic ready)
```
- `pyproject.toml` ✏️ add `langchain`, `langgraph`, `langchain-openai`.
- **Identity forwarding:** `gateway_client.py` forwards the website visitor's session so
  tools act on-behalf-of the user (not god-mode).

---

## 6. `apps/remote-mcp-server` — Remote MCP (HTTP + OAuth) 📦🆕 → CONTAINER :8002

Self-contained TS app. Its own tool code (no shared core).
```
apps/remote-mcp-server/
├── package.json       🆕  @modelcontextprotocol/sdk + provider SDK
├── tsconfig.json      🆕
├── Dockerfile         🆕  multi-stage node:22-alpine, non-root, port 8002
└── src/
    ├── index.ts       🆕  HTTP (streamable) MCP server
    ├── gatewayClient.ts 🆕  HTTP client → api-gateway (injects resolved user's auth)
    ├── tools/         🆕  register tools; each = a gateway call
    │   ├── read.ts    🆕  get_projects/skills/experience/github/portfolio/guide
    │   └── write.ts   🆕  book_*/send_email/leave_recommendation/service_inquiry
    ├── oauth/         🆕  OAuth 2.1 resource-server (see §9)
    │   ├── metadata.ts 🆕  /.well-known/oauth-protected-resource (RFC 9728)
    │   └── verify.ts   🆕  validate access token (issuer/audience/exp/scopes)
    └── auth.ts        🆕  OAuth token → Principal → gateway (logged-in only)
```
- **Logged-in only:** no tool responds without a valid OAuth token → resolved user.
- Publicly reachable (Claude/ChatGPT/Grok must connect).

---

## 7. `apps/local-npm-mcp-server` — publishable npm package 📦🆕 (NOT deployed)

Self-contained TS app. Ship this one first.
```
apps/local-npm-mcp-server/
├── package.json       🆕  bin: "prajwalraj-mcp"; @modelcontextprotocol/sdk
├── tsconfig.json      🆕
├── README.md          🆕  install + how to paste API key (from /mcp page)
└── src/
    ├── index.ts       🆕  stdio MCP server; reads PRAJWALRAJ_API_KEY from env
    ├── gatewayClient.ts 🆕  HTTP client → api-gateway with Bearer key
    └── tools/         🆕  read.ts / write.ts (mirror of remote — the watched duplication)
```
- Users add to `mcp.json` (Cursor/Claude Desktop):
  `{ "command": "npx", "args": ["-y", "prajwalraj-mcp"], "env": { "PRAJWALRAJ_API_KEY": "pk_live_..." } }`
- Key validated by gateway `ApiKey` layer; scoped + rate-limited per key.

---

## 8. `apps/local-python-mcp-server` — publishable pip package 📦🆕 (NOT deployed, LATER)

Self-contained Python app. Deferred — build only if pip/Python-desktop users ask.
```
apps/local-python-mcp-server/
├── pyproject.toml     🆕  entry: "prajwalraj-mcp"; mcp (python sdk)
├── README.md          🆕
└── src/
    ├── server.py      🆕  stdio MCP server; reads PRAJWALRAJ_API_KEY env
    ├── gateway.py     🆕  httpx client → api-gateway with Bearer key
    └── tools.py       🆕  same tool set (Python copy)
```
- Users add via `uvx` / Claude Desktop config with `PRAJWALRAJ_API_KEY`.

---

## 9. OAuth authorization server (for Remote MCP) — §5.3 of decisions

> **Scope note:** this section is **P5-only** and separate from site auth. Site auth
> (login/signup) is built our own with a library in **P1** (§13.1.A). This OAuth server is
> the *hard* piece and is **deferred** — decide managed-vs-extend-library at P5.

**Decision at P5 (recommended: use a provider, don't hand-roll).**
- MCP server = **resource server** (validates tokens, hosts protected-resource metadata).
- Authorization server = **provider** implementing DCR + PKCE + Resource Indicators:
  candidates **WorkOS AuthKit / Stytch / Auth0 / Clerk / Scalekit**.
- Because Claude & ChatGPT forbid m2m, there's always user consent → our login is the
  consent screen ("Sign in with Prajwal").
- **Sub-decision:** let the same provider also be the site's user-auth IdP (unifies
  login/signup + MCP OAuth) — recommended to avoid running two identity systems.

Files: `apps/remote-mcp-server/src/oauth/*` + gateway `src/auth/oauth/*` (token validation).

---

## 10. `apps/web` — frontend

### 10.1 🆕 Auth & session
```
app/(auth)/login/page.tsx        🆕   app/(auth)/signup/page.tsx 🆕
lib/auth.ts                      🆕   session helpers (cookie), useUser hook
middleware.ts                    🆕   protect /dashboard,/settings,/mcp,/connect,/services,/admin/*
```

### 10.2 🆕 Public pages
```
app/page.tsx                 ✏️  home
app/guides/page.tsx          🆕   app/guides/[slug]/page.tsx 🆕
app/blogs/page.tsx           🆕   app/blog/[id]/page.tsx 🆕
app/projects/[slug]/page.tsx ✅   (project detail exists)
app/contact/page.tsx         🆕
app/chatfeatures/page.tsx    🆕
```

### 10.3 🆕 User (private) pages
```
app/(user)/dashboard/page.tsx  🆕
app/(user)/settings/page.tsx   🆕
app/(user)/connect/page.tsx    🆕
app/(user)/services/page.tsx   🆕
app/(user)/mcp/page.tsx        🆕  API-key manager: create/list/revoke, show-once, docs
app/chat/page.tsx              ✏️  logged-in chat (history)
```

### 10.4 🆕 Admin pages
```
app/admin/page.tsx             🆕  dashboard
app/admin/projects/page.tsx    🆕   app/admin/users/page.tsx 🆕
app/admin/guides/page.tsx      🆕   app/admin/blogs/page.tsx 🆕
```

### 10.5 ✏️ Chat UI — low-level LangChain UI primitives
```
components/chat/*              ✏️  ChatContainer/Input/Message(s) — render markdown,
                                   tool-call cards, human-in-the-loop, streaming text
lib/fetchers.ts                ✏️  add blogs/guides/portfolio fetchers; import @portfolio/types
lib/api.ts                     ✅  proxy pattern kept
app/api/chat/stream/route.ts   ✅  SSE proxy kept (own FastAPI SSE)
```

---

## 11. Config / secrets / infra

- ✏️ `k8s/secrets.yaml` — **rotate the committed Neon `DATABASE_URL`** (see git status);
  move real secrets to sealed-secrets / external-secrets, keep only placeholders in git.
- 🆕 `k8s/remote-mcp-server/` — deployment + service (port 8002) + ingress (public).
- 🆕 ingress for `web` + `remote-mcp-server`; `status.prajwalraj.com` wired to `/health`.
- ✏️ `docker-compose.yml` — add `remote-mcp-server`, `redis` (per-key rate limit).
- 🆕 `.github/workflows/ci.yml` — build/test/typecheck + build & push images (P7).
- 🆕 `infrastructure/*` — terraform/helm/argocd filled (P7).

---

## 12. Env vars added (summary)

| Where | Vars |
|---|---|
| api-gateway | `GITHUB_TOKEN`, `SMTP_*`/email, `SLACK_WEBHOOK_URL`, `REDIS_URL`, `OAUTH_GOOGLE_*`, `OAUTH_GITHUB_*`, `API_KEY_PEPPER`, `MCP_OAUTH_ISSUER` |
| ai-service | `MODEL_PROVIDER`, `MODEL_NAME`, `GATEWAY_SERVICE_TOKEN` |
| mcp-server | `GATEWAY_URL`, `OAUTH_ISSUER`, `OAUTH_AUDIENCE`, provider creds, `PORT=8002` |
| mcp-local | `PRAJWALRAJ_API_KEY`, `PRAJWALRAJ_API_BASE` |

---

## 13. Open decisions (blockers to resolve before their phase)

1. **Auth — split into TWO problems (this un-confuses it):**
   - **A. Site auth** (login/signup: email/password + Google + GitHub) → **DONE in P1.**
     We did NOT use better-auth — we **extended the existing hand-rolled Fastify auth**
     (JWT/bcrypt/`Session`) and added `arctic` only for Google/GitHub OAuth-client flows.
     Verified end-to-end (Postman + browser OAuth). See PHASE1_BACKEND_PLAN §0.
   - **B. MCP OAuth 2.1 authorization server** (for the *remote* MCP) → **DEFERRED to P5.**
     Hard + security-critical; do NOT hand-roll first. At P5 either extend the auth
     library (if it has an OIDC/MCP provider mode by then) or drop in a managed provider
     (WorkOS AuthKit — free) for that one piece.
   - Key point: **P1 does not need B.** Local MCP uses bearer API keys (own DB), not OAuth.
2. ✅ **User auth — DECIDED:** email/password **+** Google **+** GitHub. `User.passwordHash`
   nullable (null for social users). Register free Google/GitHub OAuth *apps* for social.
3. ✅ **Local pip package — DECIDED:** in scope (`apps/local-python-mcp-server`), shipped
   after the npm one.
4. ✅ **Recommendations = Testimonials — DECIDED:** reuse the existing `Testimonial` model;
   the `leave_a_recommendation` tool writes a `Testimonial` (status=pending → approve).
5. ✅ **Rate limiting — DECIDED:** in-memory bucket for now. **TODO: swap to Redis later**
   (before real k8s deploy). Tracked here so we don't forget.

---

## 14. What we are explicitly NOT doing now

- `McpCredential` feature (users' own MCP servers) — parked.
- Model router / LLM gateway — future.
- RAG / pgvector embeddings pipeline (`EmbeddingMetadata` stays unused) — future.
- Full observability stack (Prometheus/Grafana/Loki) — future.
- Blue/Green deploy strategy — future (rolling for now).
- Shared packages of any kind — not now (see §1 / decisions §3).

---

## 15. Deployment topology

**4 application containers you deploy:**

| # | Container | Tech | Port | Exposure |
|---|---|---|---|---|
| 1 | `web` | Next.js | 3000 | Public (ingress) |
| 2 | `api-gateway` | Fastify | 8000 | Internal only |
| 3 | `ai-service` | FastAPI | 8001 | Internal only |
| 4 | `remote-mcp-server` | MCP HTTP+OAuth | 8002 | **Public** (Claude/ChatGPT/Grok connect) |

**Dependencies (NOT app containers):**
- **Postgres** → Neon, external managed. Only `api-gateway` connects.
- **Redis** → optional extra container/managed service; only if server-side per-key rate
  limiting is enabled (Decision #5).
- **OAuth provider** (WorkOS/Stytch/…) → external SaaS.

**NOT deployed — published packages that run on the user's machine:**
- `local-npm-mcp-server` → `npm publish` → users run via `npx`.
- `local-python-mcp-server` → PyPI → users run via `uvx` (later).

**Internal networking (same in Docker Compose & k8s via DNS):**
```
Public ─▶ web ─▶ api-gateway ─▶ ai-service ─▶ (agent tools loop back to api-gateway)
                    ▲                └─▶ OpenAI
Public ─▶ remote-mcp-server ─▶ api-gateway    (after OAuth: token → user principal)
User's laptop: local-*-mcp-server ─▶ api-gateway  (Bearer API key over HTTPS)
                    │
              Neon Postgres (only api-gateway connects)
```
