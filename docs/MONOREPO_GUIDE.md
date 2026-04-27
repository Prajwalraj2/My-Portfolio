# Monorepo Architecture Guide

This document explains the monorepo architecture used in this portfolio project, how workspaces work, and why we structured the codebase this way.

## Table of Contents

1. [What is a Monorepo?](#what-is-a-monorepo)
2. [Why Use a Monorepo?](#why-use-a-monorepo)
3. [Project Structure Overview](#project-structure-overview)
4. [How pnpm Workspaces Work](#how-pnpm-workspaces-work)
5. [Practical Examples from Our Project](#practical-examples-from-our-project)
6. [Common Operations](#common-operations)

---

## What is a Monorepo?

A **monorepo** (monolithic repository) is a software development strategy where multiple projects are stored in a single repository. Instead of having separate Git repositories for each service or package, everything lives together.

### Traditional Multi-Repo vs Monorepo

**Multi-Repo Approach:**
```
github.com/prajwal/portfolio-frontend    (separate repo)
github.com/prajwal/portfolio-api         (separate repo)
github.com/prajwal/portfolio-ai-service  (separate repo)
github.com/prajwal/portfolio-shared      (separate repo)
```

**Monorepo Approach:**
```
github.com/prajwal/portfolio
├── apps/
│   ├── web/              # Frontend
│   ├── api-gateway/      # Backend API
│   └── ai-service/       # AI Service
├── packages/
│   ├── database/         # Shared database
│   ├── ui/               # Shared UI components
│   └── types/            # Shared TypeScript types
└── package.json          # Root config
```

### Companies Using Monorepos

| Company | Repository | Size |
|---------|------------|------|
| Google | Single repo | 2+ billion lines of code |
| Meta | Single repo | Thousands of projects |
| Microsoft | Windows | 3.5M files |
| Uber | Multiple monorepos | Thousands of services |
| Vercel | Next.js + Turborepo | Open source |

---

## Why Use a Monorepo?

### Benefits

| Benefit | Description |
|---------|-------------|
| **Code Sharing** | Share code between projects without publishing to npm |
| **Atomic Changes** | Change multiple packages in a single commit |
| **Consistent Tooling** | Same linting, testing, and build configs everywhere |
| **Easier Refactoring** | Rename across entire codebase in one PR |
| **Single Source of Truth** | One place for all code, no version mismatches |
| **Simplified Dependencies** | Shared dependencies, no duplication |

### Challenges

| Challenge | Solution in Our Project |
|-----------|------------------------|
| Build times | Turborepo caching |
| Repository size | Git sparse checkout |
| CI/CD complexity | Affected-only builds |
| Learning curve | This documentation |

---

## Project Structure Overview

```
My Portfolioo/
├── apps/                          # Deployable applications
│   ├── api-gateway/               # Fastify REST API
│   ├── web/                       # Next.js frontend (future)
│   ├── ai-service/                # Python AI service (future)
│   ├── contact-service/           # Contact handling (future)
│   └── analytics-service/         # Analytics (future)
│
├── packages/                      # Shared internal packages
│   ├── database/                  # Prisma + PostgreSQL
│   ├── ui/                        # React components (future)
│   ├── types/                     # Shared TypeScript types (future)
│   └── config/                    # Shared configs (future)
│
├── infrastructure/                # Terraform, Kubernetes configs
├── docker/                        # Docker Compose for local dev
├── docs/                          # Documentation
│
├── package.json                   # Root package.json
├── pnpm-workspace.yaml            # Workspace configuration
├── turbo.json                     # Turborepo configuration
└── pnpm-lock.yaml                 # Single lockfile for all packages
```

### apps/ vs packages/

| Directory | Purpose | Deployable? | Examples |
|-----------|---------|-------------|----------|
| `apps/` | Full applications that run independently | Yes | api-gateway, web, ai-service |
| `packages/` | Shared libraries used by apps | No | database, ui, types |

---

## How pnpm Workspaces Work

### The Configuration File

**`pnpm-workspace.yaml`** tells pnpm which folders contain packages:

```yaml
packages:
  - "apps/*"      # All folders inside apps/
  - "packages/*"  # All folders inside packages/
```

This means:
- `apps/api-gateway` is a workspace package
- `apps/web` is a workspace package
- `packages/database` is a workspace package
- etc.

### Package Naming Convention

Each package has a `package.json` with a unique name:

```json
// packages/database/package.json
{
  "name": "@portfolio/database",
  "version": "0.1.0"
}

// apps/api-gateway/package.json
{
  "name": "@portfolio/api-gateway",
  "version": "0.1.0"
}
```

The `@portfolio/` prefix is a **scope** - it groups all our packages together and avoids conflicts with npm packages.

### How Packages Reference Each Other

When `api-gateway` needs to use `database`:

```json
// apps/api-gateway/package.json
{
  "dependencies": {
    "@portfolio/database": "workspace:*"
  }
}
```

The `workspace:*` protocol tells pnpm:
> "Don't download from npm. Link to the local `packages/database` folder."

### What Happens Behind the Scenes

When you run `pnpm install`:

1. pnpm reads `pnpm-workspace.yaml`
2. Finds all workspace packages
3. Creates **symlinks** in `node_modules`:

```
apps/api-gateway/
└── node_modules/
    └── @portfolio/
        └── database → ../../../../packages/database (SYMLINK!)
```

So when you write:
```typescript
import { prisma } from '@portfolio/database';
```

Node.js follows the symlink and actually imports from:
```
packages/database/src/index.ts
```

### Visual Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         MONOREPO ROOT                          │
│                                                                │
│  pnpm-workspace.yaml:                                          │
│    packages:                                                   │
│      - "apps/*"                                                │
│      - "packages/*"                                            │
└────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
        ┌───────────────────┐   ┌───────────────────────────┐
        │ packages/database │   │    apps/api-gateway       │
        │                   │   │                           │
        │ name:             │   │ dependencies:             │
        │ @portfolio/       │◄──│   @portfolio/database:    │
        │   database        │   │     workspace:*           │
        │                   │   │                           │
        │ exports:          │   │ import { prisma }         │
        │   ./src/index.ts  │   │   from '@portfolio/       │
        │                   │   │     database'             │
        └───────────────────┘   └───────────────────────────┘
                │
                │ symlink created by pnpm:
                │
                ▼
        apps/api-gateway/node_modules/@portfolio/database
                        ↓
                (points to packages/database)
```

---

## Practical Examples from Our Project

### Example 1: Database Package Structure

**`packages/database/package.json`:**
```json
{
  "name": "@portfolio/database",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "type": "module",
  "exports": {
    ".": {
      "default": "./src/index.ts"
    }
  },
  "dependencies": {
    "@prisma/client": "^7.8.0",
    "@prisma/adapter-pg": "^7.8.0",
    "pg": "^8.20.0",
    "prisma": "^7.8.0"
  }
}
```

**Key fields explained:**

| Field | Purpose |
|-------|---------|
| `name` | Package identifier (`@portfolio/database`) |
| `main` | Entry point when imported |
| `exports` | Modern entry point configuration |
| `type: "module"` | Use ES modules (import/export) |

**`packages/database/src/index.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Get database URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection pool
const pool = new pg.Pool({ connectionString });

// Create Prisma adapter for the pool
const adapter = new PrismaPg(pool);

// Singleton pattern - reuse same client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create PrismaClient with adapter
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Store in global to prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-export everything for consumers
export { PrismaClient };
export type * from '@prisma/client';
export default prisma;
```

### Example 2: API Gateway Consuming Database

**`apps/api-gateway/package.json`:**
```json
{
  "name": "@portfolio/api-gateway",
  "dependencies": {
    "@portfolio/database": "workspace:*",
    "fastify": "^5.8.5"
  }
}
```

**`apps/api-gateway/src/routes/projects.ts`:**
```typescript
import { FastifyInstance } from 'fastify';
import { prisma } from '@portfolio/database';  // ← Import from workspace package

export async function projectRoutes(app: FastifyInstance) {
  // GET /api/projects - List all projects
  app.get('/', async (request, reply) => {
    // Use prisma directly - it's already configured!
    const projects = await prisma.project.findMany({
      where: { isPublished: true },
      include: { category: true },
    });
    
    return { data: projects };
  });

  // POST /api/projects - Create a project
  app.post('/', async (request, reply) => {
    const body = request.body as any;
    
    const project = await prisma.project.create({
      data: body,
      include: { category: true },
    });
    
    reply.status(201);
    return { data: project };
  });
}
```

### Example 3: Future - Next.js Using Same Database

**`apps/web/app/projects/page.tsx`** (Server Component):
```typescript
import { prisma } from '@portfolio/database';  // Same import!

export default async function ProjectsPage() {
  // Fetch directly from database in Server Component
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    include: { category: true },
  });

  return (
    <div>
      <h1>My Projects</h1>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

**Both `api-gateway` and `web` use the exact same `@portfolio/database` package!**

---

## Common Operations

### Adding a Dependency to a Specific Package

```bash
# Add to root (shared dev dependency)
pnpm add -D typescript -w

# Add to specific workspace
pnpm add fastify --filter @portfolio/api-gateway

# Or navigate and add
cd apps/api-gateway
pnpm add fastify
```

### Adding a Workspace Dependency

```bash
# api-gateway needs database package
cd apps/api-gateway
pnpm add @portfolio/database@workspace:*
```

### Running Scripts in Specific Packages

```bash
# Run dev in api-gateway only
pnpm --filter @portfolio/api-gateway dev

# Run build in all packages
pnpm run build

# Run tests in packages matching pattern
pnpm --filter "@portfolio/*" test
```

### Installing All Dependencies

```bash
# From root - installs everything
pnpm install
```

This creates a single `pnpm-lock.yaml` at the root with all dependencies for all packages.

---

## Summary

| Concept | Our Implementation |
|---------|-------------------|
| Workspace config | `pnpm-workspace.yaml` |
| Package scope | `@portfolio/` |
| Shared database | `packages/database` |
| Apps consuming it | `apps/api-gateway`, `apps/web` |
| Dependency protocol | `workspace:*` |
| Build orchestration | Turborepo (`turbo.json`) |

The key insight is that **workspace packages are just local npm packages**. Instead of publishing to npm, they're symlinked locally. This gives you all the benefits of modularity without the overhead of managing multiple repositories or publishing packages.
