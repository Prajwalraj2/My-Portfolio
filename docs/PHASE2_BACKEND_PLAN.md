# Phase 2 — Backend Capability Endpoints (detailed plan)

> Scope: **api-gateway only.** Build the capability endpoints + service layer that the AI
> agent (P3) and the MCP servers (P4/P5) will wrap as thin tools. Plus per-key rate
> limiting + scope enforcement (the `requireScopes` guard from P1 finally gets used).
> Builds on the P1 auth layer. Last updated: 2026-07-14

---

## 0. What ALREADY exists (don't rebuild) vs what's NEW

Reading the current routes, several "tools" are already backed by endpoints:

| Capability | Endpoint | Status |
|---|---|---|
| get projects / skills / experience / categories | `GET /api/projects` etc. | ✅ EXISTS |
| leave_recommendation | `POST /api/testimonials` (pending → admin approve/reject) | ✅ EXISTS (add notify) |
| service_inquiry / freelance proposal | `POST /api/inquiries` (source: agent/mcp_client) | ✅ EXISTS (add notify) |
| resume | `GET /api/resume` | ✅ EXISTS |

**NET-NEW in Phase 2:**
- **Meetings/booking** (`book_meeting` online/offline/call) — new model + routes.
- **GitHub** (`get_github`) — new integration (repos/langs/stars), cached.
- **Portfolio aggregate** (`get_portfolio`) — new read that stitches bio + links + featured content.
- **Guides** (`portfolio_guide` + `/guides` pages) — new model + CRUD.
- **Blogs** (`/blogs` pages + admin) — new model + CRUD.
- **Email / contact** (`send_email`) — new route + email service (graceful no-op if unconfigured).
- **Notifications** — Slack/email to Prajwal on new lead/booking/testimonial (graceful no-op).
- **Per-key rate limiting + scope enforcement** — in-memory bucket; `requireScopes` on tool endpoints.

---

## 1. Sequence (sub-phases — each independently shippable & testable)

```
2a  Schema + shared infra   → Meeting/Guide/Blog/NotificationLog models; push DB;
                              notify.service + email.service (graceful degradation)
2b  Reads: GitHub + Portfolio → github.service + /api/github; portfolio.service + /api/portfolio
2c  Meetings (booking)        → booking.service + /api/meetings (submit + admin approve/decline + notify)
2d  Content: Guides + Blogs   → guide/blog services + /api/guides, /api/blogs (public read + admin CRUD)
2e  Wire notify into writes   → inquiries + testimonials POST now notify Prajwal
2f  Rate limiting + scopes     → in-memory per-key bucket; apply requireScopes to tool endpoints
2g  Postman + test            → extend the Phase collection; verify each
```
Same shape as your instinct: **schema → push → services → routes → guards → test.**

---

## 2. Database changes — `apps/api-gateway/prisma/schema.prisma`

### 2.1 🆕 `Meeting`
```prisma
model Meeting {
  id           String    @id @default(uuid())
  userId       String?   @map("user_id")      // null if guest/agent booked
  type         String    // 'online' | 'offline' | 'call'
  name         String
  email        String
  company      String?
  topic        String?
  message      String?
  preferredAt  DateTime? @map("preferred_at")
  durationMins Int?      @map("duration_mins")
  location     String?                          // offline
  meetingUrl   String?   @map("meeting_url")     // online, set on approve
  status       String    @default("requested")  // requested|approved|declined|cancelled
  source       String?                           // website|agent|mcp_client
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  user         User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([status])
  @@map("meetings")
}
```
Add to `User`: `meetings Meeting[]`.

### 2.2 🆕 `Guide`
```prisma
model Guide {
  id           String   @id @default(uuid())
  slug         String   @unique
  title        String
  summary      String?
  bodyMd       String   @map("body_md")
  category     String?
  displayOrder Int      @default(0) @map("display_order")
  isPublished  Boolean  @default(true) @map("is_published")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  @@map("guides")
}
```

### 2.3 🆕 `Blog`
```prisma
model Blog {
  id          String    @id @default(uuid())
  slug        String    @unique
  title       String
  excerpt     String?
  contentMd   String    @map("content_md")
  coverUrl    String?   @map("cover_url")
  tags        String[]  @default([])
  status      String    @default("draft")  // draft|published
  publishedAt DateTime? @map("published_at")
  views       Int       @default(0)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  @@index([status])
  @@map("blogs")
}
```

### 2.4 🆕 `NotificationLog` (audit of what we sent — feeds admin dashboard later)
```prisma
model NotificationLog {
  id        String   @id @default(uuid())
  channel   String   // 'slack' | 'email'
  kind      String   // 'inquiry' | 'meeting' | 'testimonial' | 'contact'
  status    String   // 'sent' | 'skipped' | 'failed'
  subject   String?
  error     String?
  createdAt DateTime @default(now()) @map("created_at")
  @@map("notification_logs")
}
```

