# Phase 3 — AI Agent (detailed plan)

> Scope: **ai-service only.** Migrate from the raw OpenAI streaming call to a **LangChain
> `create_agent`** tool-calling agent whose tools are thin wrappers over the gateway
> endpoints built in Phases 1–2. Keep our **own FastAPI SSE** (decided) and the existing
> event contract, extended with tool events. Last updated: 2026-07-15.

---

## 0. Current state (what we're replacing)

- **FastAPI**, port 8001. `main.py` mounts `health` + `chat` routers.
- `api/routes/chat.py` → `POST /chat/stream` (SSE via `sse-starlette`) + `/chat/complete`,
  both delegate to `stream_chat_response`.
- `services/llm.py` → **raw `AsyncOpenAI` streaming**. Builds a big system prompt from
  portfolio context, streams tokens, yields `{event: delta|done|error}`.
- `services/context.py` → fetches projects/skills/experience/categories from the gateway,
  caches 5 min, formats into the prompt.
- `core/prompts.py` → the system prompt (identity + full portfolio dump).
- `config.py` → `openai_api_key`, `openai_model=gpt-4o`, `api_gateway_url`, cache ttl, CORS.
- `models/schemas.py` → `ChatRequest{messages, session_id}`, `ChatMessage{role, content}`.

**What stays:** FastAPI app, the two chat routes + SSE, the `{event, data}` contract, the
context cache. **What changes:** `llm.py` (raw OpenAI) → a LangChain agent that can *act*.

---

## 1. The one big decision — how tools authenticate to the gateway

Most tools call **public** gateway endpoints (projects, skills, github, portfolio, guides,
contact, inquiries, testimonials — all public). **Only `book_meeting` requires auth**
(`requireUser` + `meetings:write` scope). So this is really just: how does the agent get
authorized to book?

**Recommended: a dedicated service API key.**
- Seed a system user (e.g. `ai-service@internal`) + an **API key** with scopes
  `[all reads, meetings:write]`, high `rateLimitPerHour`. Store it in ai-service's env as
  `GATEWAY_API_KEY`.
- **Every** agent tool call sends `Authorization: Bearer pk_live_…` (the service key). The
  gateway resolves it to the AI-service user → `book_meeting` passes; reads work as before;
  per-key rate limiting applies.
- Booking attendee details (name/email/timezone) are **collected in conversation** and
  passed to Cal.com — so a **guest can book via chat** by giving their email (which is what
  we want on a portfolio; the "logged-in only" rule was for *remote MCP*, not site chat).

**Alternative (deferred):** *identity forwarding* — web passes the logged-in user's session
→ gateway → ai-service → tool calls act as that real user. More "correct" attribution, but
needs the whole chain to thread identity, and today's site chat is anonymous. Revisit when
logged-in chat with saved history lands.

→ **DECIDED (2026-07-15):** use the **service-key** approach. **No login required to chat or
to take actions** — the bot acts on behalf of any visitor; booking/contact collect the
visitor's email in conversation. (The "logged-in only" rule applies to *remote MCP*, not
site chat.)

---

## 2. Sequence

```
1.  Deps       → add langchain, langgraph, langchain-openai to pyproject; uv sync
2.  Config     → MODEL_PROVIDER/MODEL_NAME (model-agnostic), GATEWAY_API_KEY (service key)
3.  Service key→ seed a system user + scoped API key; put pk_live_… in ai-service/.env
4.  Gateway cli→ tools/gateway.py — httpx client that injects the service key
5.  Tools      → content_tools.py + action_tools.py (@tool wrappers; custom progress writer)
6.  Prompt     → agent/prompts.py — lean identity prompt + tool-use + confirm-before-write
7.  Agent      → agent/build.py: create_agent(model, tools, middleware=[limits, summarization])
8.  Streaming  → agent/streaming.py: multi-mode astream → delta/progress/tool/done
9.  Routes     → chat.py: /chat/stream + /chat/complete use the agent (stateless)
10. Remove     → services/llm.py (old raw-OpenAI path)
11. Test       → reads (github/projects), booking (confirm-in-text → Cal.com), limits
```
*(No checkpointer / resume endpoint / gateway change — prompt-based confirmation is stateless.)*

---

## 3. File changes — `apps/ai-service/src/`

