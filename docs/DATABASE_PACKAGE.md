# Database Package Documentation

This document explains the `@portfolio/database` package in detail - how it's structured, how Prisma is configured, and how other services consume it.

## Table of Contents

1. [Package Overview](#package-overview)
2. [File Structure](#file-structure)
3. [Configuration Files Explained](#configuration-files-explained)
4. [How It Connects to PostgreSQL](#how-it-connects-to-postgresql)
5. [Consuming the Package](#consuming-the-package)
6. [Prisma 7 Specific Changes](#prisma-7-specific-changes)

---

## Package Overview

The `@portfolio/database` package serves as the **single source of truth** for:
- Database schema (Prisma models)
- Database connection (PrismaClient)
- TypeScript types for all database entities

### Why a Separate Package?

**Without separate package (traditional approach):**
```
apps/api-gateway/
├── prisma/
│   └── schema.prisma      # Schema defined here
├── src/
│   ├── db.ts              # PrismaClient here
│   └── routes/
└── package.json           # Prisma deps here

apps/web/
├── prisma/
│   └── schema.prisma      # DUPLICATE schema!
├── src/
│   └── db.ts              # DUPLICATE client!
└── package.json           # DUPLICATE deps!
```

**With separate package (our approach):**
```
packages/database/
├── prisma/
│   └── schema.prisma      # Single schema
├── src/
│   └── index.ts           # Single client export
└── package.json           # Single set of deps

apps/api-gateway/
└── uses @portfolio/database ✓

apps/web/
└── uses @portfolio/database ✓

apps/contact-service/
└── uses @portfolio/database ✓
```

**Benefits:**
- Schema changes apply everywhere automatically
- Types are consistent across all services
- No dependency version mismatches
- Single place to configure connection

---

## File Structure

```
packages/database/
├── prisma/
│   ├── schema.prisma      # Database models definition
│   └── seed.ts            # Seed script (optional)
│
├── src/
│   └── index.ts           # Main entry - exports prisma client
│
├── .env                   # DATABASE_URL (local dev)
├── .gitignore             # Ignore .env, generated/
├── package.json           # Package configuration
├── prisma.config.ts       # Prisma 7 configuration
└── tsconfig.json          # TypeScript configuration
```

---

## Configuration Files Explained

### 1. `package.json`

```json
{
  "name": "@portfolio/database",
  "version": "0.1.0",
  "description": "Database schema and client for portfolio",
  "main": "./src/index.ts",
  "type": "module",
  "exports": {
    ".": {
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^7.8.0",
    "@prisma/adapter-pg": "^7.8.0",
    "pg": "^8.20.0",
    "prisma": "^7.8.0",
    "dotenv": "^17.4.2"
  },
  "devDependencies": {
    "@types/node": "^25.6.0",
    "@types/pg": "^8.20.0",
    "tsx": "^4.21.0",
    "typescript": "^6.0.3"
  }
}
```

**Key points:**

| Field | Value | Explanation |
|-------|-------|-------------|
| `name` | `@portfolio/database` | Scoped package name for workspace |
| `main` | `./src/index.ts` | Entry point (source, not compiled) |
| `type` | `module` | Use ES modules |
| `exports` | Points to source | Allows direct TS import in dev |

**Dependencies explained:**

| Package | Purpose |
|---------|---------|
| `@prisma/client` | Generated Prisma client |
| `@prisma/adapter-pg` | PostgreSQL adapter for Prisma 7 |
| `pg` | Node.js PostgreSQL driver |
| `prisma` | Prisma CLI (schema, migrations) |
| `dotenv` | Load `.env` files |

### 2. `prisma.config.ts`

Prisma 7 introduced a new configuration file:

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

This file:
- Loads environment variables from `.env`
- Tells Prisma where to find the schema
- Configures the database URL

### 3. `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// User & Auth Tables
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  provider      String?   // 'google', 'github'
  role          String    @default("user")
  createdAt     DateTime  @default(now()) @map("created_at")
  
  sessions      Session[]
  chatSessions  ChatSession[]
  
  @@map("users")  // Table name in database
}

model Category {
  id            String    @id @default(uuid())
  name          String
  slug          String    @unique
  
  projects      Project[]
  
  @@map("categories")
}

model Project {
  id              String    @id @default(uuid())
  slug            String    @unique
  title           String
  description     String?
  techStack       String[]  @map("tech_stack")
  categoryId      String    @map("category_id")
  isFeatured      Boolean   @default(false)
  isPublished     Boolean   @default(true)
  
  category        Category  @relation(fields: [categoryId], references: [id])
  
  @@map("projects")
}

// ... more models
```

**Key Prisma concepts:**

| Concept | Example | Purpose |
|---------|---------|---------|
| `@id` | `id String @id` | Primary key |
| `@unique` | `email String @unique` | Unique constraint |
| `@default` | `@default(uuid())` | Auto-generate value |
| `@map` | `@map("created_at")` | Column name in DB |
| `@@map` | `@@map("users")` | Table name in DB |
| `@relation` | `category Category @relation(...)` | Foreign key |

### 4. `src/index.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// 1. Get database URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// 2. Create PostgreSQL connection pool
// Pool manages multiple connections efficiently
const pool = new pg.Pool({ connectionString });

// 3. Create Prisma adapter
// Prisma 7 requires an adapter for database connections
const adapter = new PrismaPg(pool);

// 4. Singleton pattern for PrismaClient
// In development, hot reloading would create multiple clients
// This ensures we reuse the same instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 5. Create or reuse PrismaClient
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,  // Pass the PostgreSQL adapter
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']  // Verbose in dev
    : ['error'],                   // Only errors in prod
});

// 6. Store in global for reuse (development only)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 7. Export for consumers
export { PrismaClient };
export type * from '@prisma/client';  // Re-export all types
export default prisma;
```

### 5. `.env`

```env
DATABASE_URL="postgresql://portfolio:portfolio_dev_password@localhost:5431/portfolio"
```

Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

---

## How It Connects to PostgreSQL

### Connection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    apps/api-gateway                             │
│                                                                 │
│  import { prisma } from '@portfolio/database'                   │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   packages/database                             │
│                                                                 │
│  src/index.ts                                                   │
│    │                                                            │
│    ├─► Reads DATABASE_URL from environment                      │
│    │                                                            │
│    ├─► Creates pg.Pool (connection pool)                        │
│    │                                                            │
│    ├─► Creates PrismaPg adapter                                 │
│    │                                                            │
│    └─► Creates PrismaClient with adapter                        │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                           │
│                   (Docker: localhost:5431)                      │
│                                                                 │
│  Tables:                                                        │
│    - users                                                      │
│    - categories                                                 │
│    - projects                                                   │
│    - skills                                                     │
│    - experience                                                 │
│    - ... etc                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Variable Flow

The `DATABASE_URL` flows like this:

```
1. apps/api-gateway/.env
   └─► DATABASE_URL="postgresql://..."

2. api-gateway starts with: tsx watch src/index.ts
   └─► dotenv loads .env into process.env

3. api-gateway imports @portfolio/database
   └─► packages/database/src/index.ts runs

4. index.ts reads: process.env.DATABASE_URL
   └─► Creates connection to PostgreSQL
```

**Important:** The `.env` file is in `apps/api-gateway/`, not `packages/database/`. The database package reads from `process.env`, which is set by the app that imports it.

---

## Consuming the Package

### In API Gateway

```typescript
// apps/api-gateway/src/routes/categories.ts
import { prisma } from '@portfolio/database';

export async function categoryRoutes(app: FastifyInstance) {
  // List all categories
  app.get('/', async () => {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { projects: true } },
      },
    });
    return { data: categories };
  });

  // Create a category
  app.post('/', async (request) => {
    const body = request.body as { name: string; slug: string };
    
    const category = await prisma.category.create({
      data: body,
    });
    
    return { data: category };
  });
}
```

### In Next.js (Future)

```typescript
// apps/web/app/api/projects/route.ts
import { prisma } from '@portfolio/database';
import { NextResponse } from 'next/server';

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
  });
  
  return NextResponse.json({ data: projects });
}
```

### Type Safety

Because we export types, consumers get full IntelliSense:

```typescript
import { prisma, type Project, type Category } from '@portfolio/database';

