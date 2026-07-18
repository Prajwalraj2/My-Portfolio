"""Runtime configuration read from the environment the MCP client spawns us with.

PRAJWAL_API_KEY  — a `pk_live_` key from https://prajwalraj.com/mcp (required for all tools).
PRAJWAL_API_BASE — the gateway origin. Defaults to production; override for local dev only.
"""
import os

DEFAULT_API_BASE = "https://api.prajwalraj.com"

API_BASE = os.environ.get("PRAJWAL_API_BASE", DEFAULT_API_BASE).rstrip("/")
API_KEY = (os.environ.get("PRAJWAL_API_KEY") or "").strip() or None


def has_api_key() -> bool:
    return API_KEY is not None
