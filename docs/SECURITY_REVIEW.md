# Security Review — Auth Surface (Pre‑Launch)

> **Date:** 2026-07-18
> **Reviewer:** internal (Claude) code review
> **Scope:** Authentication & authorization surface across `apps/frontend` (BFF proxies, admin BFF, cookies, route guards) and `apps/api-gateway` (`resolvePrincipal`, sessions, JWT, OAuth, CORS, rate limiting, password/API‑key hashing). **Not** a review of business‑logic endpoints, the AI service, or infrastructure.
> **Method:** manual code read of the auth‑critical files (no dynamic testing). File references are `path:line`.

---

## Executive summary

The auth design is fundamentally sound: **server‑side, revocable, httpOnly sessions** for users; a **separate admin identity** with short‑lived JWTs kept **httpOnly via a BFF** (never exposed to JS); **bcrypt** for passwords; **SHA‑256 over high‑entropy** API keys; consistent **ownership checks** (no IDOR found); and a correct `resolvePrincipal` precedence. The BFF proxy pattern keeps the gateway off the public browser origin.

However, **one CRITICAL and two HIGH issues must be fixed before the site is public**, primarily around **secret management defaults** and **account‑linking / brute‑force**.

### Risk register

| ID | Severity | Issue | Must fix before public? |
|----|----------|-------|--------------------------|
| SEC‑01 | 🔴 **Critical** | Auth secrets fall back to known hard‑coded defaults; gateway boots in prod without them | **Yes** |
| SEC‑02 | 🟠 **High** | OAuth↔password **account pre‑hijack** (no email verification + auto‑link by email) | **Yes** |
| SEC‑03 | 🟠 **High** | Admin login has **no brute‑force protection**; TOTP is coded but disabled | **Yes** |
| SEC‑04 | 🟡 Medium | Rate limiting **ineffective behind the BFF** (all users share the frontend pod IP) + in‑memory/per‑replica | Recommended |
| SEC‑05 | 🟡 Medium | No **CSRF tokens** on state‑changing endpoints (mitigated, but no defense‑in‑depth) | Recommended |
| SEC‑06 | 🟡 Medium | Admin access/refresh tokens **not revocable**; `admin_at` cookie lives 7d | Document/accept |
| SEC‑07 | 🔵 Low | BFF proxy does not reject `..` path segments | Nice‑to‑have |
| SEC‑08 | 🔵 Low | **User enumeration** via signup 409 + login timing | Accept/note |
| SEC‑09 | 🔵 Low | GitHub OAuth trusts `/user.email` before the verified‑email list | Nice‑to‑have |
| SEC‑10 | ⚪ Info | `COOKIE_SECRET` defined but unused (cookies unsigned) | Cleanup |
| SEC‑11 | ⚪ Info | `ZodError` from `.parse()` surfaces as HTTP 500 | Cleanup |

---

## What's done well (positive findings)

- **Sessions** (`apps/api-gateway/src/auth/session.ts`): DB‑backed, **revocable** (real logout), 32‑byte `crypto.randomBytes` token, `httpOnly`, `secure` in prod, `sameSite=lax`, server‑side expiry with cleanup. No token in JS.
- **Admin tokens never touch JS**: the admin BFF (`apps/frontend/app/api/admin/[...path]/route.ts`) injects the Bearer from an httpOnly cookie server‑side and auto‑refreshes on 401; the admin proxy does **not** relay the user `sid` cookie.
- **Password hashing**: bcrypt, cost 12 (`apps/api-gateway/src/utils/password.ts`). API keys: SHA‑256 over `pk_live_` + 24 random bytes (`auth/apiKey.ts`) — correct (fast hash is fine for high‑entropy secrets).
- **`resolvePrincipal` precedence** (`auth/resolve.ts`): API key → **admin Bearer → session cookie**. Checking the explicit Authorization header before the ambient cookie prevents a stale user cookie from shadowing an admin token.
- **Ownership checks / no IDOR**: chat sessions (`routes/chat.ts` — `session.userId !== userId → 404`), API keys (`routes/apikeys.ts`), inquiries (admin‑only). The new `GET/PATCH /api/auth/admin/users` are `requireAdmin`.
- **`passwordHash` never serialized** (`userAuth.ts:publicUser`). `isActive` enforced on both session and API‑key resolution.
- **Helmet** enabled; CSP on in production. **CORS** `credentials:true` with an explicit origin allowlist (not `*`).
- **Optimistic middleware, authoritative gateway**: `apps/frontend/proxy.ts` only checks cookie *presence* for routing; all real data access is authorized at the gateway. Forging a cookie's presence yields no data.

---

## Detailed findings