### 2.5 Push
```
pnpm exec prisma db push   (from apps/api-gateway — regenerates client too)
```

---

## 3. Backend file changes — `apps/api-gateway/src/`

```
src/
├── auth/
│   ├── scopes.ts            🆕  the scope catalog (resource:action) + default key scopes
│   └── rateLimit.ts         🆕  in-memory per-key token bucket + enforceKeyRateLimit preHandler
├── services/                🆕  business logic (routes stay thin)
│   ├── notify.service.ts    🆕  Slack webhook + email fan-out; logs to NotificationLog; no-op if unconfigured
│   ├── email.service.ts     🆕  send email (Resend/SMTP); no-op+log if unconfigured
│   ├── github.service.ts    🆕  fetch repos/langs/stars for GITHUB_USERNAME; in-memory TTL cache
│   ├── portfolio.service.ts 🆕  aggregate bio + links + featured projects/skills/experience
│   ├── booking.service.ts   🆕  create meeting + notify; approve/decline
│   ├── guide.service.ts     🆕  guides CRUD helpers
│   └── blog.service.ts      🆕  blogs CRUD helpers
├── routes/
│   ├── meetings.ts          🆕  /api/meetings
│   ├── github.ts            🆕  /api/github
│   ├── portfolio.ts         🆕  /api/portfolio
│   ├── guides.ts            🆕  /api/guides
│   ├── blogs.ts             🆕  /api/blogs
│   ├── email.ts             🆕  /api/email/contact
│   ├── inquiries.ts         ✏️  call notify.service on POST
│   └── testimonials.ts      ✏️  call notify.service on POST
├── config/
│   └── env.ts               ✏️  GITHUB_USERNAME, GITHUB_TOKEN?, SLACK_WEBHOOK_URL?, email provider, PRAJWAL_NOTIFY_EMAIL
└── app.ts                   ✏️  register the 6 new route files
```

---

## 4. Tool → endpoint → scope map (the contract P3/P4 will wrap)

| Tool | Method + Endpoint | R/W | Scope (keys only) | Auth on endpoint |
|---|---|---|---|---|
| get_projects | GET /api/projects | R | `projects:read` | public |
| get_skills | GET /api/skills | R | `skills:read` | public |
| get_experience | GET /api/experience | R | `experience:read` | public |
| get_github | GET /api/github | R | `github:read` | public |
| get_portfolio | GET /api/portfolio | R | `portfolio:read` | public |
| portfolio_guide | GET /api/guides[/:slug] | R | `guides:read` | public |
| book_meeting | POST /api/meetings | W | `meetings:write` | requireUser + scope |
| send_email | POST /api/email/contact | W | `email:write` | public + scope (if key) |
| leave_recommendation | POST /api/testimonials | W | `testimonials:write` | public + scope (if key) |
| service_inquiry | POST /api/inquiries | W | `inquiries:write` | public + scope (if key) |

**Scope rule (from P1 `requireScopes`):** user sessions & admin bypass scopes (full access);
**only API-key principals** are constrained to their granted scopes. Default local-MCP key
scopes = all `:read` + `meetings:write` (defined in `scopes.ts`).

---

## 5. Route details

### 5.1 `meetings.ts` → `/api/meetings`
| Method | Path | Guard | Purpose |
|---|---|---|---|
| POST | `/` | requireUser + requireScopes('meetings:write') | request a meeting → status `requested` → notify Prajwal |
| GET | `/` | requireAdmin | list (filter by status) |
| GET | `/mine` | requireUser | caller's own meetings |
| POST | `/:id/approve` | requireAdmin | → `approved` (+ optional meetingUrl) → notify requester (email) |
| POST | `/:id/decline` | requireAdmin | → `declined` |

### 5.2 `github.ts` → `/api/github`
| GET | `/` | public | `{ profile, repos[], languages{}, totals }` for GITHUB_USERNAME, cached (TTL ~30 min) |

### 5.3 `portfolio.ts` → `/api/portfolio`
| GET | `/` | public | aggregate: `{ bio, links, featuredProjects, topSkills, latestExperience, resumeUrl }` |

### 5.4 `guides.ts` → `/api/guides`
| GET | `/` | public | published guides (ordered) |
| GET | `/:slug` | public | one guide |
| POST/PUT/DELETE | `/[:slug]` | requireAdmin | CRUD |

### 5.5 `blogs.ts` → `/api/blogs`
| GET | `/` | public | published blogs (paginated) |
| GET | `/:slug` | public | one blog (increment views) |
| GET | `/all` | requireAdmin | incl. drafts |
| POST/PUT/DELETE | `/[:slug]` | requireAdmin | CRUD (publish sets publishedAt) |

