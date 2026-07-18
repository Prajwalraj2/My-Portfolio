# Design Decisions & Roadmap

> Living record of the architecture discussions for `prajwalraj.com`.
> Captures what we agreed on, why, and what's parked for later.
> Last updated: 2026-07-14

---

## 0. Guiding Principle

**The backend API is the single source of truth. Everything else is a thin client.**

All business logic and data live in the backend (Fastify) — implemented **once**. The
AI agent, the Remote MCP server, and the Local MCP package are all **thin adapters**
that translate a tool call → an HTTP call to the backend. They contain almost no logic
of their own.

```
                        ┌─────────────────────────────┐
   Website (Next.js) ──▶│                             │
   AI Agent (LangChain)─▶│   Backend API (Fastify)    │──▶ Postgres
   Remote MCP (HTTP)  ──▶│   = single source of truth │──▶ OpenAI (later: model-agnostic)
   Local MCP (stdio)  ──▶│   unified auth: JWT|APIkey  │──▶ Calendar / Email / Slack / etc
                        └─────────────────────────────┘

   • Remote + Local MCP share ONE tool-definition core (two transports).
   • All tool surfaces are thin HTTP adapters — zero business logic.
   • Rate limiting + auth enforced in the backend, so it applies to every surface.
```

Consequence: adding a capability (e.g. `book_meeting`) means implementing it once in the
backend, then writing a ~10-line adapter in each surface that needs it.

---

## 1. The Five Building Blocks

| Block | Current state | Direction |
|---|---|---|
| **Frontend** | Next.js 16 (App Router, React 19) | **Stay on Next.js** (see §2) |
| **Backend** | Fastify gateway, partial APIs | Build APIs incrementally |
| **AI** | OpenAI SDK, custom FastAPI SSE | Move to LangChain `create_agent` + `@tool` (see §4) |
| **Remote MCP Server** | Not built | HTTP transport, auth required (see §5) |
| **Local MCP Server** | Not built | npm/pip package, auth required (see §5) |

---

## 2. Frontend — DECIDED: Stay on Next.js

**Decision:** Keep Next.js. Do **not** migrate to a plain React SPA.

**Why the original "move to React" reasoning doesn't hold:**
- The LangChain frontend features the user wants
  (overview, markdown messages, tool-calling UI, headless tools, human-in-the-loop,
  and generative `/ui`) are **React SDKs**.
- **Next.js *is* React.** Those React components run inside Next.js with zero friction.
- Migrating to a plain React SPA would **lose** SSR/SEO (critical for a portfolio that
  recruiters search for) and gain **nothing** for the LangChain UI.

**The real (backend) subtlety, not a frontend one:** LangChain's `useStream` hook /
Agent Chat UI expects a **LangGraph-compatible streaming endpoint**. That's a backend
deployment question — see §4.

---

## 3. Monorepo — DECIDED: Keep the monorepo, but SELF-CONTAINED apps (no shared packages)

**Decision (revised 2026-07-14):** Keep the single repo for convenience (one clone, one
place), but **every app is fully self-contained** — no shared `packages/*`. Each app owns
its own types, utils, config. "Later we can see what to share" if duplication hurts.