### SEC‑01 — 🔴 Critical: hard‑coded fallback secrets in production
**Where:** `apps/api-gateway/src/config/env.ts:19‑21,36`
```ts
JWT_SECRET:         z.string().min(32).default('development-secret-key-min-32-characters'),
JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-key-min-32-characters'),
COOKIE_SECRET:      z.string().min(32).default('development-cookie-secret-min-32-characters'),
```
**Impact:** These defaults are in the repo. `@fastify/jwt` signs **admin** access/refresh tokens with `JWT_SECRET` (`app.ts:68`). If a production deploy forgets to set `JWT_SECRET`, the gateway boots happily with the public default → **anyone can forge an admin JWT** (`{ role: 'admin' }`) and gain full admin control. Same class of risk for the refresh secret.
**Fix:** Fail fast in production when these are unset or equal to the known default. Add a `superRefine` to the schema:
```ts
const DEV_DEFAULTS = new Set([
  'development-secret-key-min-32-characters',
  'development-refresh-key-min-32-characters',
  'development-cookie-secret-min-32-characters',
]);
// after envSchema, before parse — or as .superRefine on the object:
.superRefine((v, ctx) => {
  if (v.NODE_ENV === 'production') {
    for (const [k, val] of [['JWT_SECRET', v.JWT_SECRET], ['JWT_REFRESH_SECRET', v.JWT_REFRESH_SECRET], ['COOKIE_SECRET', v.COOKIE_SECRET]] as const) {
      if (!val || DEV_DEFAULTS.has(val)) ctx.addIssue({ code: 'custom', path: [k], message: `${k} must be set to a strong unique value in production` });
    }
  }
})
```
Generate secrets with `openssl rand -base64 48`. Ensure they're set in the K8s Secret / deploy env.

---

