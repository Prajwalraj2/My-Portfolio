# prajwalraj-mcp (Python)

An [MCP](https://modelcontextprotocol.io) server that exposes **Prajwal Raj's portfolio tools** to any MCP client — Cursor, Claude Desktop, Claude Code. Ask about his projects, skills, experience, and live GitHub stats, check his availability, and **book a call** — all from your editor or assistant.

Built with [FastMCP](https://github.com/jlowin/fastmcp). Runs locally over stdio via `uvx`; talks to Prajwal's API Gateway using your personal API key. (There is also an [npm build](../local-npm-mcp-server) — same tools.)

## Setup

1. **Get an API key** — sign in at [prajwalraj.com/mcp](https://prajwalraj.com/mcp) and create a key (starts with `pk_live_`). The page gives you a ready-to-paste config.
2. **Add the server** to your MCP client config:

```jsonc
{
  "mcpServers": {
    "prajwalraj": {
      "command": "uvx",
      "args": ["prajwalraj-mcp"],
      "env": {
        "PRAJWAL_API_KEY": "pk_live_your_key_here"
      }
    }
  }
}
```

3. Restart the client. The `prajwalraj` server should connect with 8 tools.

## Tools

`get_projects` · `get_skills` · `get_experience` · `get_github` · `get_portfolio` · `get_guides` · `get_meeting_slots` · `book_meeting`

**A valid API key is required for all tools** (no anonymous access).

## Configuration

| Env var | Required | Default | Notes |
|---------|----------|---------|-------|
| `PRAJWAL_API_KEY` | **yes** | — | Your `pk_live_` key from `/mcp` |
| `PRAJWAL_API_BASE` | no | `https://api.prajwalraj.com` | Gateway origin; override for local dev only |

## Local development

```bash
# Run against a locally-running gateway:
PRAJWAL_API_KEY=pk_live_… PRAJWAL_API_BASE=http://localhost:8006 uv run prajwalraj-mcp

# Or inspect with the MCP Inspector:
npx @modelcontextprotocol/inspector uv run prajwalraj-mcp
```

## License

MIT
