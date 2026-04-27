# Quick Reference Card

> One-page summary of key decisions and configurations

---

## Tech Stack At-a-Glance

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 + TypeScript + Tailwind + shadcn/ui |
| API Gateway | Node.js + Fastify + Zod |
| AI Service | Python + FastAPI + LangGraph |
| Database | Aurora PostgreSQL Serverless v2 + pgvector |
| Cache | ElastiCache Redis |
| Queue | SQS + SNS |
| Storage | S3 + CloudFront |
| Orchestration | EKS (Kubernetes 1.30) |
| IaC | Terraform + Terragrunt |
| GitOps | ArgoCD |
| CI/CD | GitHub Actions |
| Observability | Prometheus + Grafana + Loki + Tempo + Sentry |

---

## Services

| Service | Port | Language | Purpose |
|---------|------|----------|---------|
| frontend | 3000 | TypeScript | Next.js UI |
| api-gateway | 8000 | TypeScript | Central API routing |
| ai-service | 8001 | Python | AI chat, RAG, agents |
| contact-service | 8002 | TypeScript | Form handling |
| analytics-service | 8003 | TypeScript | Visitor tracking |
| notification-service | 8004 | TypeScript | Async notifications |

---

## Subdomains

| URL | Service |
|-----|---------|
| `prajwalraj.me` | Frontend |
| `api.prajwalraj.me` | API Gateway |
| `ai.prajwalraj.me` | AI Service |
| `mcp.prajwalraj.me` | Public MCP Server |
| `grafana.prajwalraj.me` | Observability Dashboard |
| `argocd.prajwalraj.me` | GitOps Dashboard |

---

## Auth Summary

| User Type | Method | Access |
|-----------|--------|--------|
| Guest | None | 5 AI messages/day, browse only |
| User | Google/GitHub OAuth | Unlimited chat, MCP client |
| Admin | Email + Password + TOTP | Everything + admin panel |

---

## Rate Limits

| Endpoint | Guest | Logged In |
|----------|-------|-----------|
| AI Chat | 5/day | Unlimited |
| API General | 100/hour | 500/hour |
| Contact Form | 3/day | 10/day |

---

## Database Tables (15)

```
users, admin_credentials, sessions,
categories, projects, skills, experience,
testimonials, inquiries,
chat_sessions, chat_messages,
mcp_credentials, analytics_events,
resume_versions, embeddings_metadata
```

---

## AI Agent Tools (8)

```
rag_tool          - Vector search
github_tool       - GitHub API
portfolio_tool    - Projects/Skills API
calendar_tool     - Google Calendar
lead_capture_tool - Save inquiries
email_tool        - SendGrid
slack_tool        - Slack webhooks
web_search_tool   - Web search
```

---

## Infrastructure

```
Region: ap-south-1 (Mumbai)

EKS Node Groups:
├── system-ng:  t3.medium x2  (monitoring, ArgoCD)
├── app-ng:     t3.large  x2  (services) - Spot
└── ai-ng:      c5.xlarge x1  (AI) - Spot

Namespaces:
├── portfolio
├── monitoring
├── argocd
├── ingress-nginx
├── cert-manager
└── external-secrets
```

---

## Key Commands

```bash
# Local development
docker-compose up

# Run all services
pnpm dev

# Run specific service
pnpm --filter web dev
pnpm --filter api-gateway dev

# Build all
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm type-check
```

---

## Terraform Commands

```bash
# Plan changes
cd infrastructure/terragrunt/prod
terragrunt run-all plan

# Apply changes
terragrunt run-all apply

# Destroy (careful!)
terragrunt run-all destroy
```

---

## Kubernetes Commands

```bash
# Get pods
kubectl get pods -n portfolio

# Logs
kubectl logs -f deployment/ai-service -n portfolio

# Scale
kubectl scale deployment/ai-service --replicas=3 -n portfolio

# Port forward
kubectl port-forward svc/grafana 3000:3000 -n monitoring
```

---

## ArgoCD

```bash
# Login
argocd login argocd.prajwalraj.me

# Sync app
argocd app sync portfolio-app

# Get app status
argocd app get portfolio-app
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...

# AI
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# AWS
AWS_REGION=ap-south-1
S3_BUCKET=prajwalraj-assets-prod

# External
SENDGRID_API_KEY=...
SLACK_WEBHOOK_URL=...
```

---

## Useful Links

| Resource | URL |
|----------|-----|
| Production | https://prajwalraj.me |
| Staging | https://staging.prajwalraj.me |
| API Docs | https://api.prajwalraj.me/docs |
| Grafana | https://grafana.prajwalraj.me |
| ArgoCD | https://argocd.prajwalraj.me |
| GitHub | https://github.com/prajwalraj/portfolio |

---

## Emergency Contacts

```
AWS Support:     AWS Console → Support
On-call:         Slack #portfolio-alerts
Incident:        PagerDuty (if configured)
```

---

## Cost Targets

| Environment | Monthly Budget |
|-------------|----------------|
| Staging | ~$150 |
| Production | ~$350-400 |
| AI APIs | ~$20 (with limits) |

Budget alerts at $200/month.