### SEC‑02 — 🟠 High: OAuth ↔ password account pre‑hijack
**Where:** `apps/api-gateway/src/services/user.service.ts:6‑30` (`findOrCreateUserByEmail`) + `routes/userAuth.ts:63‑80` (signup has **no email verification**).
**Impact:** Password signup creates a user with any email and `emailVerified=false`, with **no verification step**. Because OAuth login auto‑links to an existing account **by email**, an attacker can:
1. Register `victim@gmail.com` + attacker password (they don't own the inbox).
2. Later the real victim signs in with Google/GitHub using `victim@gmail.com` → `findOrCreateUserByEmail` returns the **attacker‑created** account → the victim is logged into an account the **attacker still knows the password to**.

Blast radius here is limited — regular users hold low privilege and the admin is a separate `AdminCredential` — but it's a genuine account‑integrity flaw.
**Fix (pick one):**
- Require **email verification** before a password account can log in (send a verification link; block login while `emailVerified=false`), **or**
- In `findOrCreateUserByEmail`, only auto‑link OAuth to an existing account when that account is **social‑only** (`passwordHash == null`) or already `emailVerified`; otherwise require an explicit "link account" step after password auth.

---

### SEC‑03 — 🟠 High: admin login brute‑force / no 2FA
**Where:** `routes/auth.ts:40‑130` (admin login), only covered by the global limiter `app.ts:61‑64` (`RATE_LIMIT_MAX=100` / `1 minute`, per‑IP). TOTP is fully coded but commented out (`routes/auth.ts`).
**Impact:** The single most privileged credential has **no account lockout, no incremental backoff, no 2FA**. 100 guesses/min/IP (and effectively per *frontend pod IP* behind the proxy — see SEC‑04) is weak for the admin account.
**Fix:**
- Add a **strict per‑route limit** on `/api/auth/admin/login` and `/api/auth/login` (e.g. 5–10/min per account+IP) and/or an account lockout with backoff.
- **Enable TOTP for admin before going public** (the code path already exists) — it single‑handedly neutralizes credential stuffing.

---

### SEC‑04 — 🟡 Medium: rate limiting is ineffective behind the BFF
**Where:** `app.ts:61‑64` (global limiter, per‑IP, in‑memory) + `auth/rateLimit.ts` (per‑key, in‑memory).
**Impact:** All browser traffic reaches the gateway **from the frontend pod's IP** (the BFF proxy makes the request). So the per‑IP limiter lumps **every user into one bucket** → one abusive user can exhaust the limit for everyone, and the limit doesn't isolate attackers. It's also **in‑memory/per‑replica**, so it doesn't hold across horizontally‑scaled gateway pods.
**Fix:** Rate‑limit at the **ingress / frontend** (where the real client IP is), or trust a validated `X‑Forwarded‑For` from the proxy and key on that, and/or key sensitive endpoints on the session/user. Move the store to **Redis** for multi‑replica correctness (already a deferred TODO).

---

### SEC‑05 — 🟡 Medium: no CSRF tokens on state‑changing endpoints
**Where:** cookie‑authenticated mutations (e.g. `POST /api/inquiries`, `POST /api/apikeys`, chat persist) rely on the `sid` cookie; no anti‑CSRF token.
**Impact / current mitigation:** Largely mitigated today because (a) mutations require `application/json` bodies, which forces a CORS preflight that only the configured origin passes; (b) `sameSite=lax` blocks the cookie on cross‑site subrequests; (c) browser traffic is same‑origin through the proxy. A classic HTML‑form CSRF can't send JSON and would 400. **But** there's no defense‑in‑depth if any endpoint is later relaxed to accept form encoding or a wildcard CORS.
**Fix:** Keep JSON‑only + strict CORS as invariants; consider `sameSite=strict` for `sid`, or a double‑submit CSRF token for cookie‑auth mutations if you add any non‑JSON endpoints.

---

### SEC‑06 — 🟡 Medium: admin tokens are not revocable
**Where:** `apps/frontend/app/api/admin/login/route.ts` (7‑day cookie lifetime) + stateless JWT.
**Impact:** The admin JWT is stateless (no server‑side admin session), and the `admin_at` **cookie** intentionally lives 7 days (so the proxy can refresh the 15‑min JWT). A leaked admin token can't be force‑revoked before its 15‑min expiry, and the 7‑day refresh token can't be invalidated server‑side. Logout only clears cookies client‑side.
**Fix / accept:** For a single‑admin app this is an acceptable, documented trade‑off. To harden: add an admin **refresh‑token store** (rotate + allow revocation) or a token version/`jti` blacklist (Redis). Enabling TOTP (SEC‑03) reduces the likelihood of compromise in the first place.

---

### SEC‑07 — 🔵 Low: BFF proxies don't reject `..` segments
**Where:** `app/api/proxy/[...path]/route.ts:16` and `app/api/admin/[...path]/route.ts` — `new URL(`/api/${path.join('/')}`, INTERNAL)`.
**Impact:** A crafted path with `..` normalizes outside `/api/` (e.g. to `/health`). **Not** an auth bypass — every sensitive route is under `/api/*` and independently guarded — but it's untidy.
**Fix:** Reject any path segment equal to `..`/`.` (return 400) before building the URL.

---

### SEC‑08 — 🔵 Low: user enumeration
**Where:** `userAuth.ts:67‑69` (signup returns `409 Email already registered`) and `userAuth.ts:85‑95` (login returns early with no bcrypt when the email is unknown → timing oracle).
**Fix (optional):** Generic signup messaging and a constant‑time login path (always run a bcrypt compare against a dummy hash when the user is missing). Usually acceptable to accept for a small app.

---

### SEC‑09 — 🔵 Low: GitHub OAuth trusts `/user.email` first
**Where:** `auth/oauth/github.ts:39‑53`. It uses `u.email` (public profile email) if present, only falling back to the `primary && verified` entry from `/user/emails`. GitHub only lets you set a **verified** email as your public one, so this is generally safe, but it relies on that invariant.
**Fix:** Prefer the `/user/emails` `primary && verified` entry unconditionally; treat `/user.email` as a last resort. (Combined with SEC‑02's fix, this closes the OAuth‑email trust gap.)

---

### SEC‑10 / SEC‑11 — ⚪ Info / cleanup
- **SEC‑10:** `COOKIE_SECRET` is defined (`env.ts:36`) but `@fastify/cookie` is registered without it (`app.ts:66`), so cookies are unsigned. This is *fine* (the `sid` is a server‑side random token that needs no signing), but the unused secret is misleading — either wire it (`app.register(cookie, { secret: env.COOKIE_SECRET })`) or drop it.
- **SEC‑11:** Routes using `schema.parse()` throw a `ZodError` with no `statusCode`, so the global handler (`app.ts:118‑129`) returns **HTTP 500** for what are really 400 validation errors. Cosmetic/UX; consider a `ZodError` branch mapping to 400.

---

## Pre‑launch checklist (prioritized)

**Must do before the site is public**
- [ ] **SEC‑01** — set strong unique `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET` in the prod env **and** make the gateway refuse to boot on defaults in `NODE_ENV=production`.
- [ ] **SEC‑03** — enable **admin TOTP** and add a strict login rate‑limit/lockout.
- [ ] **SEC‑02** — add email verification, or restrict OAuth auto‑linking to social‑only/verified accounts.
- [ ] Confirm prod `CORS_ORIGIN` is the exact public domain(s), never `*`; `secure` cookies require HTTPS in prod (already `NODE_ENV`‑gated).
- [ ] Secrets live only in the K8s Secret / deploy env — never in a tracked file (already verified: no real `.env` is tracked). Confirm `.env.example` files contain placeholders only.

**Strongly recommended**
- [ ] **SEC‑04** — rate‑limit at ingress/frontend with the real client IP; move rate‑limit state to Redis for multi‑replica.
- [ ] **SEC‑05** — keep JSON‑only + strict CORS as hard invariants; consider `sameSite=strict` for `sid`.

**Nice to have / cleanup**
- [ ] SEC‑07 reject `..` in proxy paths · SEC‑09 prefer verified GitHub email · SEC‑06 document/harden admin token revocation · SEC‑08 enumeration · SEC‑10/11 config cleanup.

---

## Appendix — files reviewed
Frontend: `proxy.ts`, `app/api/proxy/[...path]/route.ts`, `app/api/admin/{login,logout,[...path]}/route.ts`, `lib/{api.server,api.client,admin-api.client,auth.server}.ts`, `app/admin/(dash)/layout.tsx`.
Gateway: `app.ts`, `config/env.ts`, `auth/{resolve,session,apiKey}.ts`, `middleware/auth.ts`, `routes/{auth,userAuth,apikeys,chat}.ts`, `services/user.service.ts`, `auth/oauth/{github,google}.ts`, `utils/password.ts`.
