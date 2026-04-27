# prajwalraj.me

> Enterprise-grade portfolio built with microservices, AI, and full DevOps automation

---

## Overview

This is not a typical portfolio website. It's a **production-grade distributed system** that demonstrates engineering expertise across:

- **Full-stack Development** - Next.js, Node.js, Python
- **DevOps** - Kubernetes, Terraform, CI/CD, GitOps
- **AI/ML** - LangGraph agents, RAG, MCP integration
- **Cloud Architecture** - AWS, microservices, observability

The infrastructure itself is the portfolio.

---

## Features

### For Visitors
- Beautiful, responsive portfolio UI
- AI chatbot that answers questions about me
- Semantic search across my work
- Action-taking agents (schedule meetings, submit inquiries)
- MCP client to connect their own tools

### For Me (Admin)
- Full content management (projects, skills, experience)
- Lead capture and inquiry management
- Analytics dashboard
- AI embeddings control

### Infrastructure
- Microservices on Kubernetes (EKS)
- Full observability (Prometheus, Grafana, Loki, Tempo)
- GitOps with ArgoCD
- Infrastructure as Code with Terraform
- CI/CD with GitHub Actions

---

## Architecture

```
                    Internet
                        │
              ┌─────────┴─────────┐
              │    CloudFront     │
              │    + WAF          │
              └─────────┬─────────┘
                        │
              ┌─────────┴─────────┐
              │    EKS Cluster    │
              ├───────────────────┤
              │ ┌───────────────┐ │
              │ │   frontend    │ │
              │ │   (Next.js)   │ │
              │ └───────────────┘ │
              │ ┌───────────────┐ │
              │ │  api-gateway  │ │
              │ │   (Fastify)   │ │
              │ └───────────────┘ │
              │ ┌───────────────┐ │
              │ │  ai-service   │ │
              │ │  (FastAPI)    │ │
              │ └───────────────┘ │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
   │ Aurora  │    │  Redis  │    │   S3    │
   │   DB    │    │         │    │         │
   └─────────┘    └─────────┘    └─────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind, shadcn/ui |
| Backend | Node.js, Fastify, Zod |
| AI | Python, FastAPI, LangGraph |
| Database | Aurora PostgreSQL + pgvector |
| Cache | Redis |
| Infrastructure | AWS, EKS, Terraform, ArgoCD |
| Observability | Prometheus, Grafana, Loki, Tempo, Sentry |
| CI/CD | GitHub Actions |

---

## Project Structure

```
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── api-gateway/         # Node.js API gateway
│   ├── ai-service/          # Python AI service
│   ├── contact-service/     # Contact form handler
│   ├── analytics-service/   # Visitor tracking
│   └── notification-service/# Async notifications
├── packages/
│   ├── ui/                  # Shared components
│   ├── types/               # TypeScript types
│   ├── config/              # Shared configs
│   └── database/            # DB schema
├── infrastructure/
│   ├── terraform/           # IaC modules
│   ├── terragrunt/          # Environment configs
│   ├── helm/                # Helm charts
│   └── argocd/              # GitOps definitions
├── docs/
│   ├── ARCHITECTURE.md      # Full architecture docs
│   └── QUICK_REFERENCE.md   # Quick reference card
└── .github/workflows/       # CI/CD pipelines
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker & Docker Compose
- pnpm
- AWS CLI (for deployment)
- kubectl (for Kubernetes)
- Terraform (for infrastructure)

### Local Development

```bash
# Clone the repository
git clone https://github.com/prajwalraj/portfolio.git
cd portfolio

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start local services (Postgres, Redis)
docker-compose up -d

# Run all services in development
pnpm dev

# Or run specific services
pnpm --filter web dev
pnpm --filter api-gateway dev
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific package tests
pnpm --filter api-gateway test
```

---

## Deployment

Deployment is fully automated via GitOps:

1. Push to `main` branch
2. GitHub Actions builds and pushes Docker images
3. Helm values updated with new image tags
4. ArgoCD detects changes and syncs to EKS

### Manual Deployment (if needed)

```bash
# Build images
pnpm build:docker

# Deploy to staging
kubectl config use-context staging
argocd app sync portfolio-app

# Deploy to production
kubectl config use-context production
argocd app sync portfolio-app --prune
```

---

## Infrastructure

```bash
# Navigate to environment
cd infrastructure/terragrunt/prod

# Plan changes
terragrunt run-all plan

# Apply changes
terragrunt run-all apply
```

---

## Documentation

### Architecture & Design
- [Full Architecture](docs/ARCHITECTURE.md) - Complete system documentation
- [Quick Reference](docs/QUICK_REFERENCE.md) - One-page summary
- [User Flows](docs/USER_FLOWS.md) - Detailed user journey documentation

### Development Guides
- [Monorepo Guide](docs/MONOREPO_GUIDE.md) - How workspaces work, package sharing
- [Database Package](docs/DATABASE_PACKAGE.md) - Prisma setup, configuration
- [API Gateway Setup](docs/API_GATEWAY_SETUP.md) - Fastify routes, request flow

---

## Domains

| URL | Purpose |
|-----|---------|
| prajwalraj.me | Main portfolio |
| api.prajwalraj.me | API Gateway |
| ai.prajwalraj.me | AI Service |
| mcp.prajwalraj.me | Public MCP Server |
| grafana.prajwalraj.me | Observability |

---

## License

Private - All rights reserved

---

## Author

**Prajwal Raj**  
Senior Software Engineer  
[prajwalraj.me](https://prajwalraj.me)
