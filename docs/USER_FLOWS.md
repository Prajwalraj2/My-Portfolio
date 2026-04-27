# User Flows

> Detailed user journey documentation for all personas

---

## Table of Contents

1. [Guest Visitor Flow](#1-guest-visitor-flow)
2. [Logged-in User Flow](#2-logged-in-user-flow)
3. [AI Agent Action Flows](#3-ai-agent-action-flows)
4. [Admin Flow](#4-admin-flow)

---

## 1. Guest Visitor Flow

The most common user journey - someone discovering the portfolio.

### Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    GUEST VISITOR JOURNEY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. LAND ON HOMEPAGE                                          │
│   ├── CloudFront serves cached SSG page (instant)              │
│   ├── Hero section with animations loads                       │
│   ├── Analytics event: page_view                               │
│   └── See featured projects, skills preview                    │
│                                                                 │
│   2. BROWSE PROJECTS                                           │
│   ├── Click "View All Projects"                                │
│   ├── /projects loads (SSG - instant)                          │
│   ├── Filter by category (DevOps, AI, etc.)                    │
│   ├── Click on a project card                                  │
│   └── /projects/[slug] loads with full details                 │
│                                                                 │
│   3. EXPLORE ABOUT/SKILLS/EXPERIENCE                           │
│   ├── Navigate via navbar                                      │
│   ├── All pages SSG (instant load)                             │
│   └── Interactive elements (skill bars, timeline)              │
│                                                                 │
│   4. WANT TO ASK ABOUT PRAJWAL                                 │
│   ├── Click "Chat with AI" CTA                                 │
│   ├── /chat loads                                              │
│   ├── See suggested questions                                  │
│   └── Banner: "5 messages remaining today"                     │
│                                                                 │
│   5. CHAT WITH AI                                              │
│   ├── Type: "What has Prajwal built with Kubernetes?"          │
│   ├── Typing indicator appears                                 │
│   ├── Tool call shown: "Searching knowledge base..."           │
│   ├── Tool call shown: "Fetching GitHub projects..."           │
│   ├── Streamed response appears word by word                   │
│   └── Response includes project links                          │
│                                                                 │
│   6. RATE LIMIT HIT                                            │
│   ├── After 5 messages: rate limit reached                     │
│   ├── Banner: "Sign in with Google/GitHub for unlimited"       │
│   └── Options: Sign in OR come back tomorrow                   │
│                                                                 │
│   7. DECIDE TO CONTACT                                         │
│   ├── Go to /contact                                           │
│   ├── Fill out contact form                                    │
│   ├── POST /inquiries                                          │
│   ├── Success: "Prajwal will respond within 24 hours"          │
│   └── Confirmation email sent to visitor                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### API Calls Made

| Step | Endpoint | Method |
|------|----------|--------|
| Page load | CDN cached | - |
| Projects list | `/projects` | GET |
| Project detail | `/projects/:slug` | GET |
| Start chat | `/chat/session` | POST |
| Send message | `/chat/stream` | POST (SSE) |
| Check limit | `/chat/rate-limit` | GET |
| Submit contact | `/inquiries` | POST |

### Rate Limits Applied

- AI Chat: 5 messages/day (by IP)
- Contact form: 3 submissions/day (by IP)
- API general: 100 requests/hour (by IP)

---

## 2. Logged-in User Flow

Users who sign in via OAuth for enhanced features.

### Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                   LOGGED-IN USER JOURNEY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. SIGN IN                                                   │
│   ├── Click "Sign In" button                                   │
│   ├── Choose Google or GitHub                                  │
│   ├── Redirect to OAuth provider                               │
│   ├── Grant permissions                                        │
│   ├── Redirect to /callback                                    │
│   ├── JWT issued (access + refresh)                            │
│   ├── Stored in httpOnly cookie                                │
│   └── Redirect to original page (or /chat)                     │
│                                                                 │
│   2. UNLIMITED CHAT                                            │
│   ├── No rate limit banner                                     │
│   ├── Chat history saved per session                           │
│   ├── Sidebar shows past conversations                         │
│   ├── Can continue previous chats                              │
│   └── All features available                                   │
│                                                                 │
│   3. MCP CLIENT ACCESS                                         │
│   ├── Navigate to /mcp (only visible when logged in)           │
│   ├── Click "Add MCP Server"                                   │
│   ├── Enter server URL + credentials                           │
│   │   ├── Name: "My Asana MCP"                                 │
│   │   ├── URL: "https://mcp.asana.com/sse"                     │
│   │   ├── Auth type: API Key                                   │
│   │   └── Token: ********                                      │
│   ├── POST /mcp/credentials (encrypted storage)                │
│   ├── Click "Test Connection"                                  │
│   ├── Available tools listed                                   │
│   └── Start chat with MCP tools available                      │
│                                                                 │
│   4. CHAT WITH OWN MCP                                         │
│   ├── Select MCP server from dropdown                          │
│   ├── Type: "Create a task in Asana for follow-up"             │
│   ├── Agent uses user's MCP credentials                        │
│   ├── Tool call: mcp_invoke(asana.create_task)                 │
│   └── Task created in user's Asana                             │
│                                                                 │
│   5. TAILORED RESUME REQUEST                                   │
│   ├── Type: "Generate resume for Staff DevOps at Netflix"      │
│   ├── Agent fetches profile (RAG + portfolio API)              │
│   ├── Agent searches Netflix requirements                      │
│   ├── LLM generates tailored resume                            │
│   ├── PDF generated → S3                                       │
│   └── Download link provided                                   │
│                                                                 │
│   6. LEAVE TESTIMONIAL                                         │
│   ├── Type: "I want to leave a recommendation"                 │
│   ├── Agent collects: name, role, company, message             │
│   ├── Validates content (spam check)                           │
│   ├── POST /testimonials (status: pending)                     │
│   ├── Slack notification to admin                              │
│   └── User informed: "Thanks! Pending approval."               │
│                                                                 │
│   7. SIGN OUT                                                  │
│   ├── Click profile → Sign Out                                 │
│   ├── POST /auth/logout                                        │
│   ├── Session invalidated in Redis                             │
│   └── Redirect to homepage                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Session Management

```
Access Token:
├── Stored in httpOnly cookie
├── Expires in 15 minutes
├── Contains: user_id, email, role
└── Validated on every API call

Refresh Token:
├── Stored in httpOnly cookie
├── Expires in 7 days
├── Used to get new access token
└── Rotated on each refresh
```

### MCP Credential Security

```
User enters MCP token
    ↓
Frontend sends to api-gateway
    ↓
api-gateway encrypts with AES-256
    ↓
Encrypted token stored in DB
    ↓
When used: decrypt in memory, never logged
    ↓
Token sent to user's MCP server
```

---

## 3. AI Agent Action Flows

Detailed flows for each action-taking capability.

### 3.1 Schedule Meeting Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   SCHEDULE MEETING FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User: "I'd like to schedule a call with Prajwal"             │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Agent: "I'd love to help set that up!                   │   │
│   │        What's your name and email?"                     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   User: "Sarah Chen, sarah@techcorp.com"                       │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Tool Call] calendar_tool.get_availability()            │   │
│   │ Result: ["Mon 2pm IST", "Tue 10am IST", "Wed 3pm IST"]  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Agent: "Prajwal is available:                           │   │
│   │        1. Monday 2pm IST                                │   │
│   │        2. Tuesday 10am IST                              │   │
│   │        3. Wednesday 3pm IST                             │   │
│   │        Which works for you?"                            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   User: "Tuesday 10am"                                         │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Tool Call] calendar_tool.create_event(                 │   │
│   │   title: "Call with Sarah Chen - TechCorp",             │   │
│   │   time: "Tuesday 10am IST",                             │   │
│   │   attendee: "sarah@techcorp.com",                       │   │
│   │   duration: 30                                          │   │
│   │ )                                                        │   │
│   │ Result: { event_id: "...", meet_link: "..." }           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Tool Call] email_tool.send(                            │   │
│   │   to: "sarah@techcorp.com",                             │   │
│   │   template: "meeting_confirmation",                     │   │
│   │   data: { time, calendar_link, meet_link }              │   │
│   │ )                                                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Tool Call] slack_tool.notify(                          │   │
│   │   channel: "#leads",                                    │   │
│   │   message: "📅 New meeting: Sarah Chen (TechCorp)"      │   │
│   │ )                                                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Tool Call] lead_capture_tool.save(                     │   │
│   │   name: "Sarah Chen",                                   │   │
│   │   email: "sarah@techcorp.com",                          │   │
│   │   company: "TechCorp",                                  │   │
│   │   source: "agent_meeting_booking"                       │   │
│   │ )                                                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Agent: "Done! Sarah, I've sent a calendar invite to     │   │
│   │        sarah@techcorp.com for Tuesday 10am IST.         │   │
│   │        Looking forward to connecting!"                  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Submit Testimonial Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  SUBMIT TESTIMONIAL FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User: "I want to leave a recommendation for Prajwal"         │
│                                                                 │
│   Agent: "That's very kind! I'll help you submit one.          │
│          What's your name?"                                     │
│                                                                 │
│   User: "John Smith"                                           │
│                                                                 │
│   Agent: "Thanks John! What's your current role and company?"  │
│                                                                 │
│   User: "Engineering Manager at CloudScale"                    │
│                                                                 │
│   Agent: "Great! Now, please share your recommendation.        │
│          Take your time - a few sentences work perfectly."     │
│                                                                 │
│   User: "I worked with Prajwal on our Kubernetes migration.    │
│          His deep DevOps expertise and clear communication     │
│          made the project a huge success. Highly recommend!"   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Internal] LLM validates content:                       │   │
│   │ - No spam/abuse: ✓                                      │   │
│   │ - Genuine testimonial: ✓                                │   │
│   │ - Appropriate length: ✓                                 │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Tool Call] POST /testimonials                          │   │
│   │   author_name: "John Smith",                            │   │
│   │   author_role: "Engineering Manager",                   │   │
│   │   author_company: "CloudScale",                         │   │
│   │   content: "I worked with Prajwal...",                  │   │
│   │   status: "pending",                                    │   │
│   │   source: "agent"                                       │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Tool Call] slack_tool.notify(                          │   │
│   │   message: "⭐ New testimonial from John Smith!"        │   │
│   │ )                                                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Agent: "Thank you John! Your testimonial has been           │
│          submitted and will appear on the site once           │
│          reviewed. Really appreciate you taking the time!"    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Hire Me Inquiry Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    HIRE ME INQUIRY FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User: "We have a DevOps project, can Prajwal help?"          │
│                                                                 │
│   Agent: "Absolutely! Let me gather some details.              │
│          First, what's your name and company?"                 │
│                                                                 │
│   User: "Lisa Park from DataFlow Inc"                          │
│                                                                 │
│   Agent: "Hi Lisa! What kind of project is it?                 │
│          (e.g., infrastructure setup, migration, consulting)"  │
│                                                                 │
│   User: "We need to migrate our monolith to Kubernetes"        │
│                                                                 │
│   Agent: "That's right up Prajwal's alley!                     │
│          What's your rough budget range?                       │
│          - Under $10k                                          │
│          - $10k - $50k                                         │
│          - $50k+"                                              │
│                                                                 │
│   User: "$10k - $50k"                                          │
│                                                                 │
│   Agent: "Got it. And what's your timeline?"                   │
│                                                                 │
│   User: "About 3 months"                                       │
│                                                                 │
│   Agent: "Perfect. Last question - your email for follow-up?"  │
│                                                                 │
│   User: "lisa@dataflow.io"                                     │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Tool Call] lead_capture_tool.save(                     │   │
│   │   name: "Lisa Park",                                    │   │
│   │   email: "lisa@dataflow.io",                            │   │
│   │   company: "DataFlow Inc",                              │   │
│   │   project_type: "Kubernetes Migration",                 │   │
│   │   description: "Migrate monolith to Kubernetes",        │   │
│   │   budget: "$10k-50k",                                   │   │
│   │   timeline: "3 months",                                 │   │
│   │   tech_stack: ["Kubernetes", "Docker", "AWS"],          │   │
│   │   source: "agent"                                       │   │
│   │ )                                                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Tool Call] email_tool.send(                            │   │
│   │   to: "lisa@dataflow.io",                               │   │
│   │   template: "inquiry_confirmation"                      │   │
│   │ )                                                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Tool Call] slack_tool.notify(                          │   │
│   │   message: "🚀 New lead: Lisa Park @ DataFlow Inc       │   │
│   │            K8s Migration, $10k-50k, 3 months"           │   │
│   │ )                                                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Agent: "Thanks Lisa! I've captured all the details.          │
│          Prajwal will reach out to lisa@dataflow.io            │
│          within 24 hours. Looking forward to it!"              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Admin Flow

