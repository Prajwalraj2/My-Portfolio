"""Runs the agent and maps its multi-mode stream to our SSE event contract:
- messages → `delta` (assistant tokens)
- custom   → `progress` (human-readable tool activity, e.g. "Checking availability…")
- final    → `done`
- errors   → `error`
"""
import time
from typing import AsyncGenerator

from src.config import settings
from src.agent.build import get_agent
from src.agent.prompts import build_agent_system_prompt
from src.models.schemas import ChatMessage


def _to_input_messages(messages: list[ChatMessage], system_prompt: str) -> list[dict]:
    out: list[dict] = [{"role": "system", "content": system_prompt}]
    for m in messages:
        out.append({"role": m.role, "content": m.content})
    return out


async def stream_agent_response(
    messages: list[ChatMessage],
    session_id: str | None = None,
    time_zone: str | None = None,
) -> AsyncGenerator[dict, None]:
    start = time.time()
    try:
        agent = get_agent()
        system_prompt = await build_agent_system_prompt(user_timezone=time_zone)
        input_messages = _to_input_messages(messages, system_prompt)

        async for mode, data in agent.astream(
            {"messages": input_messages},
            stream_mode=["messages", "custom"],
        ):
            if mode == "messages":
                msg, _meta = data
                # `messages` mode emits ALL messages (incl. ToolMessages = raw tool output).
                # Only stream the assistant's OWN tokens as text.
                if "AIMessage" not in type(msg).__name__:
                    continue
                content = getattr(msg, "content", "")
                if isinstance(content, str) and content:
                    yield {"event": "delta", "data": {"content": content}}
            elif mode == "custom":
                payload = data if isinstance(data, dict) else {"message": str(data)}
                yield {"event": "progress", "data": payload}

        yield {
            "event": "done",
            "data": {
                "session_id": session_id,
                "latency_ms": int((time.time() - start) * 1000),
                "model": settings.model_string,
            },
        }
    except Exception as e:
        yield {"event": "error", "data": {"error": str(e)}}


async def complete_agent_response(
    messages: list[ChatMessage],
    session_id: str | None = None,
    time_zone: str | None = None,
) -> dict:
    agent = get_agent()
    system_prompt = await build_agent_system_prompt(user_timezone=time_zone)
    input_messages = _to_input_messages(messages, system_prompt)

    result = await agent.ainvoke({"messages": input_messages})
    final = result["messages"][-1]
    content = final.content if isinstance(final.content, str) else str(final.content)
    return {"content": content, "session_id": session_id, "tokens_used": 0}
