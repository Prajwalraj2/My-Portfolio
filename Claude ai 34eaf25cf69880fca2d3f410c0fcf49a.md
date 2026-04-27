# Claude.ai

---

Me:

```yaml
I am a senior software eginneer. with about 5 years of experience
I have worked in several domains like- development ( frontend, backend, database )
Built several stuffs in these area
I have also worked in DevOps Domain - built a lots of scalable solutions - usings almost all the thingspresent in this DevOps Domain,.
I have also worked in AI Domain a lots - built so many advance solutions - with llm, frameworks - advance Agentic solutions
Also have built - Advance Automations
- Also have made several mcp server - mcp client - Agentic Solutions - remote mcp and all
```

- Reply
    
    ---
    
    That's a strong and well-rounded profile! You've covered a solid breadth across the full stack — from core dev to DevOps infrastructure to cutting-edge AI/agentic systems. That combination is genuinely rare and valuable right now.
    
    What are you looking to do? I can help you with things like:
    
    - **Resume / portfolio** — crafting a compelling narrative around your experience
    - **Interview prep** — system design, AI/ML, DevOps, or coding rounds
    - **Career direction** — figuring out your next move (IC track, staff eng, AI-focused roles, etc.)
    - **Technical deep-dives** — architecture reviews, building something new, learning gaps
    - **Side projects / OSS** — ideas that could stand out given your background
    
    What's on your mind?
    

Me:

```yaml
ok now you know about me 
I was thinking to build a website for my self - a very very advance portfolio fo my self
it won't just be a normal frontend & data
It should be build deployed scaled - everything - just like an application is built in real world by big companies
A very advance porfolio - built , deployed scalaed with proper - iindustry standards level - following all the advance architecture - followed ini the industry

Lets discuss first in detail
```

- Reply
    
    ---
    
    Love this vision. A portfolio that *itself* demonstrates your engineering depth — not just talks about it. That's the right instinct.
    
    Let me ask a few things to shape the architecture discussion:
    

Me:

```yaml
Q: What's the primary goal of this portfolio?
A: All of the above

Q: Which cloud provider are you most comfortable with?
A: AWS

Q: What's your preferred frontend approach?
A: Next.js (React)
```

