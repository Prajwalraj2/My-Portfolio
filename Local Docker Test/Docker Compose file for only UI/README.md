# Frontend Only - Docker Setup

This runs just the frontend, connecting to **any backend** via the `API_URL` environment variable.

## Quick Start

### Step 1: Create `.env` file

```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:
```
API_URL=https://your-backend-url.com
```

### Step 2: Run Frontend

```bash
docker-compose up -d
```

### Step 3: Access

Open http://localhost:3000

### Step 4: Stop

```bash
docker-compose down
```

## Examples

**Connect to EC2 backend:**
```
API_URL=https://enov8-india.enov8.com/portfolio
```

**Connect to local backend:**
```
API_URL=http://host.docker.internal:8000
```

**Connect to another Docker network:**
```
API_URL=http://api-gateway:8000
```

## How It Works

The frontend uses an **API Proxy Pattern**:
1. Browser calls `/api/proxy/categories`
2. Next.js server reads `API_URL` environment variable
3. Proxies request to `${API_URL}/api/categories`
4. Returns response to browser

**No rebuild needed** - just change the `API_URL` env var!
