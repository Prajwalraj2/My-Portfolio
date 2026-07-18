"""Authenticated HTTP client to the API Gateway (single source of truth). The user's
`pk_live_` key is sent as a Bearer token so scoped writes (book_meeting) are authorized.
Mirrors apps/ai-service/src/tools/gateway.py.
"""
from typing import Any

import httpx

from . import config


class GatewayError(Exception):
    def __init__(self, message: str, status: int | None = None):
        super().__init__(message)
        self.status = status


def _headers() -> dict[str, str]:
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if config.API_KEY:
        headers["Authorization"] = f"Bearer {config.API_KEY}"
    return headers


async def _request(
    method: str,
    path: str,
    *,
    params: dict | None = None,
    json: dict | None = None,
    timeout: float,
) -> Any:
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.request(
                method, f"{config.API_BASE}{path}", params=params, json=json, headers=_headers()
            )
    except httpx.HTTPError as exc:
        raise GatewayError(f"Network error reaching the gateway: {exc}") from exc

    if resp.status_code >= 400:
        message = f"Gateway responded {resp.status_code}"
        try:
            body = resp.json()
            if isinstance(body, dict) and body.get("message"):
                message = str(body["message"])
        except Exception:
            pass
        raise GatewayError(message, resp.status_code)

    try:
        return resp.json()
    except Exception:
        return {}


async def gateway_get(path: str, params: dict | None = None) -> Any:
    return await _request("GET", path, params=params, timeout=15.0)


async def gateway_post(path: str, json: dict) -> Any:
    return await _request("POST", path, json=json, timeout=25.0)


def unwrap(res: Any, fallback: Any) -> Any:
    """Pull `.data` out of the gateway's `{ data: ... }` envelope, with a fallback."""
    if isinstance(res, dict) and "data" in res:
        data = res.get("data")
        return fallback if data is None else data
    return fallback
