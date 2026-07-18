# Phase 6 — Frontend (master plan)

> Scope: **`apps/frontend`** (fresh Next.js 16 App Router + shadcn Base/Vega + Tailwind v4).
> Retire `apps/web` once the basics work. Talks to the gateway via a **Next.js BFF proxy**
> (chosen for Docker/K8s runtime config). Built in sub-phases P6a–P6f.
> Last updated: 2026-07-15.

---

## 0. Decisions locked
- ✅ Build fresh in **`apps/frontend`**; delete `apps/web` after P6a works.
- ✅ **BFF proxy** (not direct browser→gateway) — for portable Docker images (runtime config),
  no CORS, simple same-origin cookies, gateway stays internal for web traffic.
- ✅ Public pages **SSR/ISR** (SEO); auth/user/admin pages **protected + client-rendered**.
- ✅ shadcn for primitives; **bespoke editorial layout/typography** to match the mockups.
- ⏳ Fonts / Figma link — coming; until then approximate the mockups' minimal B/W style.

---

## 1. Architecture

### 1.1 Two fetch paths
| Caller | Path | Target | Auth |
|---|---|---|---|
| **Server Components** (SSR/ISR of public + authed pages) | `lib/api.server.ts` | `API_INTERNAL_URL` (e.g. `http://api-gateway:8000`) directly | forwards `cookies()` for authed pages |
| **Browser** (client components: login, chat, forms, key mgmt) | `/api/proxy/[...path]` (same origin) | Next server → `API_INTERNAL_URL` | cookies auto same-origin; proxy relays both ways |

- **No `NEXT_PUBLIC_API_URL`.** Browser only ever calls its own origin. Env is read at
  **runtime** by the Next server → one Docker image for all environments.

### 1.2 The proxy (`app/api/proxy/[...path]/route.ts`)
- Generic passthrough for GET/POST/PUT/DELETE.
- Forwards the incoming `Cookie` header to the gateway; copies the gateway's `Set-Cookie`
  back onto the browser response (session cookie ends up host-only on the frontend origin).
- **Streams** response bodies (so `/api/proxy/api/chat/stream` pipes SSE through unchanged).
- Strips hop-by-hop headers; preserves `Content-Type`.

### 1.3 Cookie flow (login example)
```
Browser → POST /api/proxy/api/auth/login  (same origin)
  → Next proxy → POST http://api-gateway:8000/api/auth/login
  → gateway returns Set-Cookie: sid=…; HttpOnly; SameSite=Lax
  → proxy relays Set-Cookie to the browser (now stored for the FRONTEND origin)
Subsequent: browser auto-sends sid to its origin → proxy forwards it → gateway validates.
```

### 1.4 Env vars (`apps/frontend`)
```
API_INTERNAL_URL   e.g. http://localhost:8000 (dev) / http://api-gateway:8000 (k8s)
APP_URL            public site URL (for metadata / OAuth redirects)
```
(No public API URL. All server-read, runtime.)

### 1.5 Deployment (Docker/K8s)
```
Public ingress → frontend pod (Next.js, :3000)
   frontend server ──internal DNS──▶ api-gateway service (:8000)
api-gateway keeps a separate public ingress ONLY for local-MCP/programmatic use (later),
not for web traffic.
```

---

## 2. Folder / route structure (`apps/frontend`)

```
apps/frontend/
├── app/
│   ├── layout.tsx                 root layout (fonts, theme provider, nav, footer)
│   ├── page.tsx                   Home  (/)
│   ├── (public)/
│   │   ├── guides/page.tsx                 /guides
│   │   ├── guides/[slug]/page.tsx          /guides/:slug
│   │   ├── blogs/page.tsx                  /blogs
│   │   ├── blog/[slug]/page.tsx            /blog/:slug
│   │   ├── projects/[category]/page.tsx    /projects/:category   (see §7 route note)
│   │   ├── projects/[category]/[slug]/page.tsx
│   │   ├── contact/page.tsx                /contact
│   │   └── chatfeatures/page.tsx           /chatfeatures
│   ├── (auth)/
│   │   ├── login/page.tsx                  /login
│   │   └── signup/page.tsx                 /signup
│   ├── (user)/                    guarded by middleware
│   │   ├── dashboard/page.tsx              /dashboard
│   │   ├── settings/page.tsx               /settings
│   │   ├── connect/page.tsx                /connect
│   │   ├── services/page.tsx               /services
│   │   ├── mcp/page.tsx                    /mcp   (API-key manager)
│   │   └── chat/page.tsx                   /chat  (full-page chat + history)
│   ├── admin/                     guarded (role=admin)
│   │   ├── page.tsx                        /admin
│   │   ├── projects/page.tsx   users/page.tsx   guides/page.tsx   blogs/page.tsx
│   └── api/
│       └── proxy/[...path]/route.ts        the BFF proxy
├── components/
│   ├── ui/                        shadcn primitives (button.tsx exists)
│   ├── layout/                    Nav, Footer, ThemeToggle, Container
│   ├── chat/                      LisaWidget, ChatMessages, ChatInput, ToolProgress
│   └── <feature components>
├── lib/
│   ├── api.server.ts              server-side fetch (internal URL + cookie forwarding)
│   ├── api.client.ts              browser fetch (→ /api/proxy)
│   ├── fetchers.ts                typed data fetchers per resource
│   ├── auth.ts                    getSession() (server), useUser() (client)
│   └── utils.ts                   (exists — cn())
├── types/                         local API types (no shared package)
└── middleware.ts                  guards /dashboard,/settings,/mcp,/connect,/services,/admin/*
```
Housekeeping: `create-next-app` used **npm**; align to **pnpm** (remove `package-lock.json`,
`pnpm install` at the root) so it fits the Turborepo/pnpm monorepo.