```
src/
├── agent/                     🆕
│   ├── __init__.py       🆕
│   ├── build.py          🆕  create_agent(model, tools, middleware) — one shared agent (stateless)
│   ├── middleware.py     🆕  tool-call + model-call limits, summarization (HITL added later)
│   ├── prompts.py        🆕  lean system prompt (identity + brief summary + confirm-before-write)
│   └── streaming.py      🆕  multi-mode astream → {delta|progress|tool_start|tool_end|done|error}
├── tools/                     🆕
│   ├── __init__.py       🆕  ALL_TOOLS registry
│   ├── gateway.py        🆕  authed httpx client (Bearer GATEWAY_API_KEY) + helpers
│   ├── content_tools.py  🆕  get_projects, get_skills, get_experience, get_github, get_portfolio, get_guides
│   └── action_tools.py   🆕  get_meeting_slots, book_meeting, send_email_to_prajwal, submit_inquiry, leave_recommendation
├── services/
│   ├── context.py        ✏️  keep; used to build the brief prompt summary (reuse fetch/format)
│   └── llm.py            🗑️  removed (replaced by agent/streaming.py)
├── core/prompts.py       ✏️  trimmed → moves into agent/prompts.py (or re-exported)
├── api/routes/chat.py    ✏️  /stream + /complete use the agent (stateless)
├── models/schemas.py     ✅  reuse ChatRequest{messages, session_id}
└── config.py             ✏️  MODEL_PROVIDER, MODEL_NAME, GATEWAY_API_KEY
```
`pyproject.toml` ✏️ add `langchain`, `langgraph`, `langchain-openai` (+ `uv sync`).
**Gateway/web:** no changes — the existing chat proxy pumps the new SSE events through.

---

## 4. The tools (thin wrappers over the gateway)

| Tool | Gateway call | Type |
|---|---|---|
| `get_projects(category?)` | `GET /api/projects` | read |
| `get_skills()` | `GET /api/skills/grouped` | read |
| `get_experience()` | `GET /api/experience` | read |
| `get_github()` | `GET /api/github` | read |
| `get_portfolio()` | `GET /api/portfolio` | read |
| `get_guides()` / `get_guide(slug)` | `GET /api/guides[/:slug]` | read |
| `get_meeting_slots(start,end,tz)` | `GET /api/meetings/slots` | read (booking step 1) |
| `book_meeting(start,name,email,tz,topic)` | `POST /api/meetings` | **write** (service key + scope) |
| `send_email_to_prajwal(name,email,subject,message)` | `POST /api/email/contact` | write (public) |
| `submit_inquiry(name,email,description,…)` | `POST /api/inquiries` | write (public) |
| `leave_recommendation(authorName,content,rating,…)` | `POST /api/testimonials` | write (public) |

Each is a `@tool`-decorated function with a clear docstring (the LLM reads it) that calls
`tools/gateway.py`. **Zero business logic** — just HTTP + shape the result for the model.

---

## 5. System prompt strategy (hybrid)

Keep the prompt **lean** but useful:
- Identity: who Prajwal is (from `Profile` / a short blurb).
- A **brief** portfolio summary (project count, top skills, current role) via the existing
  `context.py` — cheap, gives instant answers to common questions without a tool round-trip.
- **Tool-use guidance:** when to fetch details (github/full project list), when to act
  (booking, contact, inquiry), and to **confirm details before any write/booking**.

This balances latency (common Q's answered from the summary) with capability (tools for
live data + actions). The heavy full-dump prompt is retired in favor of tools.

---

## 6. Streaming — multi-mode, so the user never sees a blank screen

Use LangChain's **multi-mode streaming** (verified against the v1 docs):
```python
async for chunk in agent.astream(
    {"messages": [...]},
    config={"configurable": {"thread_id": thread_id}},
    stream_mode=["messages", "updates", "custom"],
    version="v2",
):
    # chunk = { "type": "messages"|"updates"|"custom", "data": ... }
```
Map each mode to our SSE contract:

| stream_mode | → SSE event | Data | UX |
|---|---|---|---|
| `messages` (LLM token) | `delta` | `{content}` | typing effect |
| `custom` (via `get_stream_writer()` in a tool) | `progress` | `{message}` | "🔎 Checking availability…" |
| `updates` (a tool ran) | `tool_start` / `tool_end` | `{name, ok}` | "🔧 get_github" |
| final | `done` | `{session_id, tokens_used, latency_ms, model}` | end |
| exception | `error` | `{error}` | failure |

The **`custom` writer inside tools** is what gives the "something is happening" feel — each
tool can emit human-readable progress before it returns. The gateway chat proxy and the web
`/api/chat/stream` route **pump bytes through unchanged**, so all new events reach the
frontend with **no gateway/web changes**.

---

## 6.5. Middleware — lean into what LangChain gives us

