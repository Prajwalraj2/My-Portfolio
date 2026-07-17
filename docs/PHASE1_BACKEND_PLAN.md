# Phase 1 — DB + Backend (detailed plan)

> Scope: **database + api-gateway only.** No frontend yet.
> Goal: users can **sign up / log in (email-password + Google + GitHub)**, have a
> **session**, and **generate/list/revoke API keys** (for the local MCP later).
> Plus the **unified auth layer** every future surface depends on.
> Last updated: 2026-07-14

---

## 0. Auth approach — DECIDED (supersedes the better-auth note)

**Extend the existing hand-rolled Fastify auth. Do NOT add better-auth.**
Reason: api-gateway already has JWT (`@fastify/jwt`), bcrypt (`utils/password.ts`),
cookie plugin, and `User`/`Session` models. We reuse all of it. Only social login is new →
use the tiny `arctic` library for Google/GitHub OAuth-client flows (not a framework).

**Session model choice:**

- **Users** → server-side **DB session** (existing `Session` table) delivered via an
**httpOnly cookie**. Revocable (real logout). Secure (no token in JS).
- **Admin** → leave the existing JWT flow **untouched** for now (it works); unify later.
- **MCP/API** → **Bearer API key** (`pk_live_...`), hashed in the new `ApiKey` table.

---



## 1. Sequence (the order we build & why)

```
1. Clean up      → delete leftover packages/database (verify nothing imports it)
2. Schema        → edit apps/api-gateway/prisma/schema.prisma (User fields, ApiKey, OAuthAccount)
3. Push DB       → prisma generate + prisma migrate dev  (to Neon)
4. Env + setup   → add env vars; register Google & GitHub OAuth apps (get client id/secret)
5. Auth blocks   → session.ts, apiKey.ts, oauth/*, principal.ts, resolve.ts (utils/services)
6. Middleware    → rewrite middleware/auth.ts (requireAuth/requireUser/requireAdmin/requireScopes)
7. Routes        → new user-auth routes + apikeys routes; move admin routes under /admin
8. Wire up       → register routes + cookie config in app.ts; env additions
9. Test          → signup → login → me → create key → call an endpoint with the key
```

Your instinct was right: **schema → push → APIs → rest.** Steps 1 & 4 are the only
additions (cleanup first, and register OAuth apps before writing social login).

---



## 2. Database changes — `apps/api-gateway/prisma/schema.prisma`



### 2.1 🗑️ Delete `packages/database/`

Orphaned leftover (gateway uses its own generated client). **Verify first:**
`grep -r "@portfolio/database"` returns nothing → safe to delete the folder.

### 2.2 ✏️ `User` — support password + social + api keys

```prisma
model User {
  id             String    @id @default(uuid())
  email          String    @unique
  name           String?
  avatarUrl      String?   @map("avatar_url")
  passwordHash   String?   @map("password_hash")     // 🆕 null for social-only users
  emailVerified  Boolean   @default(false) @map("email_verified")  // 🆕
  role           String    @default("user")
  isActive       Boolean   @default(true) @map("is_active")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  sessions        Session[]
  oauthAccounts   OAuthAccount[]   // 🆕
  apiKeys         ApiKey[]         // 🆕
  chatSessions    ChatSession[]
  mcpCredentials  McpCredential[]
  analyticsEvents AnalyticsEvent[]

  @@map("users")
}
```

> Removes the old single `provider`/`providerId` fields on User (replaced by
> `OAuthAccount`, which supports linking BOTH Google and GitHub to one account).



### 2.3 🆕 `OAuthAccount` — one row per linked social provider

```prisma
model OAuthAccount {
  id             String   @id @default(uuid())
  userId         String   @map("user_id")
  provider       String                                  // 'google' | 'github'
  providerUserId String   @map("provider_user_id")       // the id from Google/GitHub
  createdAt      DateTime @default(now()) @map("created_at")

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerUserId])
  @@map("oauth_accounts")
}
```



### 2.4 🆕 `ApiKey` — keys for local MCP / programmatic access

```prisma
model ApiKey {
  id               String    @id @default(uuid())
  userId           String    @map("user_id")
  name             String
  keyHash          String    @unique @map("key_hash")   // SHA-256 of the raw key
  prefix           String                                // display: "pk_live_ab12…"
  scopes           String[]  @default([])                // tool names/categories (used P2+)
  rateLimitPerHour Int       @default(120) @map("rate_limit_per_hour")
  lastUsedAt       DateTime? @map("last_used_at")
  expiresAt        DateTime? @map("expires_at")
  revokedAt        DateTime? @map("revoked_at")
  createdAt        DateTime  @default(now()) @map("created_at")

  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("api_keys")
}
```

