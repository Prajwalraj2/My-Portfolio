# AI Service

AI-powered chat service for Prajwal's portfolio website.

## Tech Stack

- **Framework:** FastAPI
- **LLM:** OpenAI GPT-4o
- **Streaming:** Server-Sent Events (SSE)
- **Package Manager:** uv

## Setup

### Prerequisites

- Python 3.12+
- uv package manager

### Installation

```bash
# Install dependencies
uv sync

# Or if adding new packages
uv add <package-name>
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `OPENAI_API_KEY` - Your OpenAI API key

### Running

```bash
# Development (with auto-reload)
uv run uvicorn src.main:app --reload --port 8001

# Or using Python directly
uv run python -m src.main
```

## API Endpoints

### Health

- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe

### Chat

- `POST /chat/stream` - Stream chat response (SSE)
- `POST /chat/complete` - Non-streaming chat response

### Example Request

```bash
curl -X POST http://127.0.0.1:8001/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What skills does Prajwal have?"}
    ]
  }'
```

## Project Structure

```
src/
├── main.py           # FastAPI app entry point
├── config.py         # Settings and configuration
├── api/
│   └── routes/
│       ├── health.py # Health check endpoints
│       └── chat.py   # Chat endpoints
├── services/
│   └── llm.py        # OpenAI client
├── models/
│   └── schemas.py    # Pydantic models
└── core/
    └── prompts.py    # System prompts
```

## Future Enhancements

- [ ] RAG pipeline with pgvector
- [ ] LangGraph agent with tools
- [ ] MCP server
- [ ] Chat history persistence
