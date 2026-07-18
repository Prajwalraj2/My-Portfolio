# prajwalraj-mcp

An [MCP](https://modelcontextprotocol.io) server that exposes **Prajwal Raj's portfolio tools** to any MCP client — Cursor, Claude Desktop, Claude Code. Ask about his projects, skills, experience, and live GitHub stats, check his availability, and **book a call** — all from your editor or assistant.

Runs locally over stdio via `npx`; talks to Prajwal's API Gateway using your personal API key.

## Setup

1. **Get an API key** — sign in at [prajwalraj.com/mcp](https://prajwalraj.com/mcp) and create a key (it starts with `pk_live_`). Default keys can read everything and book meetings.
2. **Add the server** to your MCP client config:

```jsonc
{
  "mcpServers": {
    "prajwalraj": {
      "command": "npx",
      "args": ["-y", "prajwalraj-mcp"],
      "env": {
        "PRAJWAL_API_KEY": "pk_live_your_key_here"
      }
    }
  }
}
```

- **Claude Desktop:** `claude_desktop_config.json` (Settings → Developer → Edit Config).
- **Cursor:** `.cursor/mcp.json` (project) or the global MCP settings.
- **Claude Code:** `claude mcp add` or your `.mcp.json`.

3. Restart the client. You should see the `prajwalraj` server connect with 8 tools.

## Tools

| Tool | What it does |
|------|--------------|
| `get_projects` | Portfolio projects (optionally filter by category slug) |
| `get_skills` | Technical skills grouped by category |
| `get_experience` | Work history (companies, roles, dates, tech) |
| `get_github` | Live GitHub stats — repos, stars, languages |
| `get_portfolio` | Full portfolio snapshot (bio, featured work, skills, experience) |
| `get_guides` | How-to guides |
| `get_meeting_slots` | Available meeting slots (IANA timezone, N days ahead) |
| `book_meeting` | Book a call at a returned slot (needs `meetings:write` scope) |

**A valid API key is required for all tools.** Create a free one at
[prajwalraj.com/mcp](https://prajwalraj.com/mcp) — it takes a few seconds and the page gives you
a ready-to-paste config with the key already filled in.

## Configuration

| Env var | Required | Default | Notes |
|---------|----------|---------|-------|
| `PRAJWAL_API_KEY` | **yes** | — | Your `pk_live_` key from `/mcp`. Without it, tools return a "create a key" message. |
| `PRAJWAL_API_BASE` | no | `https://api.prajwalraj.com` | Gateway origin; override for local dev only |

## Local development

```bash
npm install
npm run build        # bundles to dist/index.js
npm run typecheck    # tsc --noEmit

# Run against a locally-running gateway with the MCP Inspector:
PRAJWAL_API_KEY=pk_live_… PRAJWAL_API_BASE=http://localhost:8000 \
  npx @modelcontextprotocol/inspector node dist/index.js
```

## License

MIT