> Note: API keys are high-entropy → hash with **SHA-256** (fast), NOT bcrypt (bcrypt is for
> low-entropy passwords). `Session` model stays as-is (finally used now, for user sessions).



### 2.5 Migrate

```
pnpm --filter api-gateway exec prisma generate
pnpm --filter api-gateway exec prisma migrate dev --name phase1_user_auth_apikeys
```

---



## 3. Backend file changes — `apps/api-gateway/src/`

```
src/
├── auth/                         🆕  (the unified auth layer — the heart of P1)
│   ├── principal.ts         🆕   type Principal = { kind:'user'|'admin'|'apikey', id, email?, role?, scopes[] }
│   ├── resolve.ts           🆕   resolvePrincipal(req): cookie session → user | Bearer pk_ → apikey | Bearer JWT → admin
│   ├── session.ts           🆕   createSession(userId,req) / getSession(token) / revokeSession(token); cookie set/clear
│   ├── apiKey.ts            🆕   generateKey() → {raw, hash, prefix}; hashKey(); loadValidKey(raw); touchLastUsed()
│   └── oauth/               🆕
│       ├── google.ts        🆕   arctic Google: getAuthUrl(state,verifier), handleCallback(code) → profile
│       └── github.ts        🆕   arctic GitHub: same shape
├── middleware/
│   └── auth.ts              ✏️   rewrite: requireAuth, requireUser, requireAdmin, requireScopes(...) using resolvePrincipal
├── routes/
│   ├── userAuth.ts          🆕   /api/auth/*  (signup, login, logout, me, google, github + callbacks)
│   ├── apikeys.ts           🆕   /api/apikeys  (create/list/revoke)  [requireUser]
│   └── auth.ts              ✏️   admin routes moved to prefix /api/auth/admin/*  (unchanged logic)
├── services/
│   └── user.service.ts      🆕   findOrCreateUserByEmail, linkOAuthAccount, getUserById (shared by routes)
├── config/
│   └── env.ts               ✏️   add OAuth + cookie + app-url vars (see §6)
├── types/
│   └── fastify.d.ts         ✏️   augment FastifyRequest with `principal?: Principal`
├── app.ts                   ✏️   register userAuth + apikeys routes; set cookie options; keep admin
└── utils/
    └── password.ts          ✅   reuse as-is (bcrypt for passwords)
```

---



## 4. Routes (final P1 API surface)



### User auth — `src/routes/userAuth.ts` → prefix `/api/auth`


| Method | Path                        | Auth   | Purpose                                                     |
| ------ | --------------------------- | ------ | ----------------------------------------------------------- |
| POST   | `/api/auth/signup`          | –      | email + password → create User → start session (set cookie) |
| POST   | `/api/auth/login`           | –      | email + password → verify → start session                   |
| POST   | `/api/auth/logout`          | cookie | revoke session + clear cookie                               |
| GET    | `/api/auth/me`              | cookie | current user profile                                        |
| GET    | `/api/auth/google`          | –      | redirect to Google consent (state+PKCE in cookie)           |
| GET    | `/api/auth/google/callback` | –      | exchange code → find/create user → session                  |
| GET    | `/api/auth/github`          | –      | redirect to GitHub consent                                  |
| GET    | `/api/auth/github/callback` | –      | exchange code → find/create user → session                  |




### API keys — `src/routes/apikeys.ts` → prefix `/api/apikeys`  [requireUser]


| Method | Path               | Purpose                                           |
| ------ | ------------------ | ------------------------------------------------- |
| POST   | `/api/apikeys`     | create key → returns **raw key ONCE** + metadata  |
| GET    | `/api/apikeys`     | list caller's keys (prefix + metadata, never raw) |
| DELETE | `/api/apikeys/:id` | revoke (sets `revokedAt`)                         |




### Admin — `src/routes/auth.ts` → prefix `/api/auth/admin` (moved, logic unchanged)

`/api/auth/admin/login`, `/refresh`, `/me`, `/logout`, `/change-password`.

---



## 5. How the flows work (step by step)



### 5.1 Email/password signup

```
Client → POST /api/auth/signup {email, password, name}
  → validate (zod)
  → check email not taken
  → hashPassword(password)  [bcrypt]
  → prisma.user.create({ email, name, passwordHash })
  → session = createSession(user.id, req)  → row in Session table (token, expiresAt, ip, ua)
  → reply.setCookie('sid', token, {httpOnly, secure, sameSite, maxAge})
  → return { data: { user } }
```



### 5.2 Email/password login