---

## 3. Design system
- **shadcn (Base/Vega)** → buttons, inputs, dialogs, dropdowns, sonner (toasts), tabs, table,
  card, sheet. Add per-phase as needed.
- **Bespoke layer** → centered top nav, column footer, the playful copy, generous whitespace,
  serif/mono headline type, **dark-mode toggle** (mockups show both). Theme via CSS variables
  in `globals.css` (already shadcn-wired) + `next-themes`.
- Match the Figma once provided; until then approximate the B/W minimal look.

### 3.1 Chosen shadcn blocks/components (decided)
| Area | shadcn source | Notes |
|---|---|---|
| **Header nav** (P6a) | `navigation-menu` | Fits the "Projects ⌄ / Resources ⌄" dropdowns. **+ a `sheet` mobile menu** (hamburger) for responsive. |
| **Dashboard shell** (P6e/P6f) | a **`sidebar` block** (likely `sidebar-07` collapsible-to-icon) **+ `breadcrumb`** | Exact block chosen at P6e once nav items are known. Used by `/dashboard` and `/admin`. |
| **Login / Signup** (P6d) | shadcn **login/signup block**, customized | Start from a block (has the Google/GitHub + email/password layout), theme it to match. Not hand-rolled from scratch. |
| Toasts | `sonner` | for form success/errors, key-copied, etc. |

---

## 4. API integration per page (maps to what the backend already serves)
| Page | Gateway endpoint(s) |
|---|---|
| Home | `/api/portfolio` (aggregate) |
| Projects category / detail | `/api/projects?category=` , `/api/projects/:slug`, `/api/categories` |
| Guides / detail | `/api/guides`, `/api/guides/:slug` |
| Blogs / detail | `/api/blogs`, `/api/blogs/:slug` |
| Contact | `POST /api/email/contact` (or `/api/inquiries`) |
| Login / Signup | `POST /api/auth/login` `/signup`; `/api/auth/google` `/github` |
| Dashboard / Settings | `/api/auth/me`, `/api/meetings/mine` |
| /mcp (keys) | `/api/apikeys` (GET/POST/DELETE) |
| /services | `POST /api/inquiries` |
| Chat (Lisa) | `POST /api/chat/stream` (SSE) |
| Admin projects/blogs/guides/users | the admin CRUD endpoints |

---

## 5. Auth + route guards
- `middleware.ts` protects `(user)` + `admin` routes: checks the `sid` cookie (calls
  `/api/auth/me` via internal URL, or a lightweight presence check) → redirect to `/login`
  if absent; `/admin/*` additionally requires `role === 'admin'`.
- `lib/auth.ts`: `getSession()` (server, reads cookie + `/api/auth/me`), `useUser()` (client).
- Login/signup pages post through the proxy; on success the `sid` cookie is set and we
  redirect to `/dashboard` (or the `?next=` param).

---

## 6. The "Lisa" chat widget (P6c)
- Floating launcher → panel (matches mockup: greeting + suggested prompts + input + mic icon).
- Streams `POST /api/proxy/api/chat/stream`; renders:
  - `delta` → markdown tokens (typing effect)
  - `progress` → subtle status line ("🔎 Checking availability…")
  - `done`/`error` → finalize
- Sends the browser's **timezone** (`Intl.DateTimeFormat().resolvedOptions().timeZone`) in the
  request `time_zone` (backend already supports it → correct slot times).
- Suggested prompts from the mockup ("What has Prajwal built with Kubernetes?", "book a call",
  "send an email", …).

---

## 7. Phasing (each shippable)
- **P6a — Foundation:** pnpm align; root layout, theme provider + dark toggle, Nav + Footer,
  Container, design tokens/fonts; `lib/api.*` + the proxy route; **Home** page (portfolio
  aggregate). Delete `apps/web` at the end.
- **P6b — Public content:** projects (category + detail), guides (+detail), blogs (+detail),
  contact form, chat-features page.
- **P6c — Lisa chat widget:** streaming + tool-progress + suggested prompts.
- **P6d — Auth:** login/signup (email + Google/GitHub buttons), session, `middleware.ts` guards.
- **P6e — User pages:** dashboard, settings, `/mcp` key manager (create/reveal-once/revoke),
  connect, services.
- **P6f — Admin:** dashboard + projects/blogs/guides/users management (CRUD UIs).

---

## TODO — future polish
- **Chat UI (Lisa) needs a design pass** — current widget is functional but basic. Improve:
  message styling/spacing, avatars, the "steps" disclosure, empty state, slot-picking UX
  (clickable time chips instead of plain text), persist the floating conversation across
  navigations (lift state into `ChatProvider`), tokens usage, stop button, error states.
- Real project images / thumbnails (currently placeholder paths, skipped).
- Styled 404 already done; add `loading.tsx` skeletons for content pages.

## 8. Open items (decide as we go)
- **Fonts / Figma** — pending from you; drives typography + spacing.
- **Project route shape** — `/projects/[category]/[slug]` (planned, collision-safe) vs
  root-level `/[category]` (prettier, needs a reserved-words guard). Defaulting to the former.
- **Book A Call** — deep-link to `cal.com/prajwal/30min` (Lisa also books conversationally).
- **Status page** (`status.prajwalraj.com`) — deferred; possibly an external uptime tool.
- **Backend touch** — add the prod frontend origin to gateway `CORS_ORIGIN` (only matters if
  we ever bypass the proxy; harmless to set).