**Why (user's call, and it's sound):**
- Only the **backend** touches the database → all DB/Prisma lives in
  `apps/api-gateway/prisma/schema.prisma`. **Single source of truth.** `packages/database`
  is **removed** (already absorbed into api-gateway — see git history: *"Move database
  package into api-gateway for simpler Docker builds"*).
- Shared packages in a polyglot monorepo cause build/Docker coupling pain (already felt).
  Self-contained apps → simpler Dockerfiles, independent builds, easier to reason about
  for a solo developer.
- Frontend types stay in `web`, backend types in `api-gateway`, AI in `ai-service`, each
  MCP app owns its own tool code.

**The one duplication to watch (deferred, not fixed now):** `remote-mcp-server` and
`local-npm-mcp-server` are both TypeScript with near-identical tool code (both just call
the backend). Adding a tool = editing two places. That's where a shared bit would emerge
later if it becomes annoying.

**Consequence:** `packages/types`, `packages/database`, `packages/ui`, `packages/utils`,
`packages/config` are **not used**. The plan no longer creates shared packages.

---

## 4. AI Service — DECIDED direction

**Decisions:**
- Migrate from raw OpenAI SDK → **LangChain `create_agent`** with `@tool` tools.
- Tools are **thin wrappers over the backend** (`httpx` → gateway). No DB / business
  logic inside tools.
- **Model:** start with OpenAI. `create_agent` uses `init_chat_model`, so going
  model-agnostic later is a config change, not a rewrite.
- **Chat UI transport — DECIDED (for now):** keep our **own FastAPI SSE** and use the
  **lower-level LangChain UI primitives**. NOT adopting `useStream` / LangGraph-server
  deployment at this stage.

**Identity forwarding:** When a website visitor chats, the agent's tools must call the
backend **on behalf of that visitor** (their session + rate limits) — not with a
god-mode service key for everything.

**Parked:** model router / LLM gateway (multi-provider routing) → future TODO.

---

## 5. MCP Servers & Auth

### 5.1 Shared core
- **One MCP tool-definition core, two transports:** HTTP (remote, hosted by us) and
  stdio (local npm/pip package). Only the base URL and how the auth credential is
  supplied differ. Don't build two separate servers.
- Both are thin HTTP clients to the backend (per §0).

### 5.2 How each host actually accepts auth (screenshots + internet-verified, 2026-07-14)

| Client | Auth mechanism | Static bearer key / API key? |
|---|---|---|
| **claude.ai** | **OAuth 2.1 + PKCE only**; Advanced settings = *optional pre-registered* Client ID/Secret | ❌ No bearer/header field (confirmed: claude-ai-mcp issue #112) |
| **ChatGPT** | **OAuth 2.1 + PKCE only** — docs *explicitly* forbid API keys, bearer tokens, m2m/client-credentials, mTLS | ❌ Explicitly unsupported |
| **Grok** | URL only → relies on **OAuth discovery** | ❌ No auth field |
| **Manus** | Custom headers | ✅ `Authorization: Bearer <key>` |
| **Cursor / local** | `headers` (http) or `env` (stdio) in `mcp.json` | ✅ Yes |

**VERIFIED key findings (MCP spec + host docs):**
1. **The MCP spec (Nov 2025 revision) MANDATES OAuth 2.1 + PKCE (S256)** for any remote
   MCP server intended for public use. Not optional for public servers.
2. **Claude AND ChatGPT require OAuth 2.1 with a real *user-consent* (authorization-code
   + PKCE) flow.** Both **explicitly reject** machine-to-machine / client-credentials /
   static API keys — *every connection needs a human to click "Authorize."*
3. Spec discovery chain: `WWW-Authenticate` → `/.well-known/oauth-protected-resource`
   (RFC 9728) → `/.well-known/oauth-authorization-server` (RFC 8414). Plus DCR (RFC 7591)
   and Resource Indicators (RFC 8707).
4. A static bearer key works **only** for clients with a custom-header field
   (Manus, Cursor, local stdio, programmatic). The `mcp-remote` npm proxy can bridge a
   bearer server into an OAuth-only client, but it forces users to run a local proxy —
   kills the "just paste a URL" UX.

**Implication that changes the plan:** if the remote MCP server must work in
**Claude / ChatGPT / Grok** (the stated goal — "use it via claude.ai or anything"), then
**OAuth 2.1 is REQUIRED, not a nice-to-have.** Bearer keys alone cannot reach those hosts.

### 5.3 Auth plan — revised after verification

- **Local MCP (stdio npm/pip package) → bearer-token API key.** Genuinely simple; key
  lives in `env` / config. Ships first. The `/mcp` page generates it (**hashed, shown
  once**). Also covers Cursor + Manus + programmatic.
- **Remote MCP for Claude/ChatGPT/Grok → OAuth 2.1 + PKCE with user consent. Unavoidable
  if we want those hosts.** Our portfolio login *is* the consent screen → "Sign in with
  Prajwal."
  - **Do NOT hand-roll the spec.** Use a provider with **MCP-specific** support
    (WorkOS AuthKit / Stytch / Auth0 / Clerk / Scalekit) that implements DCR +
    Protected Resource Metadata + PKCE for us. MCP server = OAuth **resource server**;
    provider = **authorization server**.
  - Because m2m is forbidden, there is always a human in the loop — fine for our use case.
- Both paths resolve to the **same backend principal** via the unified auth layer (§6).

### 5.3.1 Sources (verified 2026-07-14)
- MCP Authorization spec — https://modelcontextprotocol.io/specification/draft/basic/authorization
- MCP security tutorial — https://modelcontextprotocol.io/docs/tutorials/security/authorization
- Claude custom connectors — https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp
- Claude connector auth docs — https://claude.com/docs/connectors/building/authentication
- claude-ai-mcp issue #112 (no bearer field) — https://github.com/anthropics/claude-ai-mcp/issues/112
- ChatGPT Apps SDK auth (OAuth-only, no API keys) — https://developers.openai.com/apps-sdk/build/auth
- WorkOS: best MCP auth providers 2026 — https://workos.com/blog/best-mcp-server-authentication-providers

### 5.4 Read/Write split (abuse control)
- **Read tools** (`get_projects`, `get_skills`, `get_experience`, `get_github`,
  `portfolio_guide`) → may be **public but IP-rate-limited** (lets people try instantly).
- **Write tools** (`book_meeting`, `send_email`, `submit_proposal`,
  `leave_recommendation`) → **always require key/OAuth**, per-key rate limits, **and**
  routed through the approval step (notification-service → Prajwal approves) before
  anything real happens. Never let a third-party LLM act autonomously.

### 5.5 Tool exposure config — two levels
1. **Surface-level** (config/DB): does the tool exist on the MCP surface at all, and is
   it read / write / public? (The on-off switch.)
2. **Per-key scopes** (DB, on the `ApiKey` record): which tools *this key* may call +
   its rate-limit bucket. (E.g. hand a recruiter a higher-access key.)

Rate limiting is **token-bucket per key, enforced in the backend**, so it applies across
all surfaces (chat, remote MCP, local MCP).

---

## 6. Backend Auth Layer — DECIDED (build early)

A **unified auth middleware** that accepts any credential type and produces a normalized
principal:

```
{ principal, scopes, rateLimitBucket }
```

Credential types hitting the same endpoints:
1. Website users → session JWT / cookie
2. AI service → service-to-service
3. MCP → bearer key (Phase 1) / OAuth token (Phase 2)

Build this abstraction **before** there are 40 endpoints, not after.

---

## 7. Data Model note

- The existing **`McpCredential`** model is the **opposite** direction — it's for users
  connecting *their own* MCP servers for the agent to use. **Parked** (introducing it now
  would confuse users). Leave the model in the schema; build nothing.
- The keys we issue (to access *our* MCP server) are a **new concept** → a new
  **`ApiKey`** table (hashed key, owner, scopes, rate-limit bucket, last-used, revocation).

---

## 8. Planned Pages (draft — will add/remove as needed)

### Public
| Page | Route |
|---|---|
| Home | `/` |
| Guides / Features | `/guides` |
| Blogs | `/blogs` |
| Single Blog | `/blog/:id` |
| Projects (category) | `/` (project pages) |
| Single Project | `/project/:id` |
| Login | `/login` |
| Signup | `/signup` |
| Status | `status.prajwalraj.com` |
| Contact | `/contact` |
| Chat Features | `/chatfeatures` |

### User (private)
| Page | Route |
|---|---|
| Connect with Prajwal | `/connect` |
| Info / Settings | `/settings` |
| Chat | `/chat` |
| MCP Auth Key manager | `/mcp` |
| Dashboard | `/dashboard` |
| Service Inquiry | `/services` |

### Admin (private)
| Page | Route |
|---|---|
| Project Management | `/admin/projects` |
| User Management | `/admin/users` |
| Guide Management | `/admin/guides` |
| Blog Management | `/admin/blogs` |
| Dashboard | `/admin/` |

**Notes:**
- `status.prajwalraj.com` should hit **real** uptime checks against `/health` endpoints,
  not a static page.
- `/mcp` is a **key manager** (list / revoke / last-used), not a one-shot generator.

---

## 9. Planned Tools (draft — add incrementally)

| Tool | Name | Method | Read/Write | Notes |
|---|---|---|---|---|
| Get Projects | `get_prajwalraj_projects` | GET | Read | |
| Get Skills | `get_prajwalraj_skills` | GET | Read | |
| Get Experience | `get_prajwalraj_experience` | GET | Read | |
| GitHub | `get_prajwalraj_github_things` | GET | Read | Repos, langs, projects |
| Portfolio | `get_prajwalraj_portfolio` | GET | Read | |
| Guide | `prajwal_portfolio_guide_tool` | GET | Read | How to use the Remote MCP server |
| Book a Date | `book_a_date_with_prajwal` | POST | Write | Approval + rate limit |
| Book Online Meeting | `book_online_meeting_with_prajwal` | POST | Write | Approval + rate limit |
| Book Offline Meeting | `book_offline_meeting_with_prajwalraj` | POST | Write | Approval + rate limit |
| Send Email | `send_an_email_to_prajwal` | POST | Write | Approval + rate limit |
| Service Inquiry | *(tbd)* | POST | Write | Inquire about services |
| Slack Notify | `send_prajwal_notification` | POST | Write | Used by AI internally |
| Recommendation | `leave_a_recommendation` | POST | Write | Pending approval |
| Freelance Proposal | *(tbd)* | POST | Write | Approval + rate limit |

Each tool tagged **read/write** and **public/key-required** from day one (§5.4–5.5).

---

## 10. Parked / Future TODO

- Model router / LLM gateway (multi-provider).
- OAuth 2.1 for the **remote** MCP server — required (not optional) to reach
  Claude/ChatGPT/Grok; sequenced after the local bearer-key path. See §5.3.
- `McpCredential` — users connecting their own MCP servers (far future).
- Blogs/Guides CMS scope.
- The empty stub services (`analytics-service`, `contact-service`,
  `notification-service`) and empty `packages/*` — filled incrementally.
- `infrastructure/` (argocd, helm, terraform, terragrunt) and CI/CD — all still
  scaffolding; built later.

---

## 11. Open Questions

- (Answered) Chat UI transport → **own FastAPI SSE + low-level primitives** for now.
- Full remaining scope — user said "more coming"; to be captured as it's shared.
