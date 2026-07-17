# Backend Guide — Consumers, Auth, Rate Limits & Full API Reference

> How the api-gateway is used by each consumer (**Admin, Public visitor, Logged-in user,
> AI, MCP, Frontend**), how each is authenticated and rate-limited, and a complete endpoint
> reference. Reflects everything built through Phase 2. Last updated: 2026-07-15.

---

## 1. The unified auth model (how *anyone* is identified)

Every request runs through **`resolvePrincipal`**, which turns whatever credential is
present into one normalized **Principal** `{ kind, id, userId?, scopes[], rateLimitPerHour? }`.
Resolution order (an explicit `Authorization` header beats an ambient cookie):

| Order | Credential | Produces | Used by |
|---|---|---|---|
| 1 | `Authorization: Bearer pk_live_…` | `kind: 'apikey'` (→ owning user) | MCP / programmatic |
| 2 | `Authorization: Bearer <JWT>` (role=admin) | `kind: 'admin'` | Admin |
| 3 | `sid` httpOnly cookie (DB session) | `kind: 'user'` | Logged-in website user |
| — | none | `null` (anonymous) | Public visitor |

**Guards** (route preHandlers) build on the principal:
- `requireAuth` — any authenticated principal
- `requireUser` — a user **or** an API key (both represent an end user)
- `requireSession` — a real website session only (NOT an api key) → used for API-key management
- `requireAdmin` — admin only
- `requireScopes(...)` — for API-key principals, enforces the listed scopes (users/admin bypass)

---

## 2. Rate limiting (two layers)

1. **Global per-IP** (`@fastify/rate-limit`): 100 requests/min per IP — applies to **every**
   request. Coarse abuse protection.
2. **Per-API-key** (in-memory hourly bucket): only triggers when a request carries
   `Authorization: Bearer pk_…`. Each key has its own `rateLimitPerHour` (default 120,
   settable at creation). Over budget → **429** + `Retry-After`. Users/admin unaffected.
   *(In-memory now; Redis is the planned upgrade for multi-instance deploys.)*

---

## 3. Consumers — what each can do, how it authenticates, how it's limited

### 👑 Admin (Prajwal)
- **Auth:** `POST /api/auth/admin/login` (email + password) → **JWT** access token (15 min) +
  refresh token (7 days). Send `Authorization: Bearer <JWT>` on admin endpoints.
  *(TOTP 2FA + IP allowlist exist in code, commented, for later.)*
- **Can do:** full **CRUD** on all content — categories, projects, skills, experience,
  **guides, blogs**, resume versions, **profile**; **moderate** testimonials
  (approve/reject), **manage** inquiries (view/status), **view/cancel** meetings, refresh
  the GitHub cache. Essentially the whole admin surface.
- **Rate limit:** global per-IP only (not per-key).

### 🌐 Public visitor (not logged in)
- **Auth:** none.
- **Can do:** browse all **public reads** — projects, skills, experience, categories,
  **portfolio aggregate**, **guides**, **blogs**, resume, GitHub, approved testimonials;
  **submit** a contact message, an inquiry, or a testimonial (→ notifies Prajwal);
  **view meeting slots**; **chat** with the AI.
- **Rate limit:** global per-IP.

### 👤 Logged-in user
- **Auth:** `POST /api/auth/signup` or `/login` (email+password), or Google/GitHub OAuth →
  **httpOnly `sid` cookie** backed by a DB `Session` (7-day, revocable via logout).
- **Can do:** everything public **plus** — `GET /api/auth/me`, **manage API keys**
  (create/list/revoke, session-only), **book a meeting** (`POST /api/meetings`), see **their
  own** meetings (`/mine`), cancel their meeting. *(Future: saved chat history, the `/mcp`
  key page.)*
- **Rate limit:** global per-IP; any API keys they mint carry their own per-key limits.

### 🤖 AI agent (ai-service)  — *chat proxy exists; the tool-calling agent is Phase 3*
- **What:** the FastAPI `ai-service`, reached via the gateway's **chat proxy**
  (`POST /api/chat/stream` | `/complete`, SSE). The agent (Phase 3) will call **back into
  the gateway** to use tools (get_projects, get_github, get_portfolio, book_meeting, …).
- **Auth (today):** the chat endpoint is **public** (anyone can chat). Agent→gateway tool
  calls hit **public read endpoints** directly.
- **Auth (Phase 3 decision):** *write* tools (e.g. `book_meeting`) need a principal — either
  the AI service **forwards the website user's session**, or uses a **scoped service key**.
  To be settled in the Phase 3 plan.
- **Rate limit:** chat by IP; tool calls by whatever principal is attached.

### 🔌 MCP (local npm/pip + remote)  — *not built yet (Phase 4/5)*
- **Auth:** **API key** (`pk_live_…`) for local MCP; **OAuth 2.1** for remote MCP (Phase 5,
  logged-in only). Either way the tool sends `Authorization: Bearer …` to the gateway, which
  resolves it to the **owning user**.
- **Can do:** whatever the key's **scopes** allow — reads (projects, github, portfolio,
  guides) freely; **`book_meeting`** requires the `meetings:write` scope.
- **Rate limit:** **per-key** hourly bucket (default 120/hr, configurable per key) + global IP.

### 🖥️ Frontend (Next.js web)  — *most pages are Phase 6*
- **What:** calls the gateway **server-side** (SSR/ISR) or via its **`/api/proxy`** route
  (client-side), and **`/api/chat/stream`** for chat.