Admin-only functionality for content management.

### Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                       ADMIN JOURNEY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. ADMIN LOGIN                                               │
│   ├── Navigate to /admin/login                                 │
│   ├── WAF checks: Is IP in allowlist?                          │
│   │   ├── No  → 403 (attacker sees nothing)                    │
│   │   └── Yes → Show login form                                │
│   ├── Enter email + password                                   │
│   ├── bcrypt verification                                      │
│   ├── Success → Prompt for TOTP code                           │
│   ├── Enter 6-digit code from authenticator                    │
│   ├── TOTP verified → Admin JWT issued (1hr)                   │
│   └── Redirect to /admin dashboard                             │
│                                                                 │
│   2. ADMIN DASHBOARD                                           │
│   ├── Overview cards:                                          │
│   │   ├── Visitors today: 142                                  │
│   │   ├── Chat sessions: 28                                    │
│   │   ├── New inquiries: 3                                     │
│   │   └── Pending testimonials: 1                              │
│   ├── Quick actions:                                           │
│   │   ├── View inquiries                                       │
│   │   ├── Approve testimonials                                 │
│   │   └── Add new project                                      │
│   └── Live event feed (real-time)                              │
│                                                                 │
│   3. MANAGE PROJECTS                                           │
│   ├── View all projects (grid or table)                        │
│   ├── Filter by: category, published, featured                 │
│   ├── Create new project:                                      │
│   │   ├── Title, slug (auto-generated)                         │
│   │   ├── Short + long description (markdown)                  │
│   │   ├── Category selection                                   │
│   │   ├── Tech stack tags                                      │
│   │   ├── GitHub URL → auto-fetch stars/forks                  │
│   │   ├── Live URL                                             │
│   │   ├── Thumbnail upload → S3                                │
│   │   ├── Gallery images upload                                │
│   │   ├── Featured toggle                                      │
│   │   └── Publish/Draft toggle                                 │
│   ├── Edit existing project                                    │
│   ├── Delete project                                           │
│   ├── Drag to reorder                                          │
│   ├── "Sync GitHub" → refresh all stars/forks                  │
│   └── "Re-embed" → update AI knowledge base                    │
│                                                                 │
│   4. MANAGE CATEGORIES                                         │
│   ├── View all categories                                      │
│   ├── Create: name, slug, icon, color                          │
│   ├── Edit category                                            │
│   ├── Delete (only if no projects assigned)                    │
│   └── Reorder categories                                       │
│                                                                 │
│   5. HANDLE INQUIRIES                                          │
│   ├── View all inquiries (newest first)                        │
│   ├── Filter by status: new, read, replied, closed             │
│   ├── Click to view full details:                              │
│   │   ├── Contact info                                         │
│   │   ├── Project requirements                                 │
│   │   ├── Budget/timeline                                      │
│   │   └── Chat context (if via agent)                          │
│   ├── Update status                                            │
│   ├── Add private notes                                        │
│   └── Export to CSV                                            │
│                                                                 │
│   6. APPROVE TESTIMONIALS                                      │
│   ├── Pending queue                                            │
│   ├── View testimonial content                                 │
│   ├── View source (manual or agent)                            │
│   ├── Edit if needed                                           │
│   ├── Approve → auto-publishes                                 │
│   └── Reject → optionally notify submitter                     │
│                                                                 │
│   7. VIEW ANALYTICS                                            │
│   ├── Visitors over time (chart)                               │
│   ├── Top pages visited                                        │
│   ├── Geographic distribution (world map)                      │
│   ├── Referrer sources                                         │
│   ├── Chat engagement metrics                                  │
│   ├── AI tool usage breakdown                                  │
│   └── Conversion funnel: visitor → chat → inquiry              │
│                                                                 │
│   8. AI/EMBEDDINGS CONTROL                                     │
│   ├── Trigger full re-embed                                    │
│   ├── Trigger selective re-embed                               │
│   ├── View embedding status                                    │
│   ├── View AI usage (tokens today/month)                       │
│   ├── View estimated cost                                      │
│   └── Override rate limits                                     │
│                                                                 │
│   9. SITE SETTINGS                                             │
│   ├── Profile: name, bio, avatar                               │
│   ├── Social links                                             │
│   ├── Availability status ("Open to work")                     │
│   ├── Contact email                                            │
│   └── Feature flags:                                           │
│       ├── Chat enabled/disabled                                │
│       ├── MCP client enabled/disabled                          │
│       ├── Testimonial submissions open/closed                  │
│       └── Maintenance mode                                     │
│                                                                 │
│   10. SESSION TIMEOUT                                          │
│   ├── After 1 hour: JWT expires                                │
│   ├── Redirect to /admin/login                                 │
│   └── No refresh token for admin (security)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Admin Security Layers

