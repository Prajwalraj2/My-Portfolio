# Roadmap / Backlog — prajwalraj.com

> Single tracking list for everything remaining now that **P1–P6 are feature‑complete**
> (backend API, AI agent "Lisa", public site, user dashboard, chat history, admin console).
> Last updated: 2026-07-18. Security details live in [SECURITY_REVIEW.md](./SECURITY_REVIEW.md);
> frontend phase notes in [FRONTEND_PLAN.md](./FRONTEND_PLAN.md).

Status key: ⬜ not started · 🟦 in progress · ✅ done · Priority: **P0** blocks public launch · **P1** soon after · **P2** nice‑to‑have.

---

## 1. Security — pre‑launch hardening
Full analysis + fixes in [SECURITY_REVIEW.md](./SECURITY_REVIEW.md). Tracked here as tasks.

| Prio | ID | Task | Status |
|------|----|------|--------|
| P0 | SEC‑01 | Refuse to boot on default `JWT_SECRET`/`JWT_REFRESH_SECRET`/`COOKIE_SECRET` in production; set strong values in prod env | ⬜ |
| P0 | SEC‑03 | Enable admin **TOTP** (code already exists, commented) + strict rate‑limit/lockout on `/auth/admin/login` & `/auth/login` | ⬜ |
| P0 | SEC‑02 | Close OAuth↔password **account pre‑hijack**: email verification, or restrict OAuth auto‑link to social‑only/verified accounts | ⬜ |
| P0 | — | Confirm prod `CORS_ORIGIN` = exact domain(s); HTTPS enforced (secure cookies); no real secret in any tracked file | ⬜ |
| P1 | SEC‑04 | Rate‑limit at ingress/frontend with real client IP; move rate‑limit state to **Redis** (multi‑replica) | ⬜ |
| P1 | SEC‑05 | Keep JSON‑only + strict CORS as hard invariants; consider `sameSite=strict` for `sid` | ⬜ |
| P2 | SEC‑06 | Admin token revocation (refresh‑token store / `jti` blacklist) | ⬜ |
| P2 | SEC‑07 | Reject `..`/`.` segments in the BFF proxies | ⬜ |
| P2 | SEC‑09 | Prefer verified GitHub `/user/emails` entry over `/user.email` | ⬜ |
| P2 | SEC‑08 | Reduce user enumeration (generic signup msg + constant‑time login) | ⬜ |
| P2 | SEC‑10/11 | Cleanup: wire or drop `COOKIE_SECRET`; map `ZodError` → HTTP 400 | ⬜ |

---

## 2. Deployment (Docker / Kubernetes)
The earlier Docker/K8s support predates `apps/frontend`; the new frontend needs wiring.

| Prio | Task | Status |
|------|------|--------|
| P0 | Dockerfile for `apps/frontend` (Next 16 **standalone** output) | ⬜ |
| P0 | Runtime env wiring: `API_INTERNAL_URL` → gateway service DNS; `APP_URL`; no baked `NEXT_PUBLIC_*` | ⬜ |
| P0 | K8s manifests for frontend (Deployment/Service) + ingress → frontend; gateway stays internal (separate ingress only for MCP/programmatic) | ⬜ |
| P0 | Secrets via K8s **Secret** (JWT/COOKIE/OAuth/Cal.com/Resend/Slack/DB) — never in images | ⬜ |
| P1 | `docker-compose` for the full 3‑service local stack (frontend + gateway + ai‑service) | ⬜ |
| P1 | Health checks / readiness probes; DB migrations (`prisma migrate deploy`) step | ⬜ |
| P1 | Register prod OAuth redirect URIs (`/api/proxy/auth/{google,github}/callback`) in Google/GitHub consoles | ⬜ |

---

## 3. MCP servers
| Prio | Task | Status |
|------|------|--------|
| — | **Local npm MCP server** (`apps/local-npm-mcp-server`) — 8 tools (reads + meetings), stdio, `pk_live_` bearer, key required for all tools. `/mcp` page emits ready-to-paste config. | ✅ built + tested |
| P1 | **Publish `prajwalraj-mcp` to npm** — the `/mcp` copy-config uses `npx -y prajwalraj-mcp`, which only works once published. Unblocks real users. | ⬜ |
| P2 | Contact-write tools in the MCP (`send_email_to_prajwal`, `submit_inquiry`, `leave_recommendation`) | ⬜ |
| — | **Python/pip local MCP** (`apps/local-python-mcp-server`, FastMCP, `uvx`) — same 8 tools, key required | ✅ built + tested |
| P1 | Publish `prajwalraj-mcp` to **PyPI** (unblocks the `uvx` config for real users) | ⬜ |
| P2 | **Remote MCP server** (P5) — HTTP + OAuth 2.1, logged-in only, container :8002 | ⬜ |

## 4. AI / backend hardening
| Prio | Task | Status |
|------|------|--------|
| P1 | **Enforced HITL** (human‑in‑the‑loop) for sensitive agent actions (currently prompt‑based confirmation only) | ⬜ |
| P1 | **Postgres checkpointer** for LangChain agent memory (persistent, cross‑session) | ⬜ |
| P1 | Redis for API‑key rate limiting + chat rate limiting (see SEC‑04) | ⬜ |
| P2 | Chat abuse controls: per‑user/session message rate limits, max tokens, cost guardrails | ⬜ |
| P2 | Persist guest chats (currently logged‑in only) — deferred product decision | ⬜ |

---

## 5. Frontend polish
| Prio | Task | Status |
|------|------|--------|
| P1 | **Chat UI design pass** — clickable time chips for booking, persist the floating conversation across navigations (lift into `ChatProvider`), stop button, better error states, token/usage display | ⬜ |
| P1 | Real **project images / thumbnails** (currently placeholder paths) | ⬜ |
| P1 | `loading.tsx` **skeletons** for content pages | ⬜ |
| P2 | Retire `apps/web` (old frontend) once `apps/frontend` fully replaces it | ⬜ |
| P2 | Align `apps/frontend` to **pnpm** (remove `package-lock.json`; pnpm workspace) | ⬜ |
| P2 | Fonts / Figma typography + spacing pass (match the mockups precisely) | ⬜ |
| P2 | Markdown editor with preview for blog/guide bodies (currently plain textarea) | ⬜ |
| P2 | Mobile nav session‑awareness; misc responsive polish | ⬜ |

---

## 6. Content & product
| Prio | Task | Status |
|------|------|--------|
| P1 | Full **end‑to‑end QA pass** (public → auth → dashboard → chat history → admin CRUD) with the real backend | ⬜ |
| P2 | Real content: seed projects/categories/blogs/guides/profile/skills/experience via the admin console | ⬜ |
| P2 | Status page (`status.prajwalraj.com`) — possibly an external uptime tool | ⬜ |
| P2 | Analytics wiring (the `AnalyticsEvent` table exists but isn't populated) | ⬜ |
| P2 | Email verification + password reset flows (ties to SEC‑02) | ⬜ |

---

## Suggested order
1. **Security P0** (SEC‑01 → SEC‑03 → SEC‑02) — cheap, closes the launch‑blocking holes.
2. **Deployment P0** — get the three services running in containers together.
3. **End‑to‑end QA pass** — shake out bugs against the containerized stack.
4. **Security/AI P1** (Redis, ingress rate‑limit, HITL, Postgres checkpointer).
5. **Frontend polish P1** (chat UX, images, skeletons) + real content.
6. **P2 cleanup** as time allows.