```
POST /api/auth/login {email, password}
  → user = findByEmail; if none or user.passwordHash null → 401
  → verifyPassword(password, passwordHash); if false → 401
  → createSession + setCookie
  → return { data: { user } }
```



### 5.3 Social login (Google shown; GitHub identical)

```
GET /api/auth/google
  → arctic builds Google auth URL with state + PKCE verifier
  → store {state, verifier} in short-lived httpOnly cookie
  → 302 redirect to Google

[user consents on Google] → Google redirects back:

GET /api/auth/google/callback?code=...&state=...
  → verify state matches cookie; exchange code (arctic) → tokens
  → fetch Google profile {sub, email, name, picture}
  → user.service.findOrCreateUserByEmail(email, {name, avatar})
       ↳ if user exists → use it; else create (passwordHash = null)
  → linkOAuthAccount(user.id, 'google', sub)   [OAuthAccount upsert]
  → createSession + setCookie
  → 302 redirect to FRONTEND (APP_URL) e.g. /dashboard
```



### 5.4 Create + use an API key

```
POST /api/apikeys {name}     [requireUser]
  → {raw, hash, prefix} = generateKey()   raw = "pk_live_" + 32 random bytes base62
  → prisma.apiKey.create({ userId, name, keyHash: hash, prefix })
  → return { data: { key: raw } }   ← shown ONCE, never stored raw

[later, local MCP / curl] sends:  Authorization: Bearer pk_live_xxx
  → resolvePrincipal sees "pk_" prefix → apiKey.loadValidKey(raw)
       ↳ hash raw (SHA-256) → find by keyHash → check not revoked/expired
  → touchLastUsed(); principal = { kind:'apikey', id:key.id, userId, scopes }
```



### 5.5 Unified request auth resolution (`resolvePrincipal`) — the core

```
resolvePrincipal(req):
  1. Authorization: Bearer pk_...   → API key  → { kind:'apikey', userId, scopes }
  2. Cookie 'sid'                    → DB session → { kind:'user', id, email, role }
  3. Authorization: Bearer <jwt>     → admin JWT  → { kind:'admin', id, email, role:'admin' }
  4. none → null
Middleware:
  requireUser  → principal.kind === 'user'   (else 401)
  requireAdmin → principal.kind === 'admin'  (else 403)
  requireScopes(...s) → apikey principal must include scopes  (used from P2)
Sets req.principal for handlers.
```

---



## 6. Env vars added — `config/env.ts`

```
APP_URL                     (frontend origin, for post-login redirects)  default http://localhost:3000
COOKIE_SECRET               (min 32 chars)     COOKIE_DOMAIN (optional)   SESSION_EXPIRES_DAYS  default 7
OAUTH_GOOGLE_CLIENT_ID / OAUTH_GOOGLE_CLIENT_SECRET
OAUTH_GITHUB_CLIENT_ID / OAUTH_GITHUB_CLIENT_SECRET
API_GATEWAY_URL             (self, for building OAuth callback URLs)      default http://localhost:8000
```

REDIS_URL already present (unused in P1 — in-memory rate limiting; Redis is a later TODO).

**External setup (you do this once, free):**

- Google Cloud Console → create OAuth 2.0 Client → redirect URI
`http://localhost:8000/api/auth/google/callback` (+ prod URL later).
- GitHub → Settings → Developer settings → OAuth App → callback
`http://localhost:8000/api/auth/github/callback`.

**New dependency:** `arctic` (OAuth client presets for Google/GitHub). `nanoid` or Node
`crypto` for key/token generation (crypto is built-in — prefer it).

---



## 7. How we verify Phase 1 (before moving on)

1. `signup` → 200, cookie set, row in `users` + `sessions`.
2. `me` with cookie → returns the user.
3. `login` wrong password → 401; correct → cookie.
4. `logout` → session row gone, cookie cleared, `me` → 401.
5. Google + GitHub round-trip → user created/linked, `oauth_accounts` row.
6. `POST /apikeys` → raw key once; `GET /apikeys` → prefix only.
7. Call a `requireUser` endpoint with `Authorization: Bearer pk_...` → resolves to user.
8. `DELETE /apikeys/:id` → key no longer authenticates.

(Driven via curl/Postman — no frontend needed. Admin `/api/auth/admin/login` still works.)

---



## 8. Phase 1 does NOT include

- Frontend pages (login/signup UI) — that's P6.
- Per-key **rate-limit enforcement** — scaffolded (field exists) but enforced in P2 when
tool endpoints exist.
- Email verification / password reset emails — stub now, wire in a later phase.
- MCP OAuth server — P5.
- The capability endpoints (bookings/blogs/github/etc.) — P2.