- **Auth:** forwards the user's **`sid` cookie** for logged-in actions; public reads need none.
- **Rate limit:** inherits per-IP; per-user via their session.

---

## 4. Full endpoint reference

Auth column: **Public** / **User** (session or key) / **Session** (cookie only) /
**Admin** / **Scope** (API-key scope enforced).

### Health
| Method | Path | Auth |
|---|---|---|
| GET | `/health` | Public |
| GET | `/ready` | Public |

### Auth — User (`/api/auth`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | email+password → sets `sid` cookie |
| POST | `/api/auth/login` | Public | → sets `sid` cookie |
| POST | `/api/auth/logout` | Public | revokes session, clears cookie |
| GET | `/api/auth/me` | User | current user |
| GET | `/api/auth/google` | Public | → redirect to Google |
| GET | `/api/auth/google/callback` | Public | → creates/links user, session |
| GET | `/api/auth/github` | Public | → redirect to GitHub |
| GET | `/api/auth/github/callback` | Public | → session |

### Auth — Admin (`/api/auth/admin`)
| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/admin/login` | Public → returns JWT |
| POST | `/api/auth/admin/refresh` | Public (refresh token) |
| GET | `/api/auth/admin/me` | Admin |
| POST | `/api/auth/admin/logout` | Public |
| POST | `/api/auth/admin/change-password` | Admin |

### API Keys (`/api/apikeys`) — **Session only**
| Method | Path | Auth |
|---|---|---|
| POST | `/api/apikeys` | Session — create (raw key shown once) |
| GET | `/api/apikeys` | Session — list (no raw keys) |
| DELETE | `/api/apikeys/:id` | Session — revoke |

### Categories (`/api/categories`)
| GET `/` · GET `/all` · GET `/:slug` | Public | · POST `/` · PUT `/:slug` · DELETE `/:slug` | **Admin** |

### Projects (`/api/projects`)
| GET `/` · `/all` · `/featured` · `/:slug` | Public | · POST `/` · PUT `/:slug` · DELETE `/:slug` | **Admin** |

### Skills (`/api/skills`)
| GET `/` · `/featured` · `/grouped` · `/:id` | Public | · POST `/` · PUT `/:id` · DELETE `/:id` | **Admin** |

### Experience (`/api/experience`)
| GET `/` · `/current` · `/:id` | Public | · POST `/` · PUT `/:id` · DELETE `/:id` | **Admin** |

### Testimonials (`/api/testimonials`)
| Method | Path | Auth |
|---|---|---|
| GET | `/` (approved) · `/:id` | Public |
| POST | `/` | Public — submit → **notifies Prajwal**, status `pending` |
| GET | `/all` · `/pending` | Admin |
| POST | `/:id/approve` · `/:id/reject` · PUT `/:id` · DELETE `/:id` | Admin |

### Inquiries (`/api/inquiries`)
| Method | Path | Auth |
|---|---|---|
| POST | `/` | Public — submit → **notifies Prajwal** |
| GET | `/` · `/new` · `/stats` · `/:id` | Admin |
| POST | `/:id/mark-replied` · `/:id/close` · PUT `/:id` · DELETE `/:id` | Admin |

### Resume (`/api/resume`)
| Method | Path | Auth |
|---|---|---|
| GET | `/` · `/download` | Public |
| GET | `/versions` · `/stats` · `/versions/:id` | Admin |
| POST | `/versions` · `/versions/:id/set-default` · PUT `/versions/:id` · DELETE `/versions/:id` | Admin |

### GitHub (`/api/github`)
| GET `/` | Public (cached) | · POST `/refresh` | **Admin** |

### Portfolio & Profile
| GET `/api/portfolio` | Public (aggregate) |
| GET `/api/profile` | Public | · PUT `/api/profile` | **Admin** |

### Guides (`/api/guides`)
| GET `/` · `/:slug` | Public | · GET `/all` · POST `/` · PUT `/:slug` · DELETE `/:slug` | **Admin** |

### Blogs (`/api/blogs`)
| GET `/` · `/:slug` (+view) | Public | · GET `/all` · POST `/` · PUT `/:slug` · DELETE `/:slug` | **Admin** |

### Meetings (`/api/meetings`) — Cal.com backed
| Method | Path | Auth |
|---|---|---|
| GET | `/slots` | Public |
| POST | `/` | **User + Scope** `meetings:write` |
| GET | `/mine` | User |
| POST | `/:uid/cancel` | User |
| GET | `/` | Admin |
| POST | `/webhook` | Public (token-guarded; Cal.com → mirror) |

### Email (`/api/email`)
| POST `/contact` | Public — sends email to Prajwal (the `send_email` tool) |

### Chat / AI (`/api/chat`) — proxy to ai-service
| Method | Path | Auth |
|---|---|---|
| POST | `/stream` | Public (SSE) |
| POST | `/complete` | Public |
| GET | `/health` | Public |

---

## 5. Side effects to remember
- **Notifications** (Slack + email to Prajwal) fire on: new **inquiry**, new **testimonial**,
  new **meeting**. Every attempt logged in `NotificationLog`. Best-effort (never blocks).
- **Meetings** mirror Cal.com bookings into the `meetings` table; Cal.com sends the
  confirmation email + calendar invite to the attendee.
- **GitHub** is cached ~30 min; `POST /api/github/refresh` (admin) busts it.
- **Blogs** increment `views` on public `GET /:slug`.

---

## 6. Not yet built (later phases)
- **AI agent** tool-calling (Phase 3), **local/remote MCP** (Phase 4/5), **frontend pages**
  (Phase 6). The endpoints above are the contract those will consume.