### 5.6 `email.ts` → `/api/email/contact`
| POST | `/contact` | public + scope('email:write') if key | validate → email.service.sendToPrajwal + NotificationLog |

All follow the **existing conventions**: zod validation, `{ data }` / `{ data, pagination }`
envelopes, `{ error, message }` errors, `requireAdmin` on writes — same as `projects.ts`.

---

## 6. Services (where logic lives)

- **notify.service** — `notifyPrajwal({ kind, subject, body })`: if `SLACK_WEBHOOK_URL` set →
  POST to Slack; if notify-email configured → email; always write a `NotificationLog` row
  (status sent/skipped/failed). **Never throws into the request path** — best-effort.
- **email.service** — `sendEmail({ to, subject, html })` via provider (Resend or SMTP). If
  unconfigured → log + `NotificationLog(status:'skipped')`. Same graceful pattern as OAuth in P1.
- **github.service** — `getGithubData()` hits `api.github.com/users/{GITHUB_USERNAME}/repos`
  (+ optional `GITHUB_TOKEN` for higher limits); aggregates languages/stars/forks; **in-memory
  TTL cache** so we don't hammer GitHub or hit rate limits.
- **portfolio.service** — one call that pulls featured projects + top skills + latest
  experience + resume from the DB and shapes a single object for the `get_portfolio` tool.
- **booking.service** — `requestMeeting(input, principal)` → create + notify; `approve/decline`.

---

## 7. Rate limiting + scopes (`auth/rateLimit.ts`, `auth/scopes.ts`)

- **`scopes.ts`** — exported constant list (`projects:read`, …, `meetings:write`) + a
  `DEFAULT_KEY_SCOPES` set used when a user creates an API key without specifying scopes.
  (P1's `apikeys` route already accepts a `scopes` array — we now give it meaning.)
- **`rateLimit.ts`** — in-memory `Map<apiKeyId, { count, resetAt }>`, hourly window from
  `ApiKey.rateLimitPerHour`. `enforceKeyRateLimit` preHandler runs after the auth guard:
  if `principal.kind === 'apikey'` and over budget → `429`. Users/admin unaffected.
  **TODO (tracked from decisions §13.5): swap this Map for Redis before real deploy.**
- Applied to the tool endpoints (the write ones especially) alongside `requireScopes`.

---

## 8. Env additions — `config/env.ts`

```
GITHUB_USERNAME            (whose repos to show)          # required for /api/github
GITHUB_TOKEN               (optional — higher rate limit)
SLACK_WEBHOOK_URL          (optional — notify.service)
PRAJWAL_NOTIFY_EMAIL       (optional — where lead/booking emails go)
EMAIL_PROVIDER             ('resend' | 'smtp' | unset)
RESEND_API_KEY  or  SMTP_HOST/PORT/USER/PASS  (whichever provider)
```
All optional except `GITHUB_USERNAME`. Missing config = graceful no-op (feature dormant),
so Phase 2 builds & tests without any of these set.

---

## 9. Key flows

### 9.1 Book a meeting (tool or website)
```
POST /api/meetings {type, name, email, topic, preferredAt}
  → requireUser (+scope meetings:write if via key)
  → booking.service.requestMeeting → prisma.meeting.create(status:'requested', source)
  → notify.service.notifyPrajwal({kind:'meeting', ...})   (Slack/email, best-effort)
  → 201 { data: meeting }
[admin] POST /api/meetings/:id/approve {meetingUrl?}
  → status 'approved' → email.service.sendEmail(to: requester) → 200
```

### 9.2 GitHub (cached)
```
GET /api/github
  → github.service.getGithubData(): cache hit? return : fetch GitHub → aggregate → cache(TTL) → return
```

### 9.3 Recommendation (existing + new notify)
```
POST /api/testimonials  (unchanged) → status 'pending'
  → + notify.service.notifyPrajwal({kind:'testimonial'})     ← the only change
[admin] approve/reject (already exists)
```

---

## 10. Testing (extend the Postman collection → `Phase2.postman_collection.json`)
- GitHub read, Portfolio read.
- Create meeting (as user session, then as API key with/without `meetings:write` scope → 200 vs 403).
- Admin approve/decline meeting.
- Guides + Blogs CRUD (admin) + public read.
- Contact email (verify NotificationLog row; feature no-ops cleanly if unconfigured).
- Rate limit: hammer an endpoint with a key past its hourly limit → 429.

---

## 11. NOT in Phase 2 (deferred)
- Real Slack/email creds wiring — endpoints work no-op until you add them.
- Calendar integration (actual Google Calendar events) — meetings are request+approve only for now.
- Redis rate limiting — in-memory now (tracked TODO).
- The AI agent + MCP tool wrappers that CALL these — that's P3/P4.
- Frontend pages for blogs/guides/booking — P6.
