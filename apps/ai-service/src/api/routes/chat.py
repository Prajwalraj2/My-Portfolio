from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
import json

from src.models.schemas import ChatRequest
from src.agent.streaming import stream_agent_response, complete_agent_response

router = APIRouter()


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Stream the agent's response via SSE.

    Events: delta (assistant tokens), progress (tool activity), done, error.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")

    async def event_generator():
        try:
            async for event in stream_agent_response(
                messages=request.messages,
                session_id=request.session_id,
                time_zone=request.time_zone,
            ):
                yield {
                    "event": event["event"],
                    "data": json.dumps(event["data"]),
                }
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())


@router.post("/complete")
async def chat_complete(request: ChatRequest):
    """Non-streaming: run the agent to completion and return the final message."""
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")

    return await complete_agent_response(
        messages=request.messages,
        session_id=request.session_id,
        time_zone=request.time_zone,
    )
