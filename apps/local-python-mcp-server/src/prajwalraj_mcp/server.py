"""prajwalraj-mcp — a stdio MCP server (FastMCP) exposing Prajwal Raj's portfolio tools.

Every tool requires a `pk_live_` API key (PRAJWAL_API_KEY): no anonymous access, so all MCP
traffic is attributed and per-key rate-limited, and every advertised capability works once a
key is set. Mirrors the npm package (apps/local-npm-mcp-server).
"""
import json
import sys
from datetime import datetime, timedelta, timezone
from typing import Any

from fastmcp import FastMCP
from fastmcp.exceptions import ToolError

from . import config, format as fmt
from .gateway import GatewayError, gateway_get, gateway_post, unwrap

mcp = FastMCP("prajwalraj-mcp")

MISSING_KEY = (
    "This server needs a free API key to work. Create one at https://prajwalraj.com/mcp, "
    "then add it to your MCP config as PRAJWAL_API_KEY and restart your client."
)
DEFAULT_TZ = "Asia/Kolkata"


def _require_key() -> None:
    if not config.has_api_key():
        raise ToolError(MISSING_KEY)


def _as_tool_error(exc: GatewayError) -> ToolError:
    if exc.status in (401, 403):
        return ToolError(
            f"Authorization failed ({exc.status}). Check that PRAJWAL_API_KEY is a valid key "
            "with the required scope — create or inspect one at https://prajwalraj.com/mcp."
        )
    return ToolError(f"Gateway error: {exc}")


async def _get(path: str, params: dict | None = None) -> Any:
    _require_key()
    try:
        return await gateway_get(path, params)
    except GatewayError as exc:
        raise _as_tool_error(exc) from exc


async def _post(path: str, body: dict) -> Any:
    _require_key()
    try:
        return await gateway_post(path, body)
    except GatewayError as exc:
        raise _as_tool_error(exc) from exc


# ---------- content (read) tools ----------

@mcp.tool
async def get_projects(category: str | None = None) -> str:
    """Get Prajwal's portfolio projects. Optionally filter by a category slug (e.g. 'devops').
    Use when the user asks about his projects, work, or what he has built."""
    params = {"category": category} if category else None
    return fmt.format_projects(unwrap(await _get("/api/projects", params), []))


@mcp.tool
async def get_skills() -> str:
    """Get Prajwal's technical skills grouped by category (frontend, backend, devops, ai, …)."""
    return fmt.format_skills(unwrap(await _get("/api/skills/grouped"), {}))


@mcp.tool
async def get_experience() -> str:
    """Get Prajwal's work experience (companies, roles, dates, tech stack)."""
    return fmt.format_experience(unwrap(await _get("/api/experience"), []))


@mcp.tool
async def get_github() -> str:
    """Get Prajwal's live GitHub stats: profile, top repositories, languages, and total stars.
    Use when asked about his open-source work, repos, or GitHub activity."""
    return fmt.format_github(unwrap(await _get("/api/github"), {}))


@mcp.tool
async def get_portfolio() -> str:
    """Get a full portfolio snapshot (profile/bio, featured projects, top skills, experience,
    resume). Good for a general 'tell me about Prajwal' overview."""
    return json.dumps(unwrap(await _get("/api/portfolio"), {}), default=str)[:4000]


@mcp.tool
async def get_guides() -> str:
    """List Prajwal's how-to guides (e.g. how to use his MCP server)."""
    return fmt.format_guides(unwrap(await _get("/api/guides"), []))


# ---------- meeting tools ----------

@mcp.tool
async def get_meeting_slots(time_zone: str = "", days_ahead: int = 14) -> str:
    """Get Prajwal's available meeting slots for the next `days_ahead` days (default 14), shown
    in the given IANA `time_zone` (e.g. 'Asia/Kolkata', 'America/New_York'). Call this the moment
    a user wants to meet, then present the returned times as options to pick from."""
    tz = time_zone or DEFAULT_TZ
    now = datetime.now(timezone.utc)
    params = {
        "startTime": now.isoformat(),
        "endTime": (now + timedelta(days=days_ahead)).isoformat(),
        "timeZone": tz,
    }
    return fmt.format_slots(unwrap(await _get("/api/meetings/slots", params), {}), tz, days_ahead)


@mcp.tool
async def book_meeting(start: str, name: str, email: str, time_zone: str, topic: str = "") -> str:
    """Book a meeting with Prajwal at a specific available slot. ONLY call after
    get_meeting_slots returned real slots, the user chose an exact time, and gave their name +
    email. `start` must be an ISO 8601 slot returned by get_meeting_slots."""
    res = await _post(
        "/api/meetings",
        {"start": start, "name": name, "email": email, "timeZone": time_zone, "topic": topic},
    )
    m = unwrap(res, {})
    start_time = m.get("startTime", start) if isinstance(m, dict) else start
    return (
        f"Meeting booked for {start_time}. A confirmation email with the joining link "
        f"was sent to {email}."
    )


def main() -> None:
    # stdout is the JSON-RPC channel — all diagnostics MUST go to stderr.
    print(
        f"[prajwalraj-mcp] gateway={config.API_BASE} · "
        f"apiKey={'set' if config.has_api_key() else 'MISSING'}",
        file=sys.stderr,
    )
    if not config.has_api_key():
        print(
            "[prajwalraj-mcp] ⚠ No PRAJWAL_API_KEY set — tools will not run. "
            "Create a free key at https://prajwalraj.com/mcp and add it to your MCP config.",
            file=sys.stderr,
        )
    mcp.run()


if __name__ == "__main__":
    main()