async function getProjectWithCategory(slug: string): Promise<Project & { category: Category }> {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { category: true },
  });
  
  return project!;
}
```

---

## Prisma 7 Specific Changes

Prisma 7 introduced breaking changes that affect how we configure the client:

### What Changed

| Aspect | Prisma 6 and Earlier | Prisma 7 |
|--------|---------------------|----------|
| Config file | None | `prisma.config.ts` |
| Database URL | In `schema.prisma` | In `prisma.config.ts` |
| Connection | Direct | Requires adapter |
| Engine | Binary engine | Client engine |

### Why We Need Adapters

In Prisma 7, the "client" engine type requires an adapter:

```typescript
// OLD (Prisma 6) - Direct connection
const prisma = new PrismaClient();

// NEW (Prisma 7) - Requires adapter
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
```

### schema.prisma Changes

```prisma
// OLD (Prisma 6)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // URL was here
}

// NEW (Prisma 7)
datasource db {
  provider = "postgresql"
  // URL moved to prisma.config.ts
}
```

---

## Quick Reference

### Common Commands

```bash
# Generate Prisma Client after schema changes
cd packages/database
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name migration_name

# Open Prisma Studio (GUI)
npx prisma studio

# Format schema file
npx prisma format
```

### Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot find module '@portfolio/database'` | Not installed | Run `pnpm add @portfolio/database@workspace:*` |
| `DATABASE_URL not set` | Missing env var | Add to `.env` in consuming app |
| `Cannot find module 'dist/index.js'` | Package not built | Change exports to `src/index.ts` |
| `adapter required` | Prisma 7 change | Add `@prisma/adapter-pg` and configure |

---

## Summary

The `@portfolio/database` package encapsulates all database concerns:

1. **Schema** - Single source of truth in `prisma/schema.prisma`
2. **Client** - Pre-configured PrismaClient in `src/index.ts`
3. **Types** - Automatically generated and exported
4. **Configuration** - Prisma 7 setup with adapters

Any service in the monorepo can import and use it with a single line:

```typescript
import { prisma } from '@portfolio/database';
```

No duplicate schemas, no configuration headaches, no type mismatches.