- Reply
    
    ---
    
    Perfect. Let's think about this properly.
    
    ---
    
    ## The Core Philosophy
    
    Your portfolio shouldn't just *list* your skills — it should **be** the proof. Every architectural decision you make in building it is itself a demonstration of your expertise. Someone visiting it should think *"this person built this"* and be impressed by the infrastructure alone.
    
    ---
    
    ## Let's Break It Down Into Layers
    
    ### 1. 🖥️ Frontend — Next.js
    
    - **App Router** with RSC (React Server Components)
    - **SSG + ISR** — static where possible, revalidated where dynamic
    - **Edge Middleware** — geo-routing, auth guards, A/B testing
    - Stunning UI — **Framer Motion** animations, **Three.js** 3D elements
    - **Dark/light mode**, perfect Lighthouse scores (100s across the board)
    - Fully **i18n-ready**
    
    ### 2. ⚙️ Backend — Microservices / API Layer
    
    - **Next.js API routes** for lightweight endpoints
    - Separate **Node.js / Python microservices** for heavier logic (contact form, AI chat, analytics ingestion)
    - **GraphQL or tRPC** for type-safe API contracts
    - **Redis** for caching, rate limiting, session management
    
    ### 3. 🤖 AI Layer — This is your differentiator
    
    - **AI Chat Assistant** — an LLM-powered bot that knows your resume, projects, skills. Visitors ask it questions about you
    - **RAG pipeline** — your resume + project docs embedded in a vector DB (Pinecone / pgvector)
    - **MCP Server** exposed publicly — showing you literally built one into your own portfolio
    - **Agentic workflows** — e.g., auto-summarize blog posts, classify visitor intent
    
    ### 4. 🗄️ Database Layer
    
    - **PostgreSQL (RDS/Aurora)** — primary data store
    - **Redis (ElastiCache)** — caching + pub/sub
    - **S3** — media, assets, resume PDF
    - **Vector DB** — Pinecone or pgvector for the RAG system
    
    ### 5. 🚀 DevOps / Infrastructure — Show your infra skills
    
    - **Terraform** — all infra as code, version controlled
    - **Docker + ECR** — containerized services
    - **ECS Fargate or EKS** — orchestration (EKS if you want to flex Kubernetes)
    - **CI/CD** — GitHub Actions pipelines (lint → test → build → deploy)
    - **CloudFront CDN** — global edge distribution
    - **Route 53** — DNS management
    - **ACM** — SSL/TLS certificates
    - **WAF + Shield** — DDoS protection, rate limiting at edge
    - **Secrets Manager** — zero hardcoded secrets
    
    ### 6. 📊 Observability — Full production-grade stack
    
    - **OpenTelemetry** — traces, metrics, logs unified
    - **Grafana + Prometheus** — dashboards (and make them public! Visitors can see your infra metrics live)
    - **CloudWatch** — AWS-native alarms
    - **Sentry** — error tracking on frontend + backend
    - **Uptime monitoring** — Better Stack or Checkly
    
    ### 7. 🔒 Security
    
    - **Zero-trust** approach
    - **VPC** with private subnets for databases
    - **IAM roles** with least privilege (no IAM users)
    - **OWASP headers** on all responses
    - **Rate limiting** on AI endpoints (it's expensive)
    
    ### 8. 📈 Architecture Patterns to Showcase
    
    - **Event-driven** — SQS/SNS for async jobs (e.g., contact form → notification pipeline)
    - **CQRS** light pattern for read/write separation
    - **Feature flags** — LaunchDarkly or custom, shows production maturity
    - **Blue/Green deployments** — zero downtime deploys
    
    ---
    
    ## What Makes This Jaw-Dropping for Visitors
    
    | Feature | What It Proves |
    | --- | --- |
    | Live AI assistant that knows you | LLM + RAG + MCP skills |
    | Public Grafana dashboard | Full observability mindset |
    | Terraform repo linked in footer | IaC discipline |
    | GitHub Actions workflows visible | CI/CD maturity |
    | Sub-100ms TTFB globally | CDN + edge architecture |
    | Architecture diagram page | Systems thinking |
    
    ---
    
    ## Phased Build Plan
    
    **Phase 1 — Foundation** (2 weeks)
    Core Next.js app, design system, static content, CI/CD pipeline, deployed to AWS via Terraform
    
    **Phase 2 — Backend + Data** (1 week)
    PostgreSQL, Redis, S3, contact/inquiry microservice, API layer
    
    **Phase 3 — AI Layer** (1-2 weeks)
    RAG pipeline, AI chat assistant, vector DB, MCP server integration
    
    **Phase 4 — Observability + Security** (1 week)
    OpenTelemetry, Grafana, Sentry, WAF, VPC hardening
    
    **Phase 5 — Polish + Scale** (ongoing)
    Performance tuning, load testing (k6), blog system, case studies
    
    ---
    
    ## Questions Before We Go Deeper
    
    A few things to align on before we design the detailed architecture:
    
    1. **Domain name** — do you have one already?
    2. **Budget** — rough monthly AWS spend you're comfortable with? (This stack can range from ~$30/mo to $200+/mo depending on choices)
    3. **ECS Fargate vs EKS** — do you want Kubernetes in the mix or keep it simpler with Fargate?
    4. **Blog?** — Do you want a blog/content section (MDX-based or headless CMS like Sanity)?
    
    What do you want to dive deeper into first?
    

Me:

```yaml
To answer your questions - Yes I do have a Domain Name: prajwalraj.me
Budget - is fine
I think we can have Kubernetes in the picture - since we are going with microservice architecture
Blogs - I think as of now I don't have any plan for that - but will have it going forward.
```

- Reply
    
    ---
    
    Great choices. Domain's clean, EKS makes total sense with microservices, and we can design the blog integration point now even if we build it later.
    
    Let me now lay out the **complete, definitive architecture** for `prajwalraj.me`.
    
    ---
    
    ## 🏗️ Complete System Architecture
    
    ### Domain & Edge Layer
    
    ```
    prajwalraj.me (Route 53)
            ↓
       CloudFront (CDN + Edge)
            ↓
       WAF (Web Application Firewall)
            ↓
       ALB (Application Load Balancer)
    ```
    
    ### Compute Layer — EKS
    
    ```
    EKS Cluster (us-east-1 + ap-south-1)  ← dual region, shows geo-awareness
    ├── frontend-service        (Next.js)
    ├── api-gateway-service     (Node.js — central routing)
    ├── ai-service              (Python — RAG, LLM, MCP server)
    ├── contact-service         (Node.js — form handling, SQS producer)
    ├── analytics-service       (Node.js — event ingestion)
    └── notification-service    (Node.js — SQS consumer → email/slack)
    ```
    
    ### Data Layer
    
    ```
    ├── RDS Aurora PostgreSQL   (primary DB — private subnet)
    ├── ElastiCache Redis       (caching + rate limiting + sessions)
    ├── S3                      (assets, resume PDF, media)
    ├── Pinecone / pgvector     (vector store for RAG)
    └── SQS                     (async event queue)
    ```
    
    ### Observability Stack
    
    ```
    ├── OpenTelemetry Collector (sidecar on every pod)
    ├── Prometheus              (metrics scraping)
    ├── Grafana                 (dashboards — publicly accessible)
    ├── Loki                    (log aggregation)
    ├── Tempo                   (distributed tracing)
    └── Sentry                  (error tracking — FE + BE)
    ```
    
    ### CI/CD Pipeline
    
    ```
    GitHub
    ├── PR → lint + test + security scan (Trivy, SAST)
    ├── Merge to main → build Docker images → push to ECR
    ├── Helm chart update → ArgoCD syncs to EKS
    └── Smoke tests → Slack notification
    ```
    
    ### IaC
    
    ```
    terraform/
    ├── modules/
    │   ├── eks/
    │   ├── rds/
    │   ├── elasticache/
    │   ├── s3/
    │   ├── cloudfront/
    │   ├── route53/
    │   ├── waf/
    │   └── sqs/
    ├── environments/
    │   ├── prod/
    │   └── staging/
    └── global/
    ```
    
    ---
    
    ## 📁 Complete Monorepo Structure
    
    ```
    prajwalraj.me/
    ├── apps/
    │   ├── web/                        # Next.js frontend
    │   ├── api-gateway/                # Node.js — central API router
    │   ├── ai-service/                 # Python — RAG + LLM + MCP
    │   ├── contact-service/            # Node.js — contact form handler
    │   ├── analytics-service/          # Node.js — visitor events
    │   └── notification-service/       # Node.js — async notifications
    │
    ├── packages/
    │   ├── ui/                         # Shared component library
    │   ├── types/                      # Shared TypeScript types
    │   ├── config/                     # ESLint, Tailwind, TS configs
    │   └── utils/                      # Shared utilities
    │
    ├── infrastructure/
    │   ├── terraform/                  # All AWS infra as code
    │   ├── helm/                       # Helm charts per service
    │   ├── k8s/                        # Raw K8s manifests (base)
    │   └── argocd/                     # ArgoCD app definitions
    │
    ├── .github/
    │   └── workflows/                  # CI/CD pipelines
    │
    ├── docs/
    │   ├── architecture.md
    │   ├── adr/                        # Architecture Decision Records
    │   └── runbooks/                   # Incident runbooks
    │
    ├── scripts/                        # Dev setup, DB migrations, etc.
    ├── docker-compose.yml              # Local full-stack dev
    ├── turbo.json                      # Turborepo config
    └── pnpm-workspace.yaml
    ```
    
    ---
    
    ## 🤖 AI Service — Deep Design
    
    This is your biggest differentiator. Here's exactly how it works:
    
    ```
    Visitor types: "What has Prajwal built with Kubernetes?"
            ↓
    ai-service receives query
            ↓
    Query → OpenAI Embeddings → vector
            ↓
    Pinecone similarity search → top-k chunks
    (your resume, project docs, case studies)
            ↓
    Chunks + query → LLM (Claude/GPT-4) → response
            ↓
    Response streamed back to visitor
    ```
    
    **What gets embedded into the vector store:**
    
    - Your resume (chunked)
    - Every project description + tech stack
    - Case studies you write
    - Your GitHub README files (auto-ingested via GitHub API)
    - Blog posts (future-ready)
    
    **MCP Server** (publicly exposed — huge flex):
    
    ```
    Tools exposed via your MCP server:
    ├── get_projects()          → returns your projects with metadata
    ├── get_skills()            → structured skills graph
    ├── get_experience()        → work history
    ├── search_portfolio()      → semantic search over your work
    └── get_contact_info()      → returns contact details
    ```
    
    Anyone can point their Claude/Cursor to `mcp.prajwalraj.me` and query your portfolio programmatically. That's a statement.
    
    ---
    
    ## 🌐 Subdomains Map
    
    ```
    prajwalraj.me             → main portfolio (Next.js)
    api.prajwalraj.me         → API gateway
    ai.prajwalraj.me          → AI service
    mcp.prajwalraj.me         → public MCP server
    grafana.prajwalraj.me     → live observability dashboard (public read)
    staging.prajwalraj.me     → staging environment
    ```
    
    ---
    
    ## 🔒 Network & Security Design
    
    ```
    VPC (10.0.0.0/16)
    ├── Public Subnets          → ALB, NAT Gateway
    ├── Private Subnets         → EKS nodes, RDS, ElastiCache
    └── Isolated Subnets        → RDS (no internet, ever)
    
    Security Groups:
    ├── ALB-SG                  → 443 from internet only
    ├── EKS-Node-SG             → from ALB-SG only
    ├── RDS-SG                  → from EKS-Node-SG only
    └── Redis-SG                → from EKS-Node-SG only
    ```
    
    ---
    
    ## 🚦 K8s Per-Service Setup
    
    Every microservice gets:
    
    ```yaml
    ├── Deployment              # with resource limits + requests
    ├── HorizontalPodAutoscaler # min 2, max 10 pods
    ├── PodDisruptionBudget     # zero-downtime deploys
    ├── ServiceAccount          # IRSA — AWS permissions via K8s SA
    ├── ConfigMap               # non-secret config
    ├── ExternalSecret          # pulls from AWS Secrets Manager
    ├── Service                 # ClusterIP
    ├── NetworkPolicy           # whitelist-only inter-service traffic
    └── ServiceMonitor          # Prometheus scrape config
    ```
    
    ---
    
    ## 📊 What Your Public Grafana Shows
    
    Make this publicly visible — it's a live resume:
    
    - **Request rate** per service (RPS)
    - **P50 / P95 / P99 latency** per endpoint
    - **AI query volume** over time
    - **Pod count** (shows autoscaling in action)
    - **Error rate** per service
    - **Uptime** (99.9x% SLA)
    - **Visitor heatmap** by region
    
    ---
    
    ## 🛠️ Tech Stack Summary
    
    | Layer | Technology |
    | --- | --- |
    | Frontend | Next.js 15, TypeScript, Tailwind, Framer Motion |
    | API Gateway | Node.js, Fastify, tRPC |
    | AI Service | Python, FastAPI, LangChain, LlamaIndex |
    | Auth (admin) | NextAuth.js + JWT |
    | Database | Aurora PostgreSQL |
    | Cache | ElastiCache Redis |
    | Queue | SQS + SNS |
    | Vector DB | Pinecone (or pgvector on Aurora) |
    | Container Registry | AWS ECR |
    | Orchestration | EKS (Kubernetes) |
    | GitOps | ArgoCD |
    | IaC | Terraform + Terragrunt |
    | CI/CD | GitHub Actions |
    | CDN | CloudFront |
    | DNS | Route 53 |
    | Secrets | AWS Secrets Manager + External Secrets Operator |
    | Observability | OpenTelemetry + Prometheus + Grafana + Loki + Tempo |
    | Error Tracking | Sentry |
    | Security | WAF, VPC, IRSA, Network Policies, Trivy |
    | Package Manager | pnpm + Turborepo |
    
    ---
    
    ## 🗓️ Refined Build Phases
    
    | Phase | What | Duration |
    | --- | --- | --- |
    | **1** | Monorepo setup, Next.js skeleton, design system, Turborepo | Week 1 |
    | **2** | Terraform — VPC, EKS, RDS, Redis, S3, Route53, CloudFront | Week 1-2 |
    | **3** | Dockerize all services, Helm charts, ArgoCD, ECR, CI/CD | Week 2-3 |
    | **4** | Frontend — all pages, animations, content | Week 3-4 |
    | **5** | AI service — RAG pipeline, chat UI, MCP server | Week 4-5 |
    | **6** | Observability — OTel, Prometheus, Grafana, Loki, Sentry | Week 5-6 |
    | **7** | Security hardening, WAF, Network Policies, load testing (k6) | Week 6-7 |
    | **8** | Staging env, smoke tests, go live on prajwalraj.me | Week 7-8 |
    
    ---
    
    This is the full picture. Every layer is intentional and demonstrable.
    
    **Where do you want to start building first?** I'd suggest Phase 1 — monorepo + Next.js foundation + Terraform skeleton, since everything else builds on top. We can go file by file, decision by decision.
    

Me:

```yaml
Ok thats good.

I was thinking of somthing things.

So its true - we are going to have a chat interface as well.

Going forward - we are also going to have many things - like MCP Client - where people might - enter their remote mcp credentials -> and they can interact with their mcp 

Might be login as well ( As being loggout - give them only certain limit -> of chat)

So for this - I was thinking should we have frontend and backend seperate ???  I am confused 

---

Next the AI -> I have built many solutions using langgraph as well - ReAct agent -> calling live api & getting data - live data

So I was thinkging -> In AI lets have both the things

* RAG ( vector store -> for static things like Resume, who am I  and all)
* Calling API -> for getting Projects info and all

And then agent can all what ever tools - based on user query.

What do you say is the idea good ?

This will demonstrate my RAG skills as well as Live API Calling skills as well ( taking action )

I also wanted to Action taking agents -> to include in this -> but I am not getting idea on what to have in this .

THe second one i told you that is -> Calling api -> this is good desmostration of using GET api and fetching the details 

But I also want to include a live action taking agent -> ( something like using Post api ) -> But I am not idea on that as of now 

May be you can suggest some really good ideas -

I really want to make this a very advance portfolio.
```

- Reply
    
    ---
    
    Great thinking on all fronts. Let me address each thing properly.
    
    ---
    
    ## 1. Frontend + Backend — Separate or Together?
    
    **Separate. Absolutely.**
    
    Here's why, especially given your roadmap:
    
    ```
    You're planning:
    ├── Chat interface          → needs WebSocket / streaming
    ├── MCP Client UI           → users enter remote MCP credentials
    ├── Login / Auth system     → JWT, sessions, rate limiting
    └── Guest vs auth limits    → business logic on who gets what
    ```
    
    If you keep it together in Next.js API routes, you'll hit walls fast — scaling the AI backend independently becomes hard, auth logic gets tangled with UI, and your MCP client credentials handling deserves its own secured service.
    
    **The clean split:**
    
    ```
    prajwalraj.me              → Next.js (pure frontend + SSR/SSG)
    api.prajwalraj.me          → API Gateway (Node.js/Fastify)
    ai.prajwalraj.me           → AI Service (Python/FastAPI)
    mcp.prajwalraj.me          → MCP Server (your public MCP)
    ```
    
    Next.js handles **rendering only**. All data, auth, AI — goes through the backend. This also means your backend is independently scalable on EKS, which is the whole point.
    
    **Auth design:**
    
    ```
    Guest (logged out)
    ├── 5 AI chat messages / day     (Redis rate limit by IP)
    ├── No MCP client access
    └── No saved history
    
    Logged in (Google / GitHub OAuth)
    ├── Unlimited chat
    ├── MCP Client access
    ├── Chat history saved
    └── Can save MCP credentials (encrypted in DB)
    ```
    
    This is smart because it also gives you **real user data** — who's visiting, what they're asking, engagement metrics.
    
    ---
    
    ## 2. AI Agent Architecture — Yes, Your Idea is Excellent
    
    RAG + Live API calling together is exactly right. Here's how to think about it as a **unified LangGraph agent:**
    
    ```
    User Query
        ↓
    LangGraph ReAct Agent
        ↓
    Router (LLM decides which tools to call)
        ↓
    ┌─────────────────────────────────────┐
    │           TOOL REGISTRY             │
    │                                     │
    │  [RAG Tool]                         │
    │  → Search vector store              │
    │  → Resume, bio, skills, story       │
    │                                     │
    │  [GitHub API Tool]                  │
    │  → GET /repos → live project list   │
    │  → GET /repo/readme → description   │
    │  → Stars, languages, activity       │
    │                                     │
    │  [Portfolio API Tool]               │
    │  → GET /projects → your curated DB  │
    │  → GET /skills → skills graph       │
    │  → GET /experience → work history   │
    │                                     │
    │  [Web Search Tool]                  │
    │  → For questions about tech Prajwal │
    │    uses — pulls live context        │
    └─────────────────────────────────────┘
        ↓
    LLM synthesizes answer from tool results
        ↓
    Streamed response to user
    ```
    
    **Why this is a powerful demonstration:**
    
    - RAG → shows embeddings, vector search, chunking strategy
    - Live GitHub API → shows agent taking real-time action
    - Multi-tool orchestration → shows LangGraph ReAct loop
    - Streaming → shows production AI UX
    
    ---
    
    ## 3. Action-Taking Agent Ideas — This is the Hard Part, Here are Real Ideas
    
    You're right that POST/write actions are a whole level above GET. Here are genuinely good ideas that make sense for a portfolio:
    
    ---
    
    ### 🔥 Idea 1 — "Schedule a Meeting with Me" Agent
    
    ```
    User: "I'd like to connect with Prajwal about a backend role"
        ↓
    Agent:
      → Checks your availability (Google Calendar API - GET)
      → Proposes 3 slots
      → User confirms
      → Creates calendar event (Google Calendar API - POST)
      → Sends confirmation email (SendGrid API - POST)
      → Saves lead in your DB (POST /leads)
    ```
    
    **Why it's impressive:** Full agentic loop — perceive, plan, act, confirm. Real write actions. Practical business value. Hiring managers will literally USE this.
    
    ---
    
    ### 🔥 Idea 2 — "Leave a Testimonial" Agent
    
    ```
    User: "I want to leave a recommendation for Prajwal"
        ↓
    Agent:
      → Conversationally collects: name, role, company, message
      → Validates content (no spam/abuse check via LLM)
      → POST /testimonials → saves to DB
      → Triggers moderation queue (SQS message)
      → You get Slack notification (POST to Slack webhook)
      → On approval → auto-publishes to portfolio
    ```
    
    **Why it's impressive:** Multi-step form via conversation, write to DB, async queue, Slack integration — all agentic.
    
    ---
    
    ### 🔥 Idea 3 — "Hire Me" Workflow Agent
    
    ```
    User: "We have a contract project, can Prajwal help?"
        ↓
    Agent:
      → Asks: budget, timeline, tech stack, project description
      → POST /inquiries → saves structured lead to DB
      → Sends you a Slack alert with summary (POST)
      → Sends user a confirmation email (POST SendGrid)
      → Creates a Notion page with the brief (Notion API - POST)
    ```
    
    **Why it's impressive:** End-to-end lead capture pipeline, multi-API orchestration, structured data extraction from conversation.
    
    ---
    
    ### 🔥 Idea 4 — "Generate My Custom Resume" Agent
    
    ```
    User: "Generate a tailored resume for a DevOps Engineer role at Netflix"
        ↓
    Agent:
      → Fetches your full profile from RAG + portfolio API
      → Fetches job description context (web search tool)
      → LLM generates tailored resume matching JD
      → POST /resumes/generate → saves PDF to S3
      → Returns signed S3 URL → user downloads
    ```
    
    **Why it's impressive:** RAG + live search + PDF generation + S3 — all in one agentic flow. Also genuinely useful for you.
    
    ---
    
    ### My Recommendation — Build All 4, Progressively
    
    ```
    Phase 1 (Launch):    RAG + GitHub API + Portfolio API (GET tools)
    Phase 2 (Week 2):    Schedule Meeting agent (Calendar POST)
    Phase 3 (Week 3):    Testimonial + Hire Me agents
    Phase 4 (Later):     Custom Resume generator
    ```
    
    ---
    
    ## Revised AI Architecture
    
    ```
    ai-service/
    ├── agent/
    │   ├── graph.py              # LangGraph ReAct graph definition
    │   ├── state.py              # Agent state schema
    │   └── router.py             # Tool selection logic
    │
    ├── tools/
    │   ├── rag_tool.py           # Vector store search
    │   ├── github_tool.py        # GitHub API (GET)
    │   ├── portfolio_tool.py     # Your portfolio API (GET)
    │   ├── calendar_tool.py      # Google Calendar (GET + POST)
    │   ├── lead_capture_tool.py  # Save inquiries (POST)
    │   ├── email_tool.py         # SendGrid (POST)
    │   └── slack_tool.py         # Slack notifications (POST)
    │
    ├── rag/
    │   ├── embedder.py           # Chunking + embedding pipeline
    │   ├── ingestion.py          # Resume, projects → vector store
    │   └── retriever.py          # Similarity search
    │
    ├── mcp/
    │   ├── server.py             # Your public MCP server
    │   └── client.py             # MCP client (for user credentials)
    │
    └── api/
        ├── chat.py               # Streaming chat endpoint
        ├── auth.py               # Token validation
        └── rate_limit.py         # Redis-based limiting
    ```
    
    ---
    
    ## The Story This Tells Visitors
    
    ```
    "Prajwal's portfolio has an AI agent that can:
      - Answer questions about him using RAG
      - Pull his live GitHub projects in real-time
      - Book a meeting with him directly
      - Capture your project inquiry end-to-end
      - And it's all running on EKS with full observability"
    ```
    
    That's not a portfolio. That's a product. And that's exactly the point.
    
    ---
    
    **Shall we now lock the final architecture and start Phase 1?** I'd suggest we begin with the monorepo structure + Terraform VPC/EKS skeleton — the foundation everything else sits on.
    

Me:

```yaml
OK Before we local final architecutre - 

I am much clear on Ai Part 

I want to know DevOps side - eveything about it - what are we going to do .

Evertyhing we are going to do in this.
```

- Reply
    
    ---
    
    Great. Let's go deep on the DevOps side. This is where your portfolio will truly stand out from every other "deployed on Vercel" portfolio out there.
    
    ---
    
    ## 🏗️ Complete DevOps Architecture for `prajwalraj.me`
    
    ---
    
    ## 1. 📦 Infrastructure as Code — Terraform + Terragrunt
    
    **Why Terragrunt on top of Terraform?**
    
    - DRY config across environments (staging vs prod)
    - Remote state management without repetition
    - Dependency graph between modules
    
    ```
    infrastructure/
    ├── terraform/
    │   └── modules/                    # Reusable modules
    │       ├── vpc/
    │       ├── eks/
    │       ├── rds/
    │       ├── elasticache/
    │       ├── s3/
    │       ├── cloudfront/
    │       ├── route53/
    │       ├── waf/
    │       ├── sqs/
    │       ├── ecr/
    │       ├── acm/
    │       └── secrets-manager/
    │
    └── terragrunt/
        ├── terragrunt.hcl              # Root config — remote state, provider
        ├── staging/
        │   ├── vpc/terragrunt.hcl
        │   ├── eks/terragrunt.hcl
        │   ├── rds/terragrunt.hcl
        │   └── ...
        └── prod/
            ├── vpc/terragrunt.hcl
            ├── eks/terragrunt.hcl
            ├── rds/terragrunt.hcl
            └── ...
    ```
    
    **What gets provisioned via Terraform — everything:**
    
    ```
    Networking        → VPC, Subnets, IGW, NAT Gateway, Route Tables
    Compute           → EKS Cluster, Node Groups, IAM Roles
    Database          → Aurora PostgreSQL, Parameter Groups, Subnet Groups
    Cache             → ElastiCache Redis Cluster
    Storage           → S3 Buckets (assets, backups, terraform state)
    CDN               → CloudFront Distribution, Cache Behaviors
    DNS               → Route 53 Hosted Zone, A/CNAME Records
    SSL               → ACM Certificates (us-east-1 for CF, ap-south-1 for ALB)
    Security          → WAF Rules, Security Groups, NACLs
    Queues            → SQS Queues, SNS Topics, DLQs
    Secrets           → Secrets Manager entries (structure only)
    Registry          → ECR repos per service
    Observability     → CloudWatch Log Groups, Alarms, Dashboards
    ```
    
    **Remote State:**
    
    ```
    S3 bucket         → prajwalraj-terraform-state
    DynamoDB table    → prajwalraj-terraform-locks   (state locking)
    ```
    
    ---
    
    ## 2. 🌐 Networking — VPC Design
    
    ```
    VPC: 10.0.0.0/16  (ap-south-1 — Mumbai, primary region)
    
    Availability Zones: ap-south-1a, ap-south-1b, ap-south-1c
    
    Public Subnets (one per AZ):
    ├── 10.0.1.0/24   → ALB, NAT Gateway
    ├── 10.0.2.0/24
    └── 10.0.3.0/24
    
    Private Subnets (EKS nodes):
    ├── 10.0.11.0/24  → EKS worker nodes
    ├── 10.0.12.0/24
    └── 10.0.13.0/24
    
    Isolated Subnets (Data layer — no internet, ever):
    ├── 10.0.21.0/24  → RDS Aurora
    ├── 10.0.22.0/24
    └── 10.0.23.0/24
    
    NAT Gateway      → in each public subnet (HA)
    Internet Gateway → for public subnets
    VPC Endpoints    → S3, ECR, Secrets Manager (no traffic leaves AWS network)
    ```
    
    **Why VPC Endpoints?** ECR image pulls and Secrets Manager calls never leave the AWS network — faster, cheaper, more secure. This is a detail that shows production maturity.
    
    ---
    
    ## 3. ☸️ Kubernetes — EKS Deep Design
    
    ### Cluster Setup
    
    ```
    EKS Version       → 1.30 (latest stable)
    Managed Node Groups:
    ├── system-ng     → t3.medium x2   (system pods, ArgoCD, monitoring)
    ├── app-ng        → t3.large  x2   (your microservices) — auto-scaled
    └── ai-ng         → c5.xlarge x1   (AI service — compute heavy) — auto-scaled
    
    Cluster Autoscaler  → scales node groups based on pending pods
    IRSA               → IAM Roles for Service Accounts (no node-level AWS perms)
    EKS Add-ons:
    ├── CoreDNS
    ├── kube-proxy
    ├── VPC CNI
    ├── EBS CSI Driver  → for persistent volumes
    └── AWS Load Balancer Controller → manages ALB from K8s
    ```
    
    ### Namespaces
    
    ```
    namespaces:
    ├── portfolio          → all your app services
    ├── monitoring         → Prometheus, Grafana, Loki, Tempo
    ├── argocd             → GitOps controller
    ├── ingress-nginx      → Ingress controller
    ├── cert-manager       → TLS certificate automation
    └── external-secrets   → pulls from AWS Secrets Manager
    ```
    
    ### Per-Service K8s Resources
    
    Every single microservice gets this full set:
    
    ```yaml
    Deployment
    ├── 2 replicas minimum (never single point of failure)
    ├── Resource requests + limits defined
    ├── Liveness probe + Readiness probe + Startup probe
    ├── topologySpreadConstraints  → pods spread across AZs
    ├── PodAntiAffinity            → no 2 pods on same node
    └── securityContext            → non-root, read-only filesystem
    
    HorizontalPodAutoscaler (HPA)
    ├── min: 2, max: 10
    ├── CPU threshold: 70%
    └── Memory threshold: 80%
    
    PodDisruptionBudget (PDB)
    └── minAvailable: 1  → zero downtime during node drain
    
    ServiceAccount
    └── Annotated with IRSA role ARN
    
    ExternalSecret
    └── Syncs from AWS Secrets Manager → K8s Secret
    
    NetworkPolicy
    ├── Ingress: only from allowed services
    └── Egress: only to required services + DNS
    
    ServiceMonitor
    └── Prometheus scrape config
    ```
    
    ### Ingress Design
    
    ```
    internet → CloudFront → WAF → ALB → ingress-nginx → services
    
    Ingress rules:
    ├── prajwalraj.me          → frontend-service:3000
    ├── api.prajwalraj.me      → api-gateway-service:8000
    ├── ai.prajwalraj.me       → ai-service:8001
    ├── mcp.prajwalraj.me      → mcp-service:8002
    ├── grafana.prajwalraj.me  → grafana:3000
    └── argocd.prajwalraj.me   → argocd-server:443
    
    TLS → cert-manager + Let's Encrypt (auto-renewed)
    ```
    
    ---
    
    ## 4. 🔄 CI/CD — GitHub Actions + ArgoCD (GitOps)
    
    This is a **fully GitOps** setup. Nobody deploys manually. Ever.
    
    ### The Mental Model
    
    ```
    Code Change  →  GitHub Actions (CI)  →  ECR (image)
                         ↓
                 Updates Helm values.yaml (image tag)
                         ↓
                 ArgoCD detects drift  →  Syncs to EKS (CD)
    ```
    
    ### GitHub Actions Pipelines
    
    **PR Pipeline** (runs on every pull request):
    
    ```yaml
    jobs:
      lint:          → ESLint, Prettier, Ruff (Python)
      type-check:    → tsc --noEmit
      unit-tests:    → Jest, Pytest
      sast:          → Semgrep (static analysis)
      secret-scan:   → Gitleaks (no secrets in code)
      docker-build:  → build image (don't push, just validate)
      trivy-scan:    → scan Docker image for CVEs
    ```
    
    **Main Branch Pipeline** (runs on merge to main):
    
    ```yaml
    jobs:
      build-and-push:
        → Build Docker image
        → Tag with git SHA + semver
        → Push to ECR
        → Scan image with Trivy (fail if CRITICAL CVEs)
    
      update-helm-values:
        → Checkout infra repo
        → Update image tag in helm/values-prod.yaml
        → Commit + push → triggers ArgoCD
    
      notify:
        → Slack notification with deploy summary
    ```
    
    **Scheduled Pipelines:**
    
    ```yaml
    dependency-audit:   → weekly  → npm audit, pip-audit
    terraform-plan:     → daily   → detect infra drift
    performance-test:   → weekly  → k6 load test against staging
    ```
    
    ### ArgoCD Setup
    
    ```
    ArgoCD manages:
    ├── portfolio-app          → apps/ services
    ├── monitoring-stack       → Prometheus, Grafana, Loki, Tempo
    ├── ingress-nginx          → Ingress controller
    ├── cert-manager           → TLS automation
    ├── external-secrets       → Secrets operator
    └── cluster-autoscaler     → Node scaling
    
    Sync Policy:
    ├── Auto-sync: enabled
    ├── Self-heal: enabled       → if someone kubectl applies manually, ArgoCD reverts
    ├── Prune: enabled           → removes deleted resources
    └── Retry: 5 attempts with backoff
    
    App of Apps pattern:
    └── One root ArgoCD app manages all other ArgoCD apps
    ```
    
    ### Deployment Strategy
    
    ```
    frontend-service     → Blue/Green    (zero downtime, instant rollback)
    api-gateway          → Rolling       (gradual, resource efficient)
    ai-service           → Blue/Green    (heavy service, safe swap)
    contact-service      → Rolling
    analytics-service    → Rolling
    notification-service → Rolling
    ```
    
    ---
    
    ## 5. 📊 Observability — Full Production Stack
    
    ### The Three Pillars + One
    
    ```
    Metrics  → Prometheus + Grafana
    Logs     → Loki + Grafana
    Traces   → Tempo + Grafana
    Errors   → Sentry
    ```
    
    All unified in **Grafana** as single pane of glass.
    
    ### OpenTelemetry — Instrumentation
    
    ```
    Every service has:
    ├── OTel SDK (auto-instrumentation)
    ├── OTel Collector sidecar (or DaemonSet)
    └── Exports to:
        ├── Prometheus (metrics)
        ├── Loki (logs)
        └── Tempo (traces)
    
    What gets traced automatically:
    ├── Every HTTP request (duration, status, path)
    ├── Every DB query (duration, query, rows)
    ├── Every Redis call
    ├── Every external API call
    ├── Every AI LLM call (tokens, latency, model)
    └── Every SQS message
    ```
    
    ### Grafana Dashboards (Public)
    
    ```
    Dashboard 1 — System Overview
    ├── Total requests/sec across all services
    ├── P95 latency per service
    ├── Error rate %
    ├── Pod count per service
    └── Node CPU/Memory
    
    Dashboard 2 — AI Service
    ├── Chat queries per hour
    ├── RAG retrieval latency
    ├── LLM response latency
    ├── Token usage over time
    └── Tool call breakdown (which tools fire most)
    
    Dashboard 3 — Infrastructure
    ├── EKS node utilization
    ├── RDS connections + query latency
    ├── Redis hit/miss ratio
    ├── CloudFront cache hit ratio
    └── SQS queue depth
    
    Dashboard 4 — Business Metrics
    ├── Unique visitors per day
    ├── Chat sessions started
    ├── Meeting requests submitted
    ├── Testimonials submitted
    └── Geographic visitor distribution
    ```
    
    ### Alerting
    
    ```
    PagerDuty / Slack alerts for:
    ├── Error rate > 1% for 5 minutes
    ├── P95 latency > 2s for 5 minutes
    ├── Pod crash loop detected
    ├── RDS CPU > 80%
    ├── Redis memory > 85%
    ├── Certificate expiry < 30 days
    ├── Trivy scan finds CRITICAL CVE in prod image
    └── EKS node NotReady
    ```
    
    ---
    
    ## 6. 🔒 Security — Every Layer
    
    ### Image Security
    
    ```
    Dockerfile best practices:
    ├── Distroless or Alpine base images (minimal attack surface)
    ├── Non-root user in every container
    ├── No secrets in image layers
    ├── Multi-stage builds (no build tools in prod image)
    └── Read-only root filesystem
    
    Trivy scans:
    ├── In CI — blocks merge if CRITICAL CVEs
    ├── In ECR — continuous scanning on pushed images
    └── Weekly scheduled scan on running images
    ```
    
    ### K8s Security
    
    ```
    Pod Security Standards  → Restricted profile on all namespaces
    RBAC                    → Least privilege, no ClusterAdmin in prod
    Network Policies        → Default deny all, explicit allow rules
    Secrets                 → Never in Git, always from Secrets Manager
    IRSA                    → Per-service AWS IAM roles, minimal permissions
    Falco                   → Runtime threat detection (suspicious syscalls)
    ```
    
    ### AWS Security
    
    ```
    WAF Rules:
    ├── AWS Managed Rules (OWASP Top 10)
    ├── Rate limiting — 1000 req/5min per IP
    ├── Geo-blocking (optional)
    ├── AI endpoint — 50 req/hour per IP (cost protection)
    └── Block known bad IPs (AWS IP reputation list)
    
    IAM:
    ├── No IAM users in prod (IRSA only)
    ├── MFA on root account
    ├── AWS Organizations + SCPs
    └── CloudTrail — all API calls logged
    
    GuardDuty  → threat detection on AWS account level
    Security Hub → unified security findings dashboard
    ```
    
    ---
    
    ## 7. 🧪 Testing in DevOps Pipeline
    
    ```
    Unit Tests         → Jest (TS), Pytest (Python)        → on every PR
    Integration Tests  → Supertest API tests               → on every PR
    E2E Tests          → Playwright                        → on merge to main
    Load Tests         → k6                                → weekly on staging
    Chaos Tests        → LitmusChaos (pod kill, node drain)→ monthly on staging
    Smoke Tests        → Post-deploy health checks         → after every deploy
    ```
    
    **k6 Load Test targets:**
    
    ```jsx
    scenarios: {
      normal_load:  { vus: 50,  duration: '5m'  },
      spike:        { vus: 500, duration: '1m'  },
      soak:         { vus: 20,  duration: '2h'  }
    }
    thresholds: {
      http_req_duration: ['p95<500'],
      http_req_failed:   ['rate<0.01']
    }
    ```
    
    ---
    
    ## 8. 💾 Backup & Disaster Recovery
    
    ```
    RDS Aurora:
    ├── Automated backups → 7 day retention
    ├── Point-in-time recovery (PITR)
    ├── Cross-region snapshot → us-east-1
    └── Backup tested monthly (automated restore + verify)
    
    S3:
    ├── Versioning enabled
    ├── Cross-region replication → us-east-1
    └── Lifecycle policy → Glacier after 90 days
    
    Terraform State:
    ├── S3 versioning → every state version retained
    └── DynamoDB locking → no concurrent applies
    
    RTO: 1 hour  |  RPO: 1 hour
    ```
    
    ---
    
    ## 9. 💰 Cost Management
    
    ```
    AWS Cost Explorer    → tagged resources, per-service cost breakdown
    Resource Tagging:
    ├── Project: prajwalraj-portfolio
    ├── Environment: prod/staging
    ├── Service: frontend/ai/api/...
    └── ManagedBy: terraform
    
    Cost optimizations:
    ├── Spot Instances for non-AI node groups (60-70% cheaper)
    ├── S3 Intelligent-Tiering for assets
    ├── CloudFront caching (reduce origin hits)
    ├── Reserved Instance for RDS (1yr) once stable
    └── Budget Alert → SNS → email if spend > $150/month
    ```
    
    ---
    
    ## DevOps Stack Summary
    
    | Area | Technology |
    | --- | --- |
    | IaC | Terraform + Terragrunt |
    | Orchestration | EKS (Kubernetes 1.30) |
    | GitOps | ArgoCD |
    | CI/CD | GitHub Actions |
    | Container Registry | AWS ECR |
    | Ingress | ingress-nginx + AWS ALB Controller |
    | TLS | cert-manager + Let's Encrypt |
    | Secrets | AWS Secrets Manager + External Secrets Operator |
    | Metrics | Prometheus + Grafana |
    | Logs | Loki + Grafana |
    | Traces | Tempo + Grafana |
    | Instrumentation | OpenTelemetry |
    | Error Tracking | Sentry |
    | Security Scanning | Trivy + Semgrep + Gitleaks |
    | Runtime Security | Falco |
    | Load Testing | k6 |
    | Chaos Testing | LitmusChaos |
    | Cost Management | AWS Cost Explorer + Budget Alerts |
    | Threat Detection | AWS GuardDuty + Security Hub |
    
    ---
    
    This DevOps setup alone — if someone walks through your GitHub repo — tells a complete story of someone who has **built and operated production systems at scale.**
    
    Shall we now lock the full final architecture across Frontend + Backend + AI + DevOps and then start building Phase 1?
    

Me:

```yaml
Ok I got it.

I have some more little things to clear

So wer are going with microservices architecture right??

---

Next:

So like we build Frontend, Backend , AI 

then how does the DevOps starts here

I was to know steps - Just to get more clarity

Like first we build Image for three & then .... all  ( I just gave you an example )

i want to know full setup & steps we are taking.

---

Offcourse we are going to build AI seperately - in python - right or not ? I am wrong ? I am confused.

THe UI might be in Nextj & bckend might be in Nodejs (--- as we are going with sepreate - I am confused - its correct right ?
```

- Reply
    
    ---
    
    Great questions. Let me clear all the confusion properly.
    
    ---
    
    ## ✅ Yes — Microservices, Separate Languages, Separate Repos/Apps
    
    You are **100% correct** on all counts. Let me confirm everything cleanly.
    
    ---
    
    ## 1. What We're Building & In What Language
    
    ```
    Service                 Language/Framework      Why
    ─────────────────────────────────────────────────────────────
    frontend-service        Next.js (TypeScript)    UI, SSR, SSG
    api-gateway-service     Node.js + Fastify       Central routing, auth
    ai-service              Python + FastAPI         LangGraph, RAG, LLM
    contact-service         Node.js + Fastify       Form handling, SQS
    analytics-service       Node.js + Fastify       Visitor events
    notification-service    Node.js + Fastify       SQS consumer, emails
    ```
    
    Each one is a **completely separate application** — its own folder, its own Dockerfile, its own dependencies, its own deployment. They talk to each other over HTTP/REST internally.
    
    ---
    
    ## 2. How DevOps Connects — The Full Step-by-Step
    
    This is the key thing to understand. DevOps doesn't start "after" you build — it's woven in from Day 1. Here's the complete flow:
    
    ---
    
    ### 🔵 Phase 1 — Foundation (Do this FIRST, before writing app code)
    
    ```
    Step 1: Write Terraform code
            → VPC, Subnets, EKS Cluster, RDS, Redis,
              S3, ECR repos, Route53, CloudFront, WAF
            → All infra defined as code
    
    Step 2: Apply Terraform
            → Your real AWS infrastructure is created
            → You now have a real EKS cluster running
            → You have ECR repos ready to receive images
            → You have a real domain pointing to CloudFront
    
    Step 3: Bootstrap EKS
            → Install ArgoCD into the cluster
            → Install ingress-nginx
            → Install cert-manager
            → Install external-secrets operator
            → Install Prometheus + Grafana + Loki + Tempo
            → Now your cluster is production-ready
    ```
    
    ---
    
    ### 🟡 Phase 2 — Build Applications (Write your actual code)
    
    ```
    Step 4: Write application code
            → Next.js frontend (apps/web/)
            → Node.js api-gateway (apps/api-gateway/)
            → Python ai-service (apps/ai-service/)
            → etc.
    
    Step 5: Write Dockerfile for each service
            → apps/web/Dockerfile
            → apps/api-gateway/Dockerfile
            → apps/ai-service/Dockerfile
            → Each service containerized independently
    ```
    
    ---
    
    ### 🟠 Phase 3 — Connect Apps to DevOps Pipeline
    
    ```
    Step 6: Write GitHub Actions CI pipeline
            → On every PR:
               lint → test → build Docker image → scan with Trivy
            → On merge to main:
               build image → push to ECR → update Helm values
    
    Step 7: Write Helm Charts for each service
            → infrastructure/helm/frontend/
            → infrastructure/helm/api-gateway/
            → infrastructure/helm/ai-service/
            → Helm chart = K8s Deployment + Service + HPA +
                           Ingress + NetworkPolicy + etc.
    
    Step 8: Create ArgoCD Application definitions
            → Tell ArgoCD: "watch this Helm chart,
              deploy it to this namespace on EKS"
            → ArgoCD now owns all deployments
    ```
    
    ---
    
    ### 🟢 Phase 4 — The Automated Flow (This runs forever after)
    
    ```
    You write code
          ↓
    Git push → opens PR
          ↓
    GitHub Actions runs automatically:
      → lint ✅
      → tests ✅
      → docker build ✅
      → trivy scan ✅
          ↓
    PR merged to main
          ↓
    GitHub Actions runs automatically:
      → builds Docker image
      → tags it (e.g. ai-service:a3f9d12)
      → pushes to ECR
      → updates helm/values-prod.yaml:
          image.tag: a3f9d12   ← this is just a file change
      → commits that change to repo
          ↓
    ArgoCD detects the file changed
          ↓
    ArgoCD pulls new image from ECR
          ↓
    ArgoCD deploys to EKS (rolling/blue-green)
          ↓
    New pods come up, old pods go down
          ↓
    Slack notification → "ai-service deployed ✅"
    ```
    
    **You never manually deploy anything. Ever. Git push is the only action you take.**
    
    ---
    
    ### 🔴 Phase 5 — How Each Service Lives in K8s
    
    Once deployed, this is what exists in your EKS cluster per service:
    
    ```
    EKS Cluster
    └── namespace: portfolio
        ├── frontend-service
        │   ├── Deployment (2 pods minimum, auto-scales to 10)
        │   ├── Service (ClusterIP — internal only)
        │   ├── Ingress (prajwalraj.me → this service)
        │   └── HPA (scales on CPU/Memory)
        │
        ├── api-gateway-service
        │   ├── Deployment (2 pods minimum)
        │   ├── Service (ClusterIP)
        │   ├── Ingress (api.prajwalraj.me → this service)
        │   └── HPA
        │
        ├── ai-service
        │   ├── Deployment (2 pods minimum, c5.xlarge nodes)
        │   ├── Service (ClusterIP)
        │   ├── Ingress (ai.prajwalraj.me → this service)
        │   └── HPA
        │
        └── ... other services
    ```
    
    ---
    
    ## 3. How Services Talk to Each Other
    
    ```
    Browser
      → prajwalraj.me          (hits frontend-service)
    
    User types in AI chat
      → frontend-service
      → calls api.prajwalraj.me/ai/chat
      → api-gateway-service receives it
      → validates auth + rate limit
      → forwards to ai-service (internally: http://ai-service:8001)
      → ai-service runs LangGraph agent
      → streams response back → api-gateway → frontend → browser
    
    User submits contact form
      → frontend-service
      → calls api.prajwalraj.me/contact
      → api-gateway-service
      → contact-service (internally: http://contact-service:8002)
      → contact-service pushes to SQS
      → notification-service (SQS consumer) picks it up
      → sends email via SendGrid
    ```
    
    ---
    
    ## 4. The Complete Picture in One Diagram
    
    ```
    ─────────────────────────────────────────────────────────
                        DEVELOPER WORKFLOW
    ─────────────────────────────────────────────────────────
    
      Write Code → Git Push → PR → GitHub Actions CI
                                        ↓
                  Lint, Test, Build, Scan, Validate
                                        ↓
                             Merge to main
                                        ↓
                  GitHub Actions builds Docker images
                  for whichever service changed
                                        ↓
                  Images pushed to AWS ECR
                                        ↓
                  Helm values updated (image tag)
                                        ↓
                  ArgoCD syncs → EKS deploys
                                        ↓
    ─────────────────────────────────────────────────────────
                        LIVE IN PRODUCTION
    ─────────────────────────────────────────────────────────
    
      Browser
        ↓
      Route53 → CloudFront → WAF → ALB
        ↓
      ingress-nginx (EKS)
        ↓
      ┌─────────────────────────────────────┐
      │  EKS Cluster                        │
      │  ├── frontend-service  (Next.js)    │
      │  ├── api-gateway       (Node.js)    │
      │  ├── ai-service        (Python)     │
      │  ├── contact-service   (Node.js)    │
      │  └── notification-svc  (Node.js)    │
      └─────────────────────────────────────┘
        ↓
      ┌─────────────────────────────────────┐
      │  Data Layer                         │
      │  ├── Aurora PostgreSQL              │
      │  ├── ElastiCache Redis              │
      │  ├── S3                             │
      │  ├── Pinecone (vector)              │
      │  └── SQS                           │
      └─────────────────────────────────────┘
        ↓
      ┌─────────────────────────────────────┐
      │  Observability                      │
      │  ├── Prometheus (metrics)           │
      │  ├── Grafana (dashboards)           │
      │  ├── Loki (logs)                    │
      │  ├── Tempo (traces)                 │
      │  └── Sentry (errors)               │
      └─────────────────────────────────────┘
    ```
    
    ---
    
    ## In Short — Answers to Your Confusion
    
    | Question | Answer |
    | --- | --- |
    | Microservices? | Yes — each service fully separate |
    | AI in Python? | Yes — Python + FastAPI + LangGraph |
    | Frontend in Next.js? | Yes — completely separate app |
    | Backend in Node.js? | Yes — api-gateway + other services |
    | Do they share code? | Only shared TypeScript types via monorepo packages/ |
    | When does DevOps start? | Day 1 — Terraform first, then apps |
    | Who deploys to K8s? | ArgoCD — never you manually |
    | How does a deploy happen? | Git push → GitHub Actions → ECR → ArgoCD → EKS |
    
    ---
    
    Are you clear now? If yes — **shall we lock the final architecture and start Phase 1 hands-on?** We'll begin with the monorepo setup + Terraform for VPC and EKS.
    

Me:

```yaml
Yes I am fully clear now.
```

- Reply
    
    ---
    
    Perfect. Let's lock it.
    
    ---
    
    ## 🔒 Final Locked Architecture — `prajwalraj.me`
    
    ---
    
    ### Services
    
    ```
    frontend-service        Next.js 15 + TypeScript
    api-gateway-service     Node.js + Fastify
    ai-service              Python + FastAPI + LangGraph
    contact-service         Node.js + Fastify
    analytics-service       Node.js + Fastify
    notification-service    Node.js + Fastify
    ```
    
    ### AI Layer
    
    ```
    RAG                     Pinecone + OpenAI Embeddings
    Agent Framework         LangGraph (ReAct)
    LLM                     Claude (Anthropic) / GPT-4
    Tools                   RAG, GitHub API, Portfolio API,
                            Calendar, Lead Capture, Email, Slack
    MCP Server              Public → mcp.prajwalraj.me
    MCP Client              User enters remote MCP credentials
    ```
    
    ### Infrastructure
    
    ```
    Cloud                   AWS (ap-south-1 — Mumbai)
    IaC                     Terraform + Terragrunt
    Orchestration           EKS (Kubernetes 1.30)
    GitOps                  ArgoCD
    CI/CD                   GitHub Actions
    Registry                AWS ECR
    ```
    
    ### Data
    
    ```
    Primary DB              Aurora PostgreSQL
    Cache                   ElastiCache Redis
    Storage                 S3
    Vector DB               Pinecone
    Queue                   SQS + SNS
    ```
    
    ### Observability
    
    ```
    Metrics                 Prometheus + Grafana
    Logs                    Loki
    Traces                  Tempo
    Errors                  Sentry
    Instrumentation         OpenTelemetry
    ```
    
    ### Security
    
    ```
    Edge                    WAF + CloudFront
    Network                 VPC, Private Subnets, Network Policies
    Secrets                 AWS Secrets Manager + External Secrets Operator
    Auth                    NextAuth.js + JWT
    Scanning                Trivy + Semgrep + Gitleaks + Falco
    ```
    
    ### Auth / Access
    
    ```
    Guest                   5 AI messages/day (Redis rate limit by IP)
    Logged in               Unlimited chat, MCP client, history saved
    OAuth                   Google + GitHub
    ```
    
    ### Subdomains
    
    ```
    prajwalraj.me           Frontend
    api.prajwalraj.me       API Gateway
    ai.prajwalraj.me        AI Service
    mcp.prajwalraj.me       Public MCP Server
    grafana.prajwalraj.me   Live Observability (public read)
    argocd.prajwalraj.me    ArgoCD UI
    staging.prajwalraj.me   Staging Environment
    ```
    
    ---
    
    ## ✅ Architecture is Locked.
    
    ---
    
    Now — **Phase 1 starts here.**
    
    Here's exactly what we build first, in order:
    
    ```
    Step 1    Monorepo scaffold (Turborepo + pnpm workspaces)
    Step 2    Terraform — VPC, Subnets, NAT, IGW
    Step 3    Terraform — EKS Cluster + Node Groups
    Step 4    Terraform — ECR repos (one per service)
    Step 5    Terraform — S3 + DynamoDB (remote state)
    Step 6    Bootstrap EKS — ArgoCD, ingress-nginx, cert-manager
    Step 7    First GitHub Actions pipeline (CI skeleton)
    Step 8    Next.js app skeleton — deployed end to end
    ```
    
    **Ready to write the first line of code?**
    
    Type **"Start"** and we go — beginning with the monorepo structure and Turborepo setup.
    

Me:

```yaml
How much will it cost - 

what are the various factors this depends on ?
```

- Reply
    
    ---
    
    Great question to ask before diving in. Let me break it down honestly and completely.
    
    ---
    
    ## 💰 AWS Cost Breakdown — `prajwalraj.me`
    
    ---
    
    ### 1. 🖥️ EKS — Biggest Cost Driver
    
    ```
    EKS Cluster Control Plane
    └── $0.10/hour = ~$73/month (flat, always)
    
    Node Groups (EC2 instances):
    
    system-ng (t3.medium x2 — ArgoCD, monitoring)
    └── t3.medium = $0.0416/hr x2 = ~$60/month
    
    app-ng (t3.large x2 — your microservices)
    └── t3.large = $0.0832/hr x2 = ~$120/month
    
    ai-ng (c5.xlarge x1 — AI service)
    └── c5.xlarge = $0.17/hr x1 = ~$122/month
    
    EKS Subtotal → ~$375/month
    ```
    
    ---
    
    ### 2. 🗄️ Database — Second Biggest
    
    ```
    Aurora PostgreSQL
    └── db.t3.medium (smallest Aurora instance)
       = $0.073/hr = ~$53/month
    └── Storage = $0.10/GB/month (~$5 initially)
    
    ElastiCache Redis
    └── cache.t3.micro = $0.017/hr = ~$12/month
    
    Database Subtotal → ~$70/month
    ```
    
    ---
    
    ### 3. 🌐 Networking
    
    ```
    NAT Gateway
    └── $0.045/hr x2 AZs = ~$65/month
    └── + $0.045/GB data processed (~$5-10/month)
    
    ALB (Application Load Balancer)
    └── ~$16/month base + LCU charges (~$5)
    
    VPC Endpoints (S3, ECR, Secrets Manager)
    └── ~$15/month
    
    Networking Subtotal → ~$100/month
    ```
    
    ---
    
    ### 4. 📦 Storage & CDN
    
    ```
    S3
    └── $0.023/GB = ~$5/month initially
    
    CloudFront
    └── 1TB free/month on free tier
    └── After that $0.0085/GB = ~$5-10/month
    
    ECR
    └── $0.10/GB/month storage = ~$5/month
    
    Storage + CDN Subtotal → ~$20/month
    ```
    
    ---
    
    ### 5. 🔒 Security & Monitoring
    
    ```
    WAF
    └── $5/month + $1/million requests = ~$8/month
    
    GuardDuty
    └── ~$10-15/month
    
    CloudWatch
    └── Logs + metrics = ~$15/month
    
    Security + Monitoring Subtotal → ~$38/month
    ```
    
    ---
    
    ### 6. 🤖 AI — Usage Based (Unpredictable)
    
    ```
    OpenAI / Anthropic API
    └── Depends entirely on chat volume
    └── Claude Sonnet → ~$3/million input tokens
    └── 1000 chat sessions/month → ~$10-20/month
    └── Can spike if viral — ALWAYS set spend limits
    
    Pinecone
    └── Free tier → 1 index, 100K vectors → $0
    └── Paid starts at $70/month (not needed initially)
    └── Use pgvector on Aurora instead → $0 extra
    
    AI Subtotal → ~$10-20/month (with limits set)
    ```
    
    ---
    
    ### 7. 📧 Third Party Services
    
    ```
    SendGrid (emails)        → Free tier (100/day) → $0
    Sentry (error tracking)  → Free tier → $0
    Better Stack (uptime)    → Free tier → $0
    GitHub Actions           → Free tier (public repo) → $0
    
    Third Party Subtotal → $0 (on free tiers)
    ```
    
    ---
    
    ## 📊 Total Monthly Estimate
    
    | Scenario | Cost | When |
    | --- | --- | --- |
    | **Minimum (staging only)** | ~$80/month | Just VPC + small EKS + RDS |
    | **Lean Prod** | ~$300/month | Spot instances, single AZ, minimal nodes |
    | **Full Prod (as designed)** | ~$600/month | Everything, multi-AZ, all services |
    | **Optimized Prod** | ~$350/month | Spot + reserved + right-sized |
    
    ---
    
    ## 🎯 The Factors This Depends On
    
    ### Factor 1 — Node Instance Types + Spot vs On-Demand
    
    ```
    On-Demand c5.xlarge    = $0.17/hr
    Spot c5.xlarge         = ~$0.05/hr   (70% cheaper)
    
    Using Spot for app-ng + ai-ng → saves ~$150/month
    Risk: pods can be evicted (fine for stateless services)
    ```
    
    ### Factor 2 — Number of AZs
    
    ```
    2 AZs instead of 3    → saves 1 NAT Gateway = ~$50/month
    Single AZ             → saves ~$100/month but loses HA
    ```
    
    ### Factor 3 — RDS Instance Size
    
    ```
    db.t3.medium          → $53/month
    db.t3.small           → $26/month   (fine for portfolio traffic)
    ```
    
    ### Factor 4 — NAT Gateway
    
    ```
    NAT Gateway is expensive (~$65/month)
    Alternative: NAT Instance (t3.nano) → ~$4/month
    Trade-off: less managed, needs maintenance
    ```
    
    ### Factor 5 — AI API Usage
    
    ```
    No rate limiting      → can get expensive fast if traffic spikes
    With Redis rate limit → predictable, capped cost
    Always set hard spend limits on OpenAI/Anthropic
    ```
    
    ### Factor 6 — Traffic Volume
    
    ```
    Low traffic portfolio → CloudFront serves cached content
                         → origin barely gets hit → low cost
    High traffic spike   → CloudFront absorbs it
                         → still low origin cost
    ```
    
    ### Factor 7 — Staging Environment
    
    ```
    Full staging = almost double the cost
    Lean staging = share EKS cluster, separate namespace
                 = near zero extra cost
    ```
    
    ---
    
    ## 🧠 My Recommendation — Phased Cost Approach
    
    ```
    Month 1-2 (Building phase)
    → Only provision: VPC + small EKS + RDS + Redis
    → Run staging only
    → Cost: ~$150/month
    → Use this to build and test everything
    
    Month 3 (Go Live)
    → Full prod setup with Spot instances
    → Lean staging in same cluster (separate namespace)
    → Cost: ~$300-350/month
    
    Month 6+ (Optimized)
    → Reserve RDS 1yr → saves 30%
    → Spot instances fully tuned
    → Cost: ~$250/month
    ```
    
    ---
    
    ## 💡 Cost Optimization Tricks Built Into Our Design
    
    ```
    ✅ Spot instances for app + ai node groups
    ✅ VPC Endpoints (avoid NAT Gateway charges for ECR/S3)
    ✅ CloudFront caching (reduce ALB + origin hits)
    ✅ pgvector instead of Pinecone (saves $70/month)
    ✅ Shared EKS cluster for staging + prod (namespaces)
    ✅ S3 Intelligent-Tiering for assets
    ✅ Budget alerts → SNS → email at $200 threshold
    ✅ AI rate limiting → Redis → prevents runaway API costs
    ```
    
    ---
    
    ## Bottom Line
    
    |  |  |
    | --- | --- |
    | **Minimum to start** | ~$150/month |
    | **Full production** | ~$300-400/month (optimized) |
    | **Biggest cost drivers** | EKS nodes + NAT Gateway + RDS |
    | **Biggest variable** | AI API usage |
    | **Biggest saving lever** | Spot instances + NAT Instance |
    
    For a portfolio demonstrating **production-grade engineering**, $300/month is genuinely reasonable. And every dollar spent is visible in your architecture — which is the whole point.
    
    ---
    
    Ready to start building? Type **"Start"** and we go with Phase 1.
    

Me:

```yaml
How are ensuring scalibility & reliability & rate limittin & safe from any attack - like that of dddos etc etc
```

- Reply
    
    ---
    
    Great question. Let me go through each pillar completely.
    
    ---
    
    ## 🔄 1. Scalability — Every Layer Scales
    
    ---
    
    ### Kubernetes — Horizontal Pod Autoscaler (HPA)
    
    ```
    Every service scales automatically based on load:
    
    frontend-service
    ├── min pods: 2
    ├── max pods: 10
    ├── scale up when: CPU > 70% OR Memory > 80%
    └── scale down: after 5 min of low load (cooldown)
    
    ai-service (most important to scale)
    ├── min pods: 2
    ├── max pods: 8
    ├── scale up when: CPU > 60% (lower threshold — heavy workload)
    └── Custom metric: active LLM requests > 5 per pod
    
    api-gateway
    ├── min pods: 2
    ├── max pods: 10
    └── scale up when: CPU > 70% OR RPS > 1000/pod
    ```
    
    ### Kubernetes — Cluster Autoscaler (Node Level)
    
    ```
    When pods can't be scheduled (not enough nodes):
        ↓
    Cluster Autoscaler detects pending pods
        ↓
    Adds new EC2 node to node group
        ↓
    Pending pods get scheduled
        ↓
    New node joins cluster in ~2-3 minutes
    
    When nodes are underutilized:
        ↓
    Cluster Autoscaler drains + terminates node
        ↓
    Saves cost automatically
    ```
    
    ### KEDA — Event Driven Autoscaling
    
    ```
    For notification-service (SQS consumer):
    
    Normal HPA scales on CPU — wrong metric for queue consumers
    KEDA scales on SQS queue depth instead:
    
    ├── 0 messages in queue  → scale to 0 pods (saves money)
    ├── 100 messages         → scale to 2 pods
    ├── 1000 messages        → scale to 10 pods
    └── Queue drains         → scale back to 0
    ```
    
    ### Database Scalability
    
    ```
    Aurora PostgreSQL:
    ├── Writer instance      → handles all writes
    ├── Reader instance(s)   → handles all reads (auto-scaled)
    ├── Auto-scales storage  → no manual intervention ever
    └── Aurora Serverless v2 → scales compute 0.5 to 64 ACUs
                               pays per second of use
    
    Redis (ElastiCache):
    ├── Cluster mode         → sharding across nodes
    ├── Read replicas        → read scaling
    └── Connection pooling   → PgBouncer in front of RDS
    ```
    
    ### CloudFront — Edge Scalability
    
    ```
    Cache hit → request NEVER reaches your backend
             → serves from 400+ edge locations globally
             → handles any traffic spike automatically
             → infinite scale at the edge layer
    
    Cache hit ratio target: > 85%
    What gets cached:
    ├── All static assets (JS, CSS, images) → 1 year TTL
    ├── SSG pages                           → 24 hour TTL
    ├── API responses (projects, skills)    → 5 min TTL
    └── AI chat                             → never cached (streaming)
    ```
    
    ---
    
    ## 🛡️ 2. Reliability — Nothing is a Single Point of Failure
    
    ---
    
    ### Multi-AZ Everything
    
    ```
    Component              AZs     What happens if one AZ dies
    ──────────────────────────────────────────────────────────
    EKS nodes              3       pods reschedule to healthy AZs
    ALB                    3       routes around failed AZ
    Aurora PostgreSQL       2       automatic failover < 30 seconds
    ElastiCache Redis       2       replica promotes automatically
    NAT Gateway            2       routes switch automatically
    ```
    
    ### Pod Anti-Affinity — Never 2 Pods on Same Node
    
    ```yaml
    topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: kubernetes.io/hostname
        whenUnsatisfiable: DoNotSchedule
    
    # Result: pods spread across different nodes + AZs
    # If one node dies → only 1 pod lost → HPA replaces it
    # Service stays up throughout
    ```
    
    ### PodDisruptionBudget — Zero Downtime Deploys
    
    ```yaml
    PodDisruptionBudget:
      minAvailable: 1
    
    # During rolling deploy or node drain:
    # K8s guarantees at least 1 pod always running
    # New pod comes up → old pod goes down
    # Zero downtime, zero dropped requests
    ```
    
    ### Health Probes — K8s Knows Exactly When a Pod is Unhealthy
    
    ```yaml
    livenessProbe:          # Is the pod alive? Kill + restart if not
      httpGet: /health
      failureThreshold: 3
      periodSeconds: 10
    
    readinessProbe:         # Is the pod ready for traffic? Remove from
      httpGet: /ready       # load balancer if not
      failureThreshold: 2
      periodSeconds: 5
    
    startupProbe:           # Give pod time to start before liveness kicks in
      httpGet: /health      # Important for ai-service (slow to start)
      failureThreshold: 30
      periodSeconds: 10
    ```
    
    ### Circuit Breaker — Stops Cascade Failures
    
    ```
    Scenario without circuit breaker:
    ai-service is slow
        ↓
    api-gateway keeps calling it
        ↓
    api-gateway threads pile up waiting
        ↓
    api-gateway becomes slow
        ↓
    frontend times out
        ↓
    Everything is down ❌
    
    Scenario with circuit breaker:
    ai-service is slow
        ↓
    Circuit breaker detects: 5 failures in 10 seconds
        ↓
    Circuit OPENS → api-gateway stops calling ai-service
        ↓
    Returns fallback response immediately
        ↓
    After 30 seconds → circuit HALF-OPENS → tries again
        ↓
    ai-service recovered → circuit CLOSES → normal flow ✅
    
    Implementation: Resilience4j (Node.js) / Tenacity (Python)
    ```
    
    ### Retry with Exponential Backoff
    
    ```
    Request fails
        ↓
    Wait 1 second  → retry
        ↓
    Fails again
        ↓
    Wait 2 seconds → retry
        ↓
    Fails again
        ↓
    Wait 4 seconds → retry
        ↓
    Fails again    → return error to user
    
    Jitter added to prevent thundering herd:
    wait = (2^attempt * 1000) + random(0, 1000) ms
    ```
    
    ### ArgoCD — Self Healing
    
    ```
    Someone accidentally kubectl deletes a deployment
        ↓
    ArgoCD detects drift from Git (within 3 minutes)
        ↓
    ArgoCD reapplies the correct state from Git
        ↓
    Deployment restored automatically
    
    Git is always the source of truth.
    Production can never drift from what's in Git.
    ```
    
    ### SQS — Reliability for Async Flows
    
    ```
    contact-service receives form submission
        ↓
    Pushes to SQS (durable, replicated across 3 AZs)
        ↓
    Returns 200 to user immediately
        ↓
    notification-service picks up message
        ↓
    If notification-service crashes mid-processing:
        → message becomes visible again after 30 seconds
        → another pod picks it up
        → processed exactly once
    
    Dead Letter Queue (DLQ):
        → after 3 failed attempts → message goes to DLQ
        → you get alerted → investigate manually
        → no message ever lost
    ```
    
    ---
    
    ## ⚡ 3. Rate Limiting — Multiple Layers
    
    ---
    
    ### Layer 1 — WAF (Edge, Before Traffic Hits Your Cluster)
    
    ```
    Rules:
    ├── 1000 requests / 5 minutes per IP          (general)
    ├── 50 requests / hour per IP on /ai/*        (AI endpoints)
    ├── 10 requests / minute per IP on /auth/*    (auth endpoints)
    ├── Block if > 3 failed login attempts        (brute force)
    └── AWS IP Reputation List                    (known bad actors)
    
    Breach → request dropped at CloudFront edge
           → never reaches your cluster
           → zero load on your backend
    ```
    
    ### Layer 2 — API Gateway (Redis Rate Limiting)
    
    ```
    For Guest users (not logged in):
    ├── 5 AI chat messages / day     (by IP)
    ├── 100 API requests / hour      (by IP)
    └── 3 contact form submissions / day (by IP)
    
    For Logged in users:
    ├── Unlimited chat
    ├── 500 API requests / hour      (by user ID)
    └── MCP client access
    
    Implementation with Redis:
    ──────────────────────────
    Key: rate:chat:guest:{ip}:{date}
    TTL: 24 hours
    Value: incremented on each request
    
    if redis.incr(key) > 5:
        return 429 Too Many Requests
            + Retry-After header
            + "Sign in for unlimited access" message
    ```
    
    ### Layer 3 — AI Service (Token Budget Per Session)
    
    ```
    Per chat session:
    ├── Max 10 tool calls per query      (prevents agent loops)
    ├── Max 2000 tokens per response     (controls cost)
    ├── Max 20 messages per session      (guest)
    └── Request timeout: 30 seconds      (no hanging requests)
    
    Per day globally:
    ├── Budget alert if LLM spend > $10/day
    └── Hard cutoff if spend > $20/day   (emergency brake)
    ```
    
    ### Layer 4 — Ingress Nginx (Cluster Level)
    
    ```
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=ai:10m  rate=2r/s;
    
    # Per endpoint:
    /api/*    → 30 requests/second per IP
    /ai/*     → 2 requests/second per IP
    /auth/*   → 5 requests/second per IP
    ```
    
    ---
    
    ## 🔒 4. DDoS & Attack Protection — Defense in Depth
    
    ---
    
    ### The Defense Layers (Attacker has to break ALL of these)
    
    ```
    Internet
        ↓
    Layer 1: AWS Shield Standard (free, always on)
             → Protects against volumetric DDoS
             → SYN floods, UDP reflection, DNS amplification
             → AWS absorbs it at their network edge
        ↓
    Layer 2: CloudFront
             → Absorbs traffic spikes at 400+ edge PoPs globally
             → Attacker traffic is distributed, diluted
             → Your origin (ALB) is completely hidden
             → ALB IP is never public — only CloudFront can reach it
        ↓
    Layer 3: WAF (Web Application Firewall)
             → OWASP Top 10 managed rule group
             → SQL Injection detection + block
             → XSS detection + block
             → Rate limiting per IP
             → Bad bot detection
             → IP reputation blocking
        ↓
    Layer 4: ALB (Application Load Balancer)
             → Connection limits
             → SSL termination (no SSL processing load on pods)
             → Only accepts traffic from CloudFront IPs
                 (custom header X-CloudFront-Secret validated)
        ↓
    Layer 5: ingress-nginx
             → Request size limits (no huge payloads)
             → Connection timeouts
             → Rate limiting (nginx level)
        ↓
    Layer 6: Network Policies (K8s)
             → Service to service whitelist only
             → ai-service only reachable from api-gateway
             → DB only reachable from app pods
             → Complete east-west traffic control
        ↓
    Layer 7: VPC Security Groups
             → EKS nodes: only from ALB
             → RDS: only from EKS nodes
             → Redis: only from EKS nodes
             → No service directly exposed to internet
    ```
    
    ### OWASP Top 10 — What WAF Blocks
    
    ```
    SQL Injection         → blocked at WAF + parameterized queries in code
    XSS                   → blocked at WAF + CSP headers + React escaping
    CSRF                  → CSRF tokens on all state-changing requests
    Broken Auth           → JWT validation + refresh token rotation
    Security Misconfig    → Terraform enforces correct config always
    Sensitive Data        → never in logs, never in URLs, encrypted at rest
    XXE                   → disabled XML parsers
    Insecure Deserialize  → input validation on all endpoints
    Known Vulnerabilities → Trivy scans images, Dependabot on deps
    Logging/Monitoring    → full OTel + CloudTrail + GuardDuty
    ```
    
    ### Secrets — Zero Secret Sprawl
    
    ```
    ❌ Never:
    ├── Secrets in code
    ├── Secrets in environment variables baked into images
    ├── Secrets in Git (Gitleaks blocks this in CI)
    └── IAM user access keys anywhere
    
    ✅ Always:
    ├── Secrets in AWS Secrets Manager
    ├── External Secrets Operator pulls into K8s Secrets
    ├── Pods access via mounted volume (not env vars)
    ├── IRSA — pod gets AWS permissions via K8s ServiceAccount
    └── Secrets rotated automatically (RDS, Redis)
    ```
    
    ### Falco — Runtime Threat Detection
    
    ```
    Falco watches every syscall in your cluster in real time.
    
    Alerts you immediately if:
    ├── A process spawns a shell inside a container
    │   (someone got RCE — remote code execution)
    ├── A container reads /etc/passwd or /etc/shadow
    ├── A container makes unexpected outbound connections
    ├── A container writes to unexpected filesystem paths
    ├── kubectl exec used in production
    └── Any privilege escalation attempt
    
    Alert → Slack notification within seconds
    ```
    
    ### GuardDuty — AWS Account Level Threat Detection
    
    ```
    Monitors:
    ├── CloudTrail logs     → unusual API calls
    ├── VPC Flow logs       → unusual network patterns
    ├── DNS logs            → connections to known malicious domains
    
    Detects:
    ├── Cryptocurrency mining on your EC2/EKS nodes
    ├── Credential compromise (someone using your AWS keys)
    ├── Port scanning from your instances
    ├── Communication with known C2 (command & control) servers
    └── Unusual data exfiltration patterns
    ```
    
    ---
    
    ## 5. 📊 How It All Looks Under Attack
    
    ```
    Scenario: Someone launches a DDoS at prajwalraj.me
    
    1000 req/sec hitting CloudFront
        ↓
    CloudFront serves cached content from edge
    → 850 req/sec never reach your origin (cache hits)
    → 150 req/sec forwarded to ALB
        ↓
    WAF evaluates the 150 req/sec
    → 120 req/sec from known bad IPs → blocked
    → 30 req/sec pass WAF
        ↓
    Rate limiting kicks in
    → IPs exceeding 1000 req/5min → blocked
    → Legitimate traffic passes through
        ↓
    Your cluster sees normal traffic
    → Your users experience zero degradation
    → You get a Slack alert about the attack
    → WAF dashboard shows blocked requests
    ```
    
    ---
    
    ## Summary Table
    
    | Concern | Solution | Layer |
    | --- | --- | --- |
    | DDoS volumetric | AWS Shield + CloudFront | Edge |
    | Application attacks | WAF OWASP rules | Edge |
    | IP-based abuse | WAF rate limiting | Edge |
    | Guest overuse | Redis rate limiting | API Gateway |
    | AI cost runaway | Token budget + spend limits | AI Service |
    | Pod failure | HPA + PDB + health probes | K8s |
    | Node failure | Multi-AZ + Cluster Autoscaler | K8s |
    | AZ failure | Multi-AZ everything | AWS |
    | Cascade failures | Circuit breaker + retry | App code |
    | Secret leaks | Secrets Manager + IRSA | AWS + K8s |
    | Runtime attacks | Falco | K8s |
    | Account compromise | GuardDuty | AWS |
    | Config drift | ArgoCD self-heal | GitOps |
    | Traffic spikes | CloudFront + HPA + KEDA | Multi-layer |
    
    ---
    
    Every layer is independently effective. Together they make your portfolio genuinely production-hardened — not just "deployed."
    
    **Ready to start Phase 1?** Type **"Start"** and we write the first line of code.
    

Me:

```yaml
Lets have some enlightment on these:

* Full Database schema
* full frontend folder structure
* full backend folder structure ( with an associated comment for each file - what they are built for )
* All API routes ( just links /api/user etc )
* All api request & response ( not sure )
* What does User flow look like

with proper explanation of each things in each category
```

- Reply
    
    ---
    
    Let's go through each one thoroughly.
    
    ---
    
    ## 1. 🗄️ Full Database Schema
    
    ---
    
    ### Users Table
    
    ```sql
    users
    ├── id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
    ├── email             VARCHAR(255) UNIQUE NOT NULL
    ├── name              VARCHAR(255)
    ├── avatar_url        TEXT
    ├── provider          ENUM('google', 'github')
    ├── provider_id       VARCHAR(255)        -- OAuth provider's user ID
    ├── role              ENUM('admin', 'user') DEFAULT 'user'
    ├── is_active         BOOLEAN DEFAULT true
    ├── created_at        TIMESTAMP DEFAULT NOW()
    └── updated_at        TIMESTAMP DEFAULT NOW()
    ```
    
    ### Sessions Table
    
    ```sql
    sessions
    ├── id                UUID PRIMARY KEY
    ├── user_id           UUID REFERENCES users(id) ON DELETE CASCADE
    ├── token             TEXT UNIQUE NOT NULL   -- JWT or session token
    ├── expires_at        TIMESTAMP NOT NULL
    ├── ip_address        INET
    ├── user_agent        TEXT
    ├── created_at        TIMESTAMP DEFAULT NOW()
    └── last_active_at    TIMESTAMP DEFAULT NOW()
    ```
    
    ### Chat Sessions Table
    
    ```sql
    chat_sessions
    ├── id                UUID PRIMARY KEY
    ├── user_id           UUID REFERENCES users(id) ON DELETE SET NULL
    ├── guest_ip          INET                   -- for guest users
    ├── title             VARCHAR(255)           -- auto-generated from first message
    ├── status            ENUM('active','archived') DEFAULT 'active'
    ├── message_count     INTEGER DEFAULT 0
    ├── created_at        TIMESTAMP DEFAULT NOW()
    └── updated_at        TIMESTAMP DEFAULT NOW()
    ```
    
    ### Chat Messages Table
    
    ```sql
    chat_messages
    ├── id                UUID PRIMARY KEY
    ├── session_id        UUID REFERENCES chat_sessions(id) ON DELETE CASCADE
    ├── role              ENUM('user', 'assistant', 'tool')
    ├── content           TEXT NOT NULL
    ├── tool_name         VARCHAR(100)           -- which tool was called
    ├── tool_input        JSONB                  -- tool input payload
    ├── tool_output       JSONB                  -- tool output payload
    ├── tokens_used       INTEGER
    ├── latency_ms        INTEGER                -- how long LLM took
    ├── created_at        TIMESTAMP DEFAULT NOW()
    └── INDEX             (session_id, created_at)
    ```
    
    ### Projects Table
    
    ```sql
    projects
    ├── id                UUID PRIMARY KEY
    ├── slug              VARCHAR(255) UNIQUE    -- url-friendly name
    ├── title             VARCHAR(255) NOT NULL
    ├── description       TEXT
    ├── long_description  TEXT
    ├── tech_stack        TEXT[]                 -- ['Next.js','Python','K8s']
    ├── category          ENUM('fullstack','devops','ai','automation')
    ├── github_url        TEXT
    ├── live_url          TEXT
    ├── thumbnail_url     TEXT
    ├── images            TEXT[]                 -- array of S3 URLs
    ├── is_featured       BOOLEAN DEFAULT false
    ├── is_published      BOOLEAN DEFAULT true
    ├── github_stars      INTEGER DEFAULT 0      -- synced from GitHub API
    ├── github_forks      INTEGER DEFAULT 0
    ├── display_order     INTEGER                -- manual ordering
    ├── created_at        TIMESTAMP DEFAULT NOW()
    └── updated_at        TIMESTAMP DEFAULT NOW()
    ```
    
    ### Skills Table
    
    ```sql
    skills
    ├── id                UUID PRIMARY KEY
    ├── name              VARCHAR(100) NOT NULL
    ├── category          ENUM('frontend','backend','devops','ai','database','other')
    ├── proficiency       INTEGER CHECK (1-100)  -- percentage
    ├── icon_url          TEXT
    ├── years_experience  DECIMAL(3,1)
    ├── is_featured       BOOLEAN DEFAULT false
    └── display_order     INTEGER
    ```
    
    ### Experience Table
    
    ```sql
    experience
    ├── id                UUID PRIMARY KEY
    ├── company           VARCHAR(255) NOT NULL
    ├── role              VARCHAR(255) NOT NULL
    ├── description       TEXT
    ├── responsibilities  TEXT[]                 -- array of bullet points
    ├── tech_stack        TEXT[]
    ├── start_date        DATE NOT NULL
    ├── end_date          DATE                   -- NULL = current job
    ├── is_current        BOOLEAN DEFAULT false
    ├── company_url       TEXT
    ├── company_logo_url  TEXT
    ├── location          VARCHAR(255)
    └── display_order     INTEGER
    ```
    
    ### Testimonials Table
    
    ```sql
    testimonials
    ├── id                UUID PRIMARY KEY
    ├── author_name       VARCHAR(255) NOT NULL
    ├── author_role       VARCHAR(255)
    ├── author_company    VARCHAR(255)
    ├── author_avatar_url TEXT
    ├── content           TEXT NOT NULL
    ├── rating            INTEGER CHECK (1-5)
    ├── status            ENUM('pending','approved','rejected') DEFAULT 'pending'
    ├── source            ENUM('agent','manual')
    ├── linkedin_url      TEXT
    ├── created_at        TIMESTAMP DEFAULT NOW()
    └── approved_at       TIMESTAMP
    ```
    
    ### Inquiries Table (Lead Capture)
    
    ```sql
    inquiries
    ├── id                UUID PRIMARY KEY
    ├── name              VARCHAR(255) NOT NULL
    ├── email             VARCHAR(255) NOT NULL
    ├── company           VARCHAR(255)
    ├── budget            VARCHAR(100)           -- '$5k-10k', '$10k-50k' etc
    ├── timeline          VARCHAR(100)
    ├── project_type      VARCHAR(255)
    ├── description       TEXT NOT NULL
    ├── tech_stack        TEXT[]                 -- what they need
    ├── status            ENUM('new','read','replied','closed') DEFAULT 'new'
    ├── source            ENUM('contact_form','agent','mcp_client')
    ├── session_id        UUID REFERENCES chat_sessions(id)
    ├── ip_address        INET
    ├── created_at        TIMESTAMP DEFAULT NOW()
    └── updated_at        TIMESTAMP DEFAULT NOW()
    ```
    
    ### MCP Credentials Table (User's Remote MCP)
    
    ```sql
    mcp_credentials
    ├── id                UUID PRIMARY KEY
    ├── user_id           UUID REFERENCES users(id) ON DELETE CASCADE
    ├── name              VARCHAR(255)           -- "My Asana MCP"
    ├── server_url        TEXT NOT NULL          -- remote MCP URL
    ├── auth_type         ENUM('none','api_key','oauth','bearer')
    ├── encrypted_token   TEXT                   -- AES-256 encrypted
    ├── headers           JSONB                  -- additional headers
    ├── is_active         BOOLEAN DEFAULT true
    ├── last_used_at      TIMESTAMP
    ├── created_at        TIMESTAMP DEFAULT NOW()
    └── updated_at        TIMESTAMP DEFAULT NOW()
    ```
    
    ### Rate Limits Table (Backup to Redis)
    
    ```sql
    rate_limits
    ├── id                UUID PRIMARY KEY
    ├── identifier        VARCHAR(255) NOT NULL  -- IP or user_id
    ├── action            VARCHAR(100) NOT NULL  -- 'ai_chat', 'contact'
    ├── count             INTEGER DEFAULT 1
    ├── window_start      TIMESTAMP NOT NULL
    └── UNIQUE            (identifier, action, window_start)
    ```
    
    ### Analytics Events Table
    
    ```sql
    analytics_events
    ├── id                UUID PRIMARY KEY
    ├── session_id        VARCHAR(255)           -- browser session (not chat)
    ├── user_id           UUID REFERENCES users(id)
    ├── event_type        VARCHAR(100)           -- 'page_view','project_click'
    ├── page              VARCHAR(255)
    ├── referrer          TEXT
    ├── country           VARCHAR(10)            -- from CloudFront geo header
    ├── device_type       ENUM('desktop','mobile','tablet')
    ├── metadata          JSONB                  -- flexible extra data
    └── created_at        TIMESTAMP DEFAULT NOW()
    ```
    
    ### Resume Versions Table
    
    ```sql
    resume_versions
    ├── id                UUID PRIMARY KEY
    ├── version           VARCHAR(50)            -- 'v1.0', 'v1.1'
    ├── label             VARCHAR(255)           -- 'DevOps focused'
    ├── s3_url            TEXT NOT NULL
    ├── is_default        BOOLEAN DEFAULT false
    ├── download_count    INTEGER DEFAULT 0
    └── created_at        TIMESTAMP DEFAULT NOW()
    ```
    
    ### Vector Embeddings Metadata Table
    
    ```sql
    -- Actual vectors live in Pinecone/pgvector
    -- This tracks what's been embedded
    embeddings_metadata
    ├── id                UUID PRIMARY KEY
    ├── source_type       ENUM('resume','project','experience','skill','blog')
    ├── source_id         UUID                   -- references the source record
    ├── chunk_index       INTEGER                -- which chunk of the document
    ├── chunk_text        TEXT                   -- the actual text chunk
    ├── token_count       INTEGER
    ├── embedded_at       TIMESTAMP DEFAULT NOW()
    └── UNIQUE            (source_type, source_id, chunk_index)
    ```
    
    ---
    
    ## 2. 🖥️ Frontend Folder Structure
    
    ```
    apps/web/
    │
    ├── app/                                    # Next.js App Router
    │   ├── layout.tsx                          # Root layout — fonts, providers, metadata
    │   ├── page.tsx                            # Home page (/)
    │   ├── not-found.tsx                       # Custom 404 page
    │   ├── error.tsx                           # Global error boundary
    │   ├── loading.tsx                         # Global loading skeleton
    │   │
    │   ├── (marketing)/                        # Route group — public pages
    │   │   ├── about/
    │   │   │   └── page.tsx                    # /about — who you are, story
    │   │   ├── projects/
    │   │   │   ├── page.tsx                    # /projects — all projects grid
    │   │   │   └── [slug]/
    │   │   │       └── page.tsx                # /projects/eks-portfolio — detail
    │   │   ├── experience/
    │   │   │   └── page.tsx                    # /experience — timeline
    │   │   ├── skills/
    │   │   │   └── page.tsx                    # /skills — skills graph/radar
    │   │   ├── contact/
    │   │   │   └── page.tsx                    # /contact — contact form
    │   │   └── testimonials/
    │   │       └── page.tsx                    # /testimonials — wall of love
    │   │
    │   ├── (ai)/                               # Route group — AI features
    │   │   ├── chat/
    │   │   │   └── page.tsx                    # /chat — main AI chat interface
    │   │   └── mcp/
    │   │       └── page.tsx                    # /mcp — MCP client (auth required)
    │   │
    │   ├── (auth)/                             # Route group — auth pages
    │   │   ├── login/
    │   │   │   └── page.tsx                    # /login — OAuth login page
    │   │   └── callback/
    │   │       └── page.tsx                    # /callback — OAuth callback handler
    │   │
    │   ├── (admin)/                            # Route group — admin (you only)
    │   │   └── admin/
    │   │       ├── layout.tsx                  # Admin layout with sidebar
    │   │       ├── page.tsx                    # /admin — dashboard overview
    │   │       ├── projects/
    │   │       │   └── page.tsx                # Manage projects CRUD
    │   │       ├── inquiries/
    │   │       │   └── page.tsx                # View + manage inquiries
    │   │       ├── testimonials/
    │   │       │   └── page.tsx                # Approve/reject testimonials
    │   │       └── analytics/
    │   │           └── page.tsx                # Visitor analytics dashboard
    │   │
    │   └── api/                                # Next.js API routes (minimal)
    │       └── auth/
    │           └── [...nextauth]/
    │               └── route.ts                # NextAuth.js handler
    │
    ├── components/
    │   ├── ui/                                 # Base UI primitives
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── badge.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── tooltip.tsx
    │   │   ├── skeleton.tsx
    │   │   └── index.ts                        # barrel export
    │   │
    │   ├── layout/                             # Layout components
    │   │   ├── navbar.tsx                      # Top navigation bar
    │   │   ├── footer.tsx                      # Footer with links
    │   │   ├── sidebar.tsx                     # Admin sidebar
    │   │   └── mobile-menu.tsx                 # Mobile hamburger menu
    │   │
    │   ├── home/                               # Home page sections
    │   │   ├── hero.tsx                        # Hero — name, title, CTA
    │   │   ├── featured-projects.tsx           # Top 3 projects preview
    │   │   ├── skills-preview.tsx              # Skills highlight strip
    │   │   ├── experience-preview.tsx          # Latest role teaser
    │   │   └── cta-section.tsx                 # "Let's work together" CTA
    │   │
    │   ├── projects/                           # Project components
    │   │   ├── project-card.tsx                # Project grid card
    │   │   ├── project-grid.tsx                # Grid layout wrapper
    │   │   ├── project-detail.tsx              # Full project detail view
    │   │   ├── project-filter.tsx              # Filter by category/tech
    │   │   └── tech-badge.tsx                  # Technology tag badge
    │   │
    │   ├── chat/                               # AI Chat components
    │   │   ├── chat-window.tsx                 # Main chat container
    │   │   ├── chat-message.tsx                # Individual message bubble
    │   │   ├── chat-input.tsx                  # Message input + send button
    │   │   ├── chat-history.tsx                # Past sessions sidebar
    │   │   ├── tool-call-display.tsx           # Shows which tool agent called
    │   │   ├── typing-indicator.tsx            # "..." while AI is thinking
    │   │   ├── rate-limit-banner.tsx           # "X messages left" for guests
    │   │   └── suggested-questions.tsx         # Starter question chips
    │   │
    │   ├── mcp/                                # MCP Client components
    │   │   ├── mcp-credential-form.tsx         # Add remote MCP server
    │   │   ├── mcp-server-list.tsx             # List saved MCP servers
    │   │   ├── mcp-tool-explorer.tsx           # Browse available tools
    │   │   └── mcp-session.tsx                 # Active MCP chat session
    │   │
    │   ├── analytics/                          # Analytics display
    │   │   ├── visitor-chart.tsx               # Visitors over time
    │   │   ├── geo-map.tsx                     # World map of visitors
    │   │   └── event-feed.tsx                  # Live event stream
    │   │
    │   └── shared/                             # Shared across pages
    │       ├── section-header.tsx              # Consistent section titles
    │       ├── loading-spinner.tsx             # Generic spinner
    │       ├── error-boundary.tsx              # Component-level error catch
    │       ├── seo.tsx                         # Dynamic meta tags
    │       ├── theme-toggle.tsx                # Dark/light mode toggle
    │       └── back-to-top.tsx                 # Scroll to top button
    │
    ├── hooks/                                  # Custom React hooks
    │   ├── use-chat.ts                         # Chat state + streaming logic
    │   ├── use-auth.ts                         # Auth state + helpers
    │   ├── use-mcp.ts                          # MCP client state
    │   ├── use-rate-limit.ts                   # Track remaining messages
    │   ├── use-analytics.ts                    # Fire analytics events
    │   ├── use-theme.ts                        # Theme management
    │   └── use-scroll.ts                       # Scroll position tracking
    │
    ├── lib/                                    # Client-side utilities
    │   ├── api-client.ts                       # Typed fetch wrapper for all APIs
    │   ├── auth.ts                             # NextAuth.js config
    │   ├── stream.ts                           # SSE/streaming response parser
    │   ├── utils.ts                            # cn(), formatDate(), truncate()
    │   ├── constants.ts                        # App-wide constants
    │   └── validations.ts                      # Zod schemas for forms
    │
    ├── store/                                  # Global state (Zustand)
    │   ├── chat-store.ts                       # Chat messages, sessions state
    │   ├── auth-store.ts                       # User info, auth state
    │   └── ui-store.ts                         # Sidebar open, modals, theme
    │
    ├── styles/
    │   └── globals.css                         # Tailwind base + CSS variables
    │
    ├── public/
    │   ├── resume.pdf                          # Your resume
    │   ├── og-image.png                        # Open Graph image
    │   └── favicon.ico
    │
    ├── middleware.ts                            # Edge middleware — auth guards
    ├── next.config.ts                          # Next.js configuration
    ├── tailwind.config.ts                      # Tailwind configuration
    ├── tsconfig.json
    └── package.json
    ```
    
    ---
    
    ## 3. ⚙️ Backend Folder Structure
    
    ---
    
    ### API Gateway
    
    ```
    apps/api-gateway/
    │
    ├── src/
    │   ├── index.ts                            # Entry point — starts Fastify server
    │   ├── app.ts                              # Fastify app setup, plugins, routes registered
    │   │
    │   ├── config/
    │   │   ├── env.ts                          # Validates + exports all env variables (Zod)
    │   │   ├── redis.ts                        # Redis client connection setup
    │   │   ├── database.ts                     # PostgreSQL connection pool (pg/drizzle)
    │   │   └── logger.ts                       # Pino logger with OTel integration
    │   │
    │   ├── routes/
    │   │   ├── index.ts                        # Registers all route modules
    │   │   ├── health.ts                       # GET /health, GET /ready probes
    │   │   ├── auth.ts                         # POST /auth/login, /auth/logout, /auth/refresh
    │   │   ├── user.ts                         # GET /user/me, PATCH /user/me
    │   │   ├── projects.ts                     # GET /projects, GET /projects/:slug
    │   │   ├── skills.ts                       # GET /skills
    │   │   ├── experience.ts                   # GET /experience
    │   │   ├── testimonials.ts                 # GET /testimonials, POST /testimonials
    │   │   ├── inquiries.ts                    # POST /inquiries (contact form)
    │   │   ├── resume.ts                       # GET /resume (signed S3 URL)
    │   │   ├── analytics.ts                    # POST /analytics/event
    │   │   ├── chat.ts                         # POST /chat/session, GET /chat/history
    │   │   ├── mcp.ts                          # MCP credential CRUD routes
    │   │   └── admin/
    │   │       ├── index.ts                    # Admin route group — role guard applied
    │   │       ├── projects.ts                 # Full CRUD for projects (admin only)
    │   │       ├── testimonials.ts             # Approve/reject testimonials
    │   │       ├── inquiries.ts                # Read/update inquiry status
    │   │       └── analytics.ts               # Full analytics data (admin only)
    │   │
    │   ├── middleware/
    │   │   ├── auth.ts                         # JWT verification — attaches user to request
    │   │   ├── rate-limit.ts                   # Redis-based rate limiting per route
    │   │   ├── role-guard.ts                   # Checks user.role === 'admin'
    │   │   ├── validate.ts                     # Zod request body/params validation
    │   │   ├── cors.ts                         # CORS policy configuration
    │   │   └── otel.ts                         # OpenTelemetry trace context propagation
    │   │
    │   ├── services/
    │   │   ├── auth.service.ts                 # OAuth flow, JWT issue/verify/refresh
    │   │   ├── user.service.ts                 # User CRUD, profile management
    │   │   ├── project.service.ts              # Project queries, GitHub sync logic
    │   │   ├── chat.service.ts                 # Chat session management, history
    │   │   ├── mcp.service.ts                  # Encrypt/decrypt MCP credentials, proxy
    │   │   ├── analytics.service.ts            # Store + query analytics events
    │   │   ├── rate-limit.service.ts           # Redis incr/check rate limit logic
    │   │   └── s3.service.ts                   # Generate signed S3 URLs, upload
    │   │
    │   ├── db/
    │   │   ├── schema.ts                       # Drizzle ORM schema definitions
    │   │   ├── migrations/                     # SQL migration files
    │   │   └── queries/
    │   │       ├── users.ts                    # Typed user DB queries
    │   │       ├── projects.ts                 # Typed project DB queries
    │   │       ├── chat.ts                     # Typed chat DB queries
    │   │       └── analytics.ts               # Typed analytics DB queries
    │   │
    │   ├── types/
    │   │   ├── request.ts                      # Fastify request type extensions
    │   │   └── index.ts                        # Shared type exports
    │   │
    │   └── utils/
    │       ├── crypto.ts                       # AES-256 encrypt/decrypt for MCP tokens
    │       ├── response.ts                     # Standard API response formatter
    │       └── errors.ts                       # Custom error classes + handler
    │
    ├── Dockerfile
    ├── tsconfig.json
    └── package.json
    ```
    
    ---
    
    ### AI Service (Python)
    
    ```
    apps/ai-service/
    │
    ├── main.py                                 # Entry point — starts FastAPI, registers routers
    ├── app.py                                  # FastAPI app factory, middleware, CORS setup
    │
    ├── config/
    │   ├── settings.py                         # Pydantic Settings — all env vars validated
    │   ├── logging.py                          # Structlog setup with OTel integration
    │   └── redis.py                            # Redis client for rate limiting + caching
    │
    ├── api/
    │   ├── routes/
    │   │   ├── __init__.py
    │   │   ├── chat.py                         # POST /chat/stream — main streaming endpoint
    │   │   ├── health.py                       # GET /health, GET /ready
    │   │   ├── embeddings.py                   # POST /embeddings/ingest (admin — re-embed)
    │   │   └── mcp.py                          # POST /mcp/invoke — execute user's MCP tools
    │   │
    │   └── middleware/
    │       ├── auth.py                         # Validate JWT from api-gateway
    │       ├── rate_limit.py                   # AI-specific rate limit (tokens/day)
    │       └── otel.py                         # OTel trace propagation
    │
    ├── agent/
    │   ├── graph.py                            # LangGraph graph definition — nodes + edges
    │   ├── state.py                            # AgentState TypedDict — messages, context
    │   ├── nodes.py                            # Individual graph nodes (call_llm, call_tool)
    │   └── router.py                           # Conditional edge — which tool to call next
    │
    ├── tools/
    │   ├── __init__.py                         # Tool registry — all tools exported here
    │   ├── rag_tool.py                         # Search vector store for resume/bio/skills
    │   ├── github_tool.py                      # Fetch live repos, READMEs from GitHub API
    │   ├── portfolio_tool.py                   # Fetch projects/skills from api-gateway
    │   ├── calendar_tool.py                    # Check availability + create calendar event
    │   ├── lead_capture_tool.py                # POST inquiry to api-gateway
    │   ├── email_tool.py                       # Send confirmation email via SendGrid
    │   ├── slack_tool.py                       # Send Slack notification webhook
    │   └── web_search_tool.py                  # Search web for context (Tavily API)
    │
    ├── rag/
    │   ├── embedder.py                         # OpenAI embeddings — text → vector
    │   ├── ingestion.py                        # Chunking strategy, batch embed, upsert
    │   ├── retriever.py                        # Similarity search, reranking, top-k
    │   └── documents/                          # Source documents for embedding
    │       ├── resume.md                       # Your resume in markdown
    │       ├── about.md                        # Your story, values, approach
    │       └── projects.md                     # Project descriptions for RAG
    │
    ├── mcp/
    │   ├── server.py                           # Your public MCP server (prajwalraj tools)
    │   ├── client.py                           # Generic MCP client — connects to any server
    │   └── tools/
    │       ├── get_projects.py                 # MCP tool: returns your projects
    │       ├── get_skills.py                   # MCP tool: returns skills graph
    │       ├── get_experience.py               # MCP tool: returns work history
    │       └── search_portfolio.py             # MCP tool: semantic search over your work
    │
    ├── services/
    │   ├── llm.py                              # LLM client setup (Anthropic + OpenAI)
    │   ├── stream.py                           # SSE streaming response builder
    │   └── token_budget.py                     # Track + enforce token limits per session
    │
    └── tests/
        ├── test_agent.py                       # Agent graph unit tests
        ├── test_tools.py                       # Individual tool tests
        └── test_rag.py                         # RAG retrieval accuracy tests
    ```
    
    ---
    
    ## 4. 🔗 All API Routes
    
    ---
    
    ### Auth
    
    ```
    POST   /auth/oauth/google              Initiate Google OAuth
    POST   /auth/oauth/github              Initiate GitHub OAuth
    GET    /auth/callback                  OAuth callback handler
    POST   /auth/refresh                   Refresh access token
    POST   /auth/logout                    Invalidate session
    ```
    
    ### User
    
    ```
    GET    /user/me                        Get current user profile
    PATCH  /user/me                        Update profile (name, avatar)
    DELETE /user/me                        Delete account
    ```
    
    ### Projects
    
    ```
    GET    /projects                       Get all published projects
    GET    /projects/featured              Get featured projects only
    GET    /projects/:slug                 Get single project by slug
    POST   /projects                       Create project (admin)
    PATCH  /projects/:id                   Update project (admin)
    DELETE /projects/:id                   Delete project (admin)
    POST   /projects/sync-github           Sync stars/forks from GitHub (admin)
    ```
    
    ### Skills
    
    ```
    GET    /skills                         Get all skills
    GET    /skills/:category               Get skills by category
    POST   /skills                         Create skill (admin)
    PATCH  /skills/:id                     Update skill (admin)
    DELETE /skills/:id                     Delete skill (admin)
    ```
    
    ### Experience
    
    ```
    GET    /experience                     Get all experience entries
    POST   /experience                     Create experience (admin)
    PATCH  /experience/:id                 Update experience (admin)
    DELETE /experience/:id                 Delete experience (admin)
    ```
    
    ### Testimonials
    
    ```
    GET    /testimonials                   Get all approved testimonials
    POST   /testimonials                   Submit testimonial (via agent)
    PATCH  /testimonials/:id/approve       Approve testimonial (admin)
    PATCH  /testimonials/:id/reject        Reject testimonial (admin)
    DELETE /testimonials/:id               Delete testimonial (admin)
    ```
    
    ### Inquiries / Contact
    
    ```
    POST   /inquiries                      Submit contact inquiry
    GET    /inquiries                      Get all inquiries (admin)
    GET    /inquiries/:id                  Get single inquiry (admin)
    PATCH  /inquiries/:id/status           Update inquiry status (admin)
    ```
    
    ### Chat
    
    ```
    POST   /chat/session                   Create new chat session
    GET    /chat/sessions                  Get user's chat history
    GET    /chat/sessions/:id              Get single session with messages
    DELETE /chat/sessions/:id              Delete chat session
    GET    /chat/sessions/:id/messages     Get messages for session
    GET    /chat/rate-limit                Check remaining messages (guest)
    ```
    
    ### AI Service Routes (ai.prajwalraj.me)
    
    ```
    POST   /chat/stream                    Stream AI response (SSE)
    POST   /embeddings/ingest              Re-ingest documents into vector store (admin)
    GET    /embeddings/status              Check embedding pipeline status (admin)
    POST   /mcp/invoke                     Invoke user's remote MCP tool
    GET    /health                         Liveness probe
    GET    /ready                          Readiness probe
    ```
    
    ### MCP Credentials
    
    ```
    GET    /mcp/credentials                Get user's saved MCP servers
    POST   /mcp/credentials                Add new MCP server
    PATCH  /mcp/credentials/:id            Update MCP server
    DELETE /mcp/credentials/:id            Delete MCP server
    POST   /mcp/credentials/:id/test       Test MCP connection
    GET    /mcp/credentials/:id/tools      List available tools on MCP server
    ```
    
    ### Resume
    
    ```
    GET    /resume                         Get signed S3 URL for resume download
    GET    /resume/versions                Get all resume versions (admin)
    POST   /resume/upload                  Upload new resume version (admin)
    ```
    
    ### Analytics
    
    ```
    POST   /analytics/event                Track visitor event (page view, click)
    GET    /analytics/summary              Get analytics summary (admin)
    GET    /analytics/visitors             Visitor count over time (admin)
    GET    /analytics/events               Raw event stream (admin)
    ```
    
    ### Health
    
    ```
    GET    /health                         Liveness probe
    GET    /ready                          Readiness probe
    GET    /metrics                        Prometheus metrics scrape endpoint
    ```
    
    ---
    
    ## 5. 📨 API Request & Response — Key Endpoints
    
    ---
    
    ### POST /chat/stream (Most Important)
    
    ```tsx
    // Request
    {
      session_id: "uuid",                  // null for first message
      message: "What projects has Prajwal built with Kubernetes?",
      mcp_credential_id: "uuid" | null     // if user wants to use their MCP
    }
    
    // Response — Server-Sent Events (streaming)
    event: delta
    data: {"type": "text", "content": "Prajwal has built "}
    
    event: delta
    data: {"type": "text", "content": "several Kubernetes projects"}
    
    event: tool_call
    data: {"type": "tool_call", "tool": "rag_tool", "input": {"query": "kubernetes projects"}}
    
    event: tool_result
    data: {"type": "tool_result", "tool": "rag_tool", "output": {...}}
    
    event: delta
    data: {"type": "text", "content": "including his portfolio itself..."}
    
    event: done
    data: {"type": "done", "session_id": "uuid", "tokens_used": 342, "latency_ms": 1823}
    ```
    
    ### POST /auth/oauth/google
    
    ```tsx
    // Request
    { code: "google-oauth-code", redirect_uri: "https://prajwalraj.me/callback" }
    
    // Response 200
    {
      access_token: "jwt...",
      refresh_token: "jwt...",
      expires_in: 900,                     // 15 minutes
      user: {
        id: "uuid",
        name: "John Doe",
        email: "john@example.com",
        avatar_url: "https://...",
        role: "user"
      }
    }
    ```
    
    ### GET /projects
    
    ```tsx
    // Request — Query params
    ?category=devops&featured=true&limit=10&offset=0
    
    // Response 200
    {
      data: [
        {
          id: "uuid",
          slug: "portfolio-eks",
          title: "Portfolio on EKS",
          description: "Production-grade portfolio...",
          tech_stack: ["Next.js", "Kubernetes", "Terraform"],
          category: "devops",
          github_url: "https://github.com/...",
          live_url: "https://prajwalraj.me",
          thumbnail_url: "https://cdn.prajwalraj.me/...",
          github_stars: 142,
          is_featured: true
        }
      ],
      pagination: {
        total: 24,
        limit: 10,
        offset: 0,
        has_more: true
      }
    }
    ```
    
    ### POST /inquiries
    
    ```tsx
    // Request
    {
      name: "Sarah Chen",
      email: "sarah@company.com",
      company: "TechCorp",
      project_type: "DevOps Consulting",
      description: "We need help setting up our K8s infrastructure",
      budget: "$10k-50k",
      timeline: "2 months",
      tech_stack: ["Kubernetes", "AWS", "Terraform"]
    }
    
    // Response 201
    {
      id: "uuid",
      message: "Thanks Sarah! Prajwal will get back to you within 24 hours.",
      estimated_response: "within 24 hours"
    }
    ```
    
    ### POST /mcp/credentials
    
    ```tsx
    // Request
    {
      name: "My Asana MCP",
      server_url: "https://mcp.asana.com/sse",
      auth_type: "api_key",
      token: "asana_api_key_here",          // encrypted before storing
      headers: { "X-Custom": "value" }
    }
    
    // Response 201
    {
      id: "uuid",
      name: "My Asana MCP",
      server_url: "https://mcp.asana.com/sse",
      auth_type: "api_key",
      is_active: true,
      created_at: "2025-01-01T00:00:00Z"
      // token NEVER returned
    }
    ```
    
    ### Standard Error Response (All Endpoints)
    
    ```tsx
    // 400 Bad Request
    { error: "VALIDATION_ERROR", message: "email is required", field: "email" }
    
    // 401 Unauthorized
    { error: "UNAUTHORIZED", message: "Invalid or expired token" }
    
    // 403 Forbidden
    { error: "FORBIDDEN", message: "Admin access required" }
    
    // 429 Too Many Requests
    {
      error: "RATE_LIMIT_EXCEEDED",
      message: "5 message daily limit reached",
      retry_after: 3600,                   // seconds
      upgrade_message: "Sign in for unlimited access"
    }
    
    // 500 Internal Server Error
    { error: "INTERNAL_ERROR", message: "Something went wrong", trace_id: "abc123" }
    // trace_id links to Grafana Tempo trace for debugging
    ```
    
    ---
    
    ## 6. 👤 User Flow — Complete
    
    ---
    
    ### Flow 1 — Guest Visitor (Most Common)
    
    ```
    1. Lands on prajwalraj.me
       → CloudFront serves cached SSG page instantly
       → Hero section loads with animations
       → Analytics event fired: page_view
    
    2. Browses projects
       → Clicks /projects
       → Filters by "DevOps" category
       → Clicks on a project card
       → /projects/eks-portfolio loads (SSG — instant)
       → Sees tech stack, GitHub stars, live demo link
    
    3. Wants to ask about Prajwal
       → Clicks "Chat with AI" CTA
       → /chat loads
       → Sees suggested questions
       → "Rate limit banner: 5 messages remaining"
    
    4. Types: "What has Prajwal built with LangGraph?"
       → POST /chat/stream fires
       → Typing indicator appears
       → Tool call display: "Searching knowledge base..."
       → Tool call display: "Fetching GitHub projects..."
       → Streamed response appears word by word
       → Response cites specific projects with links
    
    5. Asks 4 more questions
       → After 5th message: rate limit hit
       → Banner: "Sign in with Google/GitHub for unlimited chat"
    
    6. Decides to contact Prajwal
       → Goes to /contact
       → Fills contact form
       → POST /inquiries
       → Success: "Prajwal will respond within 24 hours"
       → SQS message → notification-service → email to you + confirmation to them
    ```
    
    ---
    
    ### Flow 2 — Logged In User
    
    ```
    1. Clicks "Sign In" → Google OAuth
       → Redirected to Google
       → Returns to /callback
       → JWT issued + stored in httpOnly cookie
       → Redirected back to /chat
    
    2. Chat — now unlimited
       → No rate limit banner
       → Chat history saved per session
       → Can see past conversations in sidebar
    
    3. Accesses MCP Client (/mcp)
       → Enters their remote MCP server URL + API key
       → POST /mcp/credentials (token encrypted + stored)
       → Clicks "Test Connection" → tools listed
       → Starts chat with MCP tools available
       → "Book a meeting via my Calendly MCP" → agent invokes it
    
    4. Wants tailored resume
       → Types: "Generate a resume tailored for a Staff DevOps Engineer at Stripe"
       → Agent: fetches full profile (RAG + portfolio API)
       → Agent: web search for Stripe DevOps requirements
       → LLM generates tailored resume
       → PDF generated → uploaded to S3
       → Signed URL returned → user downloads
    ```
    
    ---
    
    ### Flow 3 — Action Agent (Meeting Booking)
    
    ```
    User: "I'd like to schedule a call with Prajwal"
        ↓
    Agent: "I'd love to help set that up.
            What's your name and email?"
        ↓
    User: "Sarah Chen, sarah@techcorp.com"
        ↓
    Agent calls: calendar_tool.get_availability()
        → Returns: ["Mon 2pm", "Tue 10am", "Wed 3pm"]
        ↓
    Agent: "Prajwal is available:
            1. Monday 2pm IST
            2. Tuesday 10am IST
            3. Wednesday 3pm IST
            Which works for you?"
        ↓
    User: "Tuesday 10am"
        ↓
    Agent calls: calendar_tool.create_event(
      title: "Call with Sarah Chen - TechCorp",
      time: "Tuesday 10am IST",
      attendee: "sarah@techcorp.com"
    )
        ↓
    Agent calls: email_tool.send(
      to: "sarah@techcorp.com",
      template: "meeting_confirmation",
      data: { time, calendar_link }
    )
        ↓
    Agent calls: slack_tool.notify(
      message: "📅 New meeting booked: Sarah Chen (TechCorp) - Tue 10am"
    )
        ↓
    Agent calls: lead_capture_tool.save(
      name: "Sarah Chen",
      email: "sarah@techcorp.com",
      source: "agent_meeting_booking"
    )
        ↓
    Agent: "Done! Sarah, you'll receive a calendar invite at
            sarah@techcorp.com. Looking forward to connecting!"
    ```
    
    ---
    
    ### Flow 4 — You (Admin)
    
    ```
    1. Login → role: 'admin' → access to /admin
    
    2. /admin dashboard
       → See: visitors today, chat sessions, new inquiries, pending testimonials
    
    3. New inquiry notification on Slack
       → Click link → /admin/inquiries/:id
       → See full conversation context from AI agent
       → Mark as 'replied' after responding
    
    4. Approve testimonial
       → /admin/testimonials
       → Review pending submission
       → Click approve → auto-publishes to /testimonials
    
    5. Add new project
       → /admin/projects → Create
       → Fill details → save
       → Triggers re-embedding → vector store updated
       → AI agent now knows about the new project
    
    6. View live metrics
       → grafana.prajwalraj.me
       → See real-time: RPS, latency, pod count, AI usage
    ```
    
    ---
    
    ## Summary
    
    | Area | Count |
    | --- | --- |
    | DB Tables | 13 |
    | Frontend Pages | 15 |
    | Frontend Components | 40+ |
    | API Routes | 50+ |
    | AI Tools | 8 |
    | User Flows | 4 major |
    
    ---
    
    This is the complete picture of every data model, every file, every route, and every user journey.
    
    **Ready to start Phase 1 and write the actual code?**
    

Me:

```yaml
What about Admin thing

I will be building more & more projects - in various categories right

I will need to add as well - in their various categories right... 

I think apart from user loing - there should also be admin login.

----

Next Database 

Where are we going to have our db ?
```

- Reply
    
    ---
    
    Great points. Let me address both clearly.
    
    ---
    
    ## 👨‍💼 Admin — Full Clarity
    
    ---
    
    ### Yes — Separate Admin Login. Here's Why.
    
    ```
    User Login (Google/GitHub OAuth)
    → For visitors who want unlimited chat + MCP client
    → Role: 'user'
    → Access: chat, history, MCP client only
    
    Admin Login (Email + Password)
    → Only YOU
    → Role: 'admin'
    → Access: everything + admin panel
    → No OAuth — direct credential login
    → Protected by: bcrypt password + TOTP (2FA mandatory)
    → Extra: IP allowlist (only your home/VPN IP can hit /admin/login)
    ```
    
    **Why not OAuth for admin?**
    
    ```
    OAuth depends on Google/GitHub being up
    If OAuth provider has issues → you're locked out of your own site
    Direct credential login → you're always in control
    Also: no third party ever touches your admin session
    ```
    
    ---
    
    ### Admin Panel — Full Feature Set
    
    Since you'll keep building projects across categories, here's everything the admin needs:
    
    ---
    
    ### Projects Management
    
    ```
    /admin/projects
    ├── View all projects (all categories, all statuses)
    ├── Filter by: category, published/draft, featured/not
    ├── Create new project
    │   ├── Title, slug (auto-generated)
    │   ├── Short description + long description (markdown editor)
    │   ├── Category: fullstack / devops / ai / automation / opensource
    │   ├── Tech stack tags (multi-select + add custom)
    │   ├── GitHub URL → auto-fetches: stars, forks, language, README
    │   ├── Live URL
    │   ├── Thumbnail upload → S3
    │   ├── Image gallery upload → S3 (multiple)
    │   ├── Display order (drag to reorder)
    │   ├── Featured toggle
    │   └── Published / Draft toggle
    ├── Edit existing project
    ├── Delete project
    ├── Bulk actions: publish, unpublish, delete
    ├── "Sync GitHub" button → refreshes stars/forks for all projects
    └── "Re-embed" button → re-ingests project into vector store
         (so AI agent immediately knows about new project)
    ```
    
    ### Categories Management
    
    ```
    /admin/categories
    ├── View all categories
    ├── Create category: name, slug, icon, color, description
    ├── Edit category
    ├── Delete category (only if no projects assigned)
    ├── Reorder categories (drag and drop)
    └── Toggle visibility (show/hide on frontend)
    
    -- This means you can add new categories anytime
    -- without touching code
    -- Just create "Blockchain" or "Mobile" category
    -- and assign projects to it
    ```
    
    ### Skills Management
    
    ```
    /admin/skills
    ├── View all skills grouped by category
    ├── Add skill: name, category, proficiency %, years, icon
    ├── Edit skill
    ├── Delete skill
    ├── Reorder within category
    └── Toggle featured (shows on homepage)
    ```
    
    ### Experience Management
    
    ```
    /admin/experience
    ├── View all experience timeline
    ├── Add experience entry
    │   ├── Company, role, location
    │   ├── Start date, end date (or mark as current)
    │   ├── Description + responsibilities (bullet points)
    │   ├── Tech stack used
    │   └── Company logo upload → S3
    ├── Edit experience
    └── Delete experience
    ```
    
    ### Inquiries / Leads
    
    ```
    /admin/inquiries
    ├── View all inquiries (newest first)
    ├── Filter by: status (new/read/replied/closed), source
    ├── View full inquiry detail
    │   ├── Person's info + project description
    │   ├── Which chat session triggered it (if via agent)
    │   └── Full conversation context
    ├── Update status
    ├── Add private notes
    └── Export to CSV
    ```
    
    ### Testimonials
    
    ```
    /admin/testimonials
    ├── Pending queue (needs action)
    ├── Approve → auto-publishes
    ├── Reject → with optional reason
    ├── Edit content before approving
    ├── View approved testimonials
    └── Delete any testimonial
    ```
    
    ### Resume Management
    
    ```
    /admin/resume
    ├── View all resume versions
    ├── Upload new version → goes to S3
    ├── Set as default (what visitors download)
    ├── View download count per version
    └── Delete old versions
    ```
    
    ### Analytics Dashboard
    
    ```
    /admin/analytics
    ├── Visitors today / this week / this month
    ├── Top pages visited
    ├── Referrer sources (where people come from)
    ├── Visitor world map
    ├── Chat sessions started
    ├── Most asked AI questions
    ├── Tool call breakdown (which agent tools fire most)
    ├── Conversion: visitor → chat → inquiry
    └── Live event feed (real-time)
    ```
    
    ### AI / Embeddings Control
    
    ```
    /admin/ai
    ├── Trigger full re-embed (rebuilds entire vector store)
    ├── Trigger selective re-embed (just projects, or just resume)
    ├── View embedding status (how many chunks, last updated)
    ├── View AI usage (tokens consumed today/month)
    ├── View estimated AI cost this month
    └── Set rate limits (override defaults without code change)
    ```
    
    ### Site Settings
    
    ```
    /admin/settings
    ├── Your profile (name, bio, avatar — used across site)
    ├── Social links (GitHub, LinkedIn, Twitter, etc.)
    ├── Availability status ("Open to work" / "Not available")
    │   └── Shows as a badge on homepage hero
    ├── Contact email
    ├── Resume default version
    └── Feature flags
        ├── Chat enabled/disabled
        ├── MCP client enabled/disabled
        ├── Testimonial submissions open/closed
        └── Maintenance mode
    ```
    
    ---
    
    ### Admin Auth Flow
    
    ```
    You go to prajwalraj.me/admin/login
        ↓
    WAF checks: is request from allowed IP?
        → No  → 403 immediately (attacker sees nothing)
        → Yes → show login form
        ↓
    Enter email + password
        ↓
    Backend: bcrypt.compare(password, hash)
        ↓
    Success → prompt TOTP code (Google Authenticator)
        ↓
    TOTP verified → admin JWT issued (1hr expiry)
        → stored in httpOnly, secure, sameSite cookie
        ↓
    Access /admin panel
        ↓
    Every admin API call:
        → JWT verified
        → role === 'admin' checked
        → IP checked again
        → If any fail → 401 + session invalidated
    ```
    
    ---
    
    ### Updated DB — Admin + Categories Tables
    
    Two new tables to add:
    
    ```sql
    -- Admin credentials (just you — one row ever)
    admin_credentials
    ├── id                UUID PRIMARY KEY
    ├── email             VARCHAR(255) UNIQUE NOT NULL
    ├── password_hash     TEXT NOT NULL           -- bcrypt
    ├── totp_secret       TEXT NOT NULL           -- encrypted TOTP secret
    ├── allowed_ips       INET[]                  -- IP allowlist
    ├── last_login_at     TIMESTAMP
    ├── last_login_ip     INET
    └── updated_at        TIMESTAMP DEFAULT NOW()
    
    -- Dynamic categories (you control from admin)
    categories
    ├── id                UUID PRIMARY KEY
    ├── name              VARCHAR(100) NOT NULL    -- "DevOps"
    ├── slug              VARCHAR(100) UNIQUE      -- "devops"
    ├── description       TEXT
    ├── icon              VARCHAR(100)             -- icon name or emoji
    ├── color             VARCHAR(20)              -- hex color for UI
    ├── is_visible        BOOLEAN DEFAULT true
    ├── display_order     INTEGER
    └── created_at        TIMESTAMP DEFAULT NOW()
    ```
    
    And update projects table:
    
    ```sql
    -- Change category from ENUM to FK
    -- Before:
    category   ENUM('fullstack','devops','ai','automation')
    
    -- After:
    category_id   UUID REFERENCES categories(id)
    
    -- Now you can add infinite categories from admin panel
    -- without touching code or DB schema ever again
    ```
    
    ---
    
    ## 🗄️ Database — Where Does It Live?
    
    ---
    
    ### Primary Database — AWS RDS Aurora PostgreSQL
    
    ```
    What:    AWS RDS Aurora PostgreSQL (Serverless v2)
    Where:   ap-south-1 (Mumbai) — same region as EKS
    Why Aurora over plain RDS:
    
    ┌─────────────────────────────────────────────┐
    │  Aurora PostgreSQL vs Plain RDS PostgreSQL  │
    ├─────────────────────────────────────────────┤
    │  Storage     Auto-scales 10GB → 128TB       │
    │              vs manual allocation on RDS    │
    │                                             │
    │  Compute     Serverless v2 — scales         │
    │              0.5 → 64 ACUs per second       │
    │              vs fixed instance size         │
    │                                             │
    │  Failover    < 30 seconds automatic         │
    │              vs 1-2 min on plain RDS        │
    │                                             │
    │  Replicas    Up to 15 read replicas         │
    │              vs 5 on plain RDS              │
    │                                             │
    │  Cost        Pay per ACU-second used        │
    │              Scales to near zero at night   │
    └─────────────────────────────────────────────┘
    ```
    
    ### Aurora Serverless v2 — Why Perfect for Portfolio
    
    ```
    Traffic pattern of a portfolio:
    
    Day:    ████████░░  moderate traffic
    Night:  █░░░░░░░░░  near zero traffic
    
    Aurora Serverless v2:
    → Scales DOWN to 0.5 ACU at night  → costs almost nothing
    → Scales UP instantly when traffic comes
    → You don't pay for idle compute
    → Perfect for variable portfolio traffic
    ```
    
    ### Network Placement
    
    ```
    Aurora lives in:
    └── Isolated subnets (10.0.21.x, 10.0.22.x, 10.0.23.x)
        → No internet access. Ever.
        → Only reachable from EKS nodes (Security Group rule)
        → EKS pods connect via: db.internal.prajwalraj.me
           (private Route53 hosted zone — never public)
    
    Connection pooling:
    └── PgBouncer runs as a sidecar on api-gateway pods
        → Pools DB connections (Aurora has connection limits)
        → Apps connect to PgBouncer → PgBouncer → Aurora
        → Prevents connection exhaustion under load
    ```
    
    ### Backups
    
    ```
    Automated backups:     7 days retention (AWS managed)
    Point-in-time:         Restore to any second in last 7 days
    Manual snapshots:      Before every major schema migration
    Cross-region backup:   Daily snapshot copied to us-east-1
                           (if Mumbai region has an outage)
    ```
    
    ---
    
    ### Vector Database — pgvector on Aurora (Not Pinecone)
    
    ```
    Earlier I mentioned Pinecone → scratch that.
    Use pgvector extension on Aurora instead.
    
    Why:
    ├── No extra service to manage
    ├── No extra cost ($70/month saved)
    ├── Vectors live in same DB → joins with other tables
    ├── Good enough for portfolio scale (< 100K vectors)
    └── Pinecone only worth it at millions of vectors
    
    Setup:
    CREATE EXTENSION vector;
    
    ALTER TABLE embeddings_metadata
    ADD COLUMN embedding vector(1536);  -- OpenAI ada-002 dimensions
    
    CREATE INDEX ON embeddings_metadata
    USING ivfflat (embedding vector_cosine_ops);
    -- Fast approximate nearest neighbor search
    ```
    
    ---
    
    ### Cache — AWS ElastiCache Redis
    
    ```
    What lives in Redis:
    
    Rate limiting:
    └── rate:chat:guest:{ip}:{date}    TTL: 24h
    └── rate:api:{ip}                  TTL: 1h
    
    Sessions:
    └── session:{token}                TTL: 15min (access)
    └── refresh:{token}                TTL: 7days
    
    Cache:
    └── projects:all                   TTL: 5min
    └── projects:featured              TTL: 5min
    └── skills:all                     TTL: 1hr
    └── experience:all                 TTL: 1hr
    
    Feature flags (from admin settings):
    └── flag:chat_enabled              TTL: none (invalidated on change)
    └── flag:maintenance_mode          TTL: none
    
    Admin IP allowlist:
    └── admin:allowed_ips              TTL: none
    ```
    
    ---
    
    ### S3 — Object Storage
    
    ```
    Buckets:
    
    prajwalraj-assets-prod/
    ├── projects/thumbnails/           Project thumbnail images
    ├── projects/gallery/              Project gallery images
    ├── skills/icons/                  Skill icons
    ├── experience/logos/              Company logos
    ├── resume/                        Resume PDF versions
    └── avatars/                       User avatars
    
    prajwalraj-backups-prod/
    └── db-snapshots/                  Aurora snapshot exports
    
    prajwalraj-terraform-state/
    └── terraform.tfstate              Terraform remote state
    
    All buckets:
    ├── Private (no public access)
    ├── Versioning enabled
    ├── SSE-S3 encryption at rest
    └── CloudFront serves assets (signed URLs for private files)
    ```
    
    ---
    
    ### Complete Data Layer Picture
    
    ```
    ┌─────────────────────────────────────────────────────┐
    │                    EKS Pods                         │
    │  api-gateway  →  PgBouncer  →  Aurora PostgreSQL    │
    │                              (+ pgvector extension) │
    │                                                     │
    │  api-gateway  →  ElastiCache Redis                  │
    │                                                     │
    │  api-gateway  →  S3 (via VPC Endpoint)              │
    │                                                     │
    │  ai-service   →  Aurora (pgvector queries)          │
    │  ai-service   →  Redis (rate limit + cache)         │
    └─────────────────────────────────────────────────────┘
    
    Everything in private subnets.
    Nothing has a public IP.
    All traffic stays within AWS network.
    ```
    
    ---
    
    ### DB Summary
    
    | Store | Technology | Lives In | Purpose |
    | --- | --- | --- | --- |
    | Primary DB | Aurora PostgreSQL Serverless v2 | AWS RDS — ap-south-1 | All structured data |
    | Vector Store | pgvector on Aurora | Same Aurora instance | RAG embeddings |
    | Cache + Rate Limit | ElastiCache Redis | AWS — ap-south-1 | Speed + limits |
    | Object Storage | S3 | AWS — ap-south-1 | Files, images, resume |
    | Terraform State | S3 + DynamoDB | AWS — ap-south-1 | IaC state locking |
    
    ---
    
    Now the architecture is truly complete — admin included, database fully decided, categories fully dynamic.
    
    **Shall we start Phase 1 and write the actual code?**