```
Layer 1: WAF IP Allowlist
    │     Only allowed IPs can even reach /admin
    ▼
Layer 2: Email + Password
    │     bcrypt hashed password verification
    ▼
Layer 3: TOTP (2FA)
    │     Time-based one-time password required
    ▼
Layer 4: Short-lived JWT
    │     1 hour expiry, no refresh token
    ▼
Layer 5: Role Verification
    │     Every admin API checks role === 'admin'
    ▼
Layer 6: IP Re-verification
          IP checked again on every admin request
```

---

## API Summary by User Type

### Guest APIs

```
GET  /projects
GET  /projects/:slug
GET  /skills
GET  /experience
GET  /testimonials
POST /chat/session          (rate limited)
POST /chat/stream           (rate limited, 5/day)
GET  /chat/rate-limit
POST /inquiries             (rate limited, 3/day)
GET  /resume
POST /analytics/event
```

### User APIs (+ Guest APIs)

```
GET  /user/me
PATCH /user/me
DELETE /user/me
GET  /chat/sessions
GET  /chat/sessions/:id
DELETE /chat/sessions/:id
GET  /mcp/credentials
POST /mcp/credentials
PATCH /mcp/credentials/:id
DELETE /mcp/credentials/:id
POST /mcp/credentials/:id/test
GET  /mcp/credentials/:id/tools
POST /testimonials          (via agent)
```

### Admin APIs (+ All APIs)

```
POST /auth/admin/login
POST /auth/admin/totp
POST /projects
PATCH /projects/:id
DELETE /projects/:id
POST /projects/sync-github
POST /categories
PATCH /categories/:id
DELETE /categories/:id
POST /skills
PATCH /skills/:id
DELETE /skills/:id
POST /experience
PATCH /experience/:id
DELETE /experience/:id
GET  /inquiries
GET  /inquiries/:id
PATCH /inquiries/:id/status
PATCH /testimonials/:id/approve
PATCH /testimonials/:id/reject
DELETE /testimonials/:id
GET  /analytics/summary
GET  /analytics/visitors
GET  /analytics/events
GET  /resume/versions
POST /resume/upload
POST /embeddings/ingest
GET  /embeddings/status
```

---

*Document maintained by: Prajwal Raj*  
*Last reviewed: April 2026*
