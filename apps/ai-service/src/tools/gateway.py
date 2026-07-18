"""Authenticated HTTP client to the API Gateway + a streaming progress helper.

Every tool calls the gateway (single source of truth) through here. The service API key is
injected as a Bearer token so writes like book_meeting are authorized.
"""
import httpx

from src.config import settings

try:
    from langgraph.config import get_stream_writer
except Exception:  # pragma: no cover
    get_stream_writer = None  # type: ignore


def _headers() -> dict:
    headers = {"Content-Type": "application/json"}
    if settings.gateway_api_key:
        headers["Authorization"] = f"Bearer {settings.gateway_api_key}"
    return headers


def emit_progress(message: str) -> None:
    """Send a human-readable progress signal to the SSE stream (custom mode).

    No-ops safely when not inside a streaming run (e.g. /chat/complete).
    """
    if get_stream_writer is None:
        return
    try:
        writer = get_stream_writer()
        if writer:
            writer({"type": "progress", "message": message})
    except Exception:
        pass


async def gateway_get(path: str, params: dict | None = None) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{settings.api_gateway_url}{path}", params=params, headers=_headers()
        )
        resp.raise_for_status()
        return resp.json()


async def gateway_post(path: str, json: dict) -> dict:
    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(
            f"{settings.api_gateway_url}{path}", json=json, headers=_headers()
        )
        resp.raise_for_status()
        return resp.json()