`create_agent(..., middleware=[...])`. The ones we'll use:

| Middleware | Why | Config | Phase 3? |
|---|---|---|---|
| **ToolCallLimitMiddleware** | Stop runaway tool loops (public bot) | max ~8 tool calls / run | ✅ now |
| **ModelCallLimitMiddleware** | Cap LLM calls per run (cost) | max ~10 model calls / run | ✅ now |
| **SummarizationMiddleware** | Keep long chats under token limits | summarize near limit | ✅ now |
| **HumanInTheLoopMiddleware** | Enforced confirm before writes | `interrupt_on={book_meeting, send_email}` | ⏳ later (needs checkpointer + resume) |
| PII detection, Model fallback | privacy / resilience | — | ⏳ later |

*(Confirmation for writes is prompt-based in Phase 3 — see below. The limit + summarization
middleware need no checkpointer and ship now.)*

### Confirmation approach — DECIDED: **prompt-based now, HITL later**
For Phase 3 we keep it **simple and stateless**: the system prompt instructs the agent to
**confirm the details in text before any write** ("Shall I book Tuesday 3 pm and email you
the invite?") and only call `book_meeting`/`send_email` after the user says yes. This needs
**no checkpointer, no `thread_id`, no resume endpoint** — the client keeps sending the full
message history each turn, so the agent stays stateless per request.

**Enforced HITL middleware** (interrupt + `/chat/resume` + checkpointer) is **deferred** to a
near-future iteration — the tool list and prompt are structured so adding it later is
localized (wrap the two write tools with `HumanInTheLoopMiddleware`, add a checkpointer +
resume route). See §11.

The other guardrail middleware below need **no** checkpointer and ship now.

---

## 7. Model config (model-agnostic ready)

- `agent/build.py` uses `init_chat_model(f"{MODEL_PROVIDER}:{MODEL_NAME}")` → start with
  `openai:gpt-4o` (existing key). Switching provider later = env change, not a rewrite.
- Keep `OPENAI_API_KEY`; add `MODEL_PROVIDER=openai`, `MODEL_NAME=gpt-4o`.
- Router / LLM-gateway remains a future TODO.

---

## 8. Booking flow (multi-turn, agent-orchestrated)

```
visitor: "I'd like to talk to Prajwal about a project"
  → agent calls get_meeting_slots(next 2 weeks, visitor tz) → presents a few options
visitor: "Tuesday 3pm works, I'm Jane, jane@acme.com"
  → agent confirms details in text, then calls book_meeting(...)
  → Cal.com creates the booking + Meet link + emails Jane; we mirror + Slack-notify Prajwal
  → agent replies with confirmation
```
The agent's reasoning drives the multi-turn; we only supply the tools. (Human-in-the-loop
interrupts are possible later; for P3 the agent confirms in text before writing.)

---

## 9. What I need from you
1. ✅ **Service-key auth** — confirmed. No login to chat/act.
2. ✅ **OpenAI key** — confirmed present in `apps/ai-service/.env`.
3. ✅ **Confirmation** — DECIDED: **prompt-based** now (stateless); enforced HITL later.
4. I'll generate the **gateway service key** (seed a system user + scoped key) into
   `ai-service/.env` as `GATEWAY_API_KEY` — nothing for you to fetch.

---

## 10. Testing (Phase 3)
- `GET /health` + `GET /api/chat/health` (gateway → ai-service) green.
- Chat "tell me about Prajwal's projects" → answer (from summary or `get_projects`).
- "show me his GitHub" → `get_github` tool fires (see `tool_start`/`tool_end` in SSE).
- "book a meeting" → slots → book → Cal.com booking + Slack/email (end-to-end with Phase 2).
- Run **Folder 17** of the Full-Backend Postman collection (chat/complete + health).
- Verify SSE events over `POST /api/chat/stream` (gateway proxy) include tool events.

---

## 11. NOT in Phase 3 (deferred)
- Identity forwarding / per-real-user booking attribution (service key for now).
- **Postgres checkpointer** — `InMemorySaver` now; durable Postgres checkpointer later
  (survives restarts, needed once we run >1 instance).
- Saved chat history persistence (`ChatSession`/`ChatMessage` tables exist, unused).
- RAG / embeddings (pgvector) — future.
- LangGraph Platform deployment / `useStream` — we keep our own SSE.
- MCP servers (Phase 4/5) — they'll wrap the same gateway endpoints, not the agent.
- The **frontend** approve/reject UI for HITL interrupts — backend supports it now; the UI
  wiring is Phase 6.
