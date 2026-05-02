# Portfolio - Docker Deployment

Run the full portfolio stack with Docker Compose.

## Prerequisites

- Docker Desktop installed
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Clone and Setup Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values
# - DATABASE_URL: Your PostgreSQL connection string (Neon, Supabase, etc.)
# - JWT_SECRET: A secret key (min 32 characters)
# - OPENAI_API_KEY: Your OpenAI API key
```

### 2. Start the Stack

```bash
docker-compose up -d
```

### 3. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8000 |
| AI Service | http://localhost:8001 |

### 4. Check Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api-gateway
docker-compose logs -f ai-service
docker-compose logs -f web
```

### 5. Stop the Stack

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Troubleshooting

### Services not starting?

Check logs:
```bash
docker-compose logs api-gateway
docker-compose logs ai-service
docker-compose logs web
```

### Database connection issues?

Verify your `DATABASE_URL` in `.env` is correct and the database is accessible.

### AI chat not working?

Verify your `OPENAI_API_KEY` in `.env` is valid.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose                          │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │    web      │    │ api-gateway │    │ ai-service  │     │
│  │  (Next.js)  │───►│  (Fastify)  │───►│  (FastAPI)  │     │
│  │  :3000      │    │  :8000      │    │  :8001      │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                            │                               │
│                            ▼                               │
│                     ┌─────────────┐                        │
│                     │  External   │                        │
│                     │ PostgreSQL  │                        │
│                     │  (Neon DB)  │                        │
│                     └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Images

| Service | Image |
|---------|-------|
| API Gateway | `prajwal270/portfolio-api-gateway:v1` |
| AI Service | `prajwal270/portfolio-ai-service:v1` |
| Web Frontend | `prajwal270/portfolio-web:v1` |
