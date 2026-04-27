# API Gateway Setup Documentation

This document explains the `@portfolio/api-gateway` application - how it's structured, how it connects to the database package, and how requests flow through the system.

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [How It Uses @portfolio/database](#how-it-uses-portfoliodatabase)
4. [Request Flow](#request-flow)
5. [Adding New Routes](#adding-new-routes)

---

## Overview

The API Gateway is a **Fastify** application that serves as the main REST API for the portfolio. It:

- Exposes REST endpoints for frontend consumption
- Handles authentication (JWT)
- Applies rate limiting and security headers
- Connects to PostgreSQL via `@portfolio/database`

### Tech Stack

| Technology | Purpose |
|------------|---------|
| Fastify | Web framework (faster than Express) |
| TypeScript | Type safety |
| Zod | Request validation |
| @portfolio/database | Database access |
| @fastify/jwt | JWT authentication |
| @fastify/rate-limit | Rate limiting |
| @fastify/helmet | Security headers |

---

## Project Structure

```
apps/api-gateway/
├── src/
│   ├── config/
│   │   └── env.ts           # Environment validation
│   │
│   ├── routes/
│   │   ├── health.ts        # Health check endpoints
│   │   ├── categories.ts    # Category CRUD
│   │   └── projects.ts      # Project CRUD
│   │
│   ├── app.ts               # Fastify app configuration
│   └── index.ts             # Entry point
│
├── .env                     # Environment variables
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

---

## How It Uses @portfolio/database

### Step 1: Add Workspace Dependency

In `package.json`:

```json
{
  "dependencies": {
    "@portfolio/database": "workspace:*"
  }
}
```

This tells pnpm to link to the local `packages/database` folder.

### Step 2: Set DATABASE_URL

In `.env`:

```env
DATABASE_URL=postgresql://portfolio:portfolio_dev_password@localhost:5431/portfolio
```

This is loaded by `dotenv` when the app starts.

### Step 3: Import and Use

In any route file:

```typescript
// apps/api-gateway/src/routes/projects.ts
import { prisma } from '@portfolio/database';

export async function projectRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    // prisma is ready to use!
    const projects = await prisma.project.findMany();
    return { data: projects };
  });
}
```

### The Import Chain

```
apps/api-gateway/src/routes/projects.ts
│
│  import { prisma } from '@portfolio/database'
│
└──► apps/api-gateway/node_modules/@portfolio/database
     │
     │  (symlink to)
     │
     └──► packages/database/src/index.ts
          │
          │  Creates PrismaClient with adapter
          │  Reads DATABASE_URL from process.env
          │  (which was set by api-gateway's .env)
          │
          └──► Connects to PostgreSQL
```

---

## Request Flow

### Example: GET /api/projects

```
┌─────────────────────────────────────────────────────────────────┐
│ Client (Browser/Postman)                                        │
│ GET http://localhost:8000/api/projects?category=devops          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Fastify Server (index.ts)                                       │
│ - Receives HTTP request                                         │
│ - Logs request                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Plugins (app.ts)                                                │
│ - CORS check                                                    │
│ - Helmet security headers                                       │
│ - Rate limit check                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Route Handler (routes/projects.ts)                              │
│                                                                 │
│ app.get('/', async (request) => {                               │
│   // 1. Validate query params                                   │
│   const query = getProjectsQuerySchema.parse(request.query);    │
│                                                                 │
│   // 2. Query database                                          │
│   const projects = await prisma.project.findMany({              │
│     where: { category: { slug: query.category } },              │
│   });                                                           │
│                                                                 │
│   // 3. Return response                                         │
│   return { data: projects };                                    │
│ });                                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ @portfolio/database                                             │
│ - Executes SQL query via Prisma                                 │
│ - Returns typed results                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PostgreSQL Database                                             │
│ SELECT * FROM projects WHERE category_id = ...                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Response                                                        │
│ {                                                               │
│   "data": [                                                     │
│     { "id": "...", "title": "...", "category": {...} }          │
│   ],                                                            │
│   "pagination": { "total": 5, "limit": 10, "offset": 0 }        │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Adding New Routes

### Step 1: Create Route File

```typescript
// apps/api-gateway/src/routes/skills.ts
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@portfolio/database';

// Validation schemas
const createSkillSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['frontend', 'backend', 'devops', 'ai', 'database']),
  proficiency: z.number().min(1).max(100),
  isFeatured: z.boolean().default(false),
});

export async function skillRoutes(app: FastifyInstance) {
  // GET /api/skills
  app.get('/', async (request, reply) => {
    const skills = await prisma.skill.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    
    return { data: skills };
  });

  // GET /api/skills/featured
  app.get('/featured', async (request, reply) => {
    const skills = await prisma.skill.findMany({
      where: { isFeatured: true },
      orderBy: { displayOrder: 'asc' },
    });
    
    return { data: skills };
  });

  // POST /api/skills
  app.post('/', async (request, reply) => {
    const body = createSkillSchema.parse(request.body);
    
    const skill = await prisma.skill.create({
      data: body,
    });
    
    reply.status(201);
    return { data: skill };
  });
}
```

### Step 2: Register in app.ts

```typescript
// apps/api-gateway/src/app.ts
import { skillRoutes } from './routes/skills.js';

export async function buildApp() {
  const app = Fastify({ ... });

  // ... plugins ...

  // Register routes
  await app.register(healthRoutes);
  await app.register(categoryRoutes, { prefix: '/api/categories' });
  await app.register(projectRoutes, { prefix: '/api/projects' });
  await app.register(skillRoutes, { prefix: '/api/skills' });  // Add this

  return app;
}
```

### Step 3: Test

```bash
# List skills
curl http://localhost:8000/api/skills

# Create skill
curl -X POST http://localhost:8000/api/skills \
  -H "Content-Type: application/json" \
  -d '{"name": "Kubernetes", "category": "devops", "proficiency": 95}'
```

---

## Key Files Explained

### `src/config/env.ts`

Validates environment variables at startup:

```typescript
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();  // Load .env file

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  // ... more
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables');
  process.exit(1);
}

export const env = parsed.data;
```

### `src/app.ts`

Configures Fastify with plugins:

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

export async function buildApp() {
  const app = Fastify({
    logger: { /* pino config */ },
  });

  // Security & CORS
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(helmet);
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  // Routes
  await app.register(projectRoutes, { prefix: '/api/projects' });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode || 500).send({
      error: error.name,
      message: error.message,
    });
  });

  return app;
}
```

### `src/index.ts`

Entry point that starts the server:

```typescript
import { buildApp } from './app.js';
import { env } from './config/env.js';

async function main() {
  const app = await buildApp();

  await app.listen({
    port: env.PORT,
    host: env.HOST,
  });

  console.log(`🚀 Server running at http://${env.HOST}:${env.PORT}`);
}

main().catch(console.error);
```

---

## Summary

The API Gateway:

1. **Imports** `@portfolio/database` as a workspace dependency
2. **Reads** `DATABASE_URL` from its own `.env` file
3. **Uses** the pre-configured `prisma` client in route handlers
4. **Benefits** from shared types and schema

This separation means:
- Database logic is centralized in one package
- API Gateway focuses only on HTTP handling
- Easy to add new services that use the same database
