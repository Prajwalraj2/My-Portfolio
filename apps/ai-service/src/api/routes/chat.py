from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
import json

from src.models.schemas import ChatRequest, ChatMessage
from src.services.llm import stream_chat_response

router = APIRouter()


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    Stream chat responses using Server-Sent Events (SSE).
    
    The response streams token-by-token for a typing effect.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")
    
    async def event_generator():
        try:
            async for event in stream_chat_response(
                messages=request.messages,
                session_id=request.session_id,
            ):
                yield {
                    "event": event["event"],
                    "data": json.dumps(event["data"]),
                }
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}),
            }
    
    return EventSourceResponse(event_generator())


@router.post("/complete")
async def chat_complete(request: ChatRequest):
    """
    Non-streaming chat endpoint (returns complete response).
    Useful for testing or when streaming isn't needed.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")
    
    full_content = ""
    tokens_used = 0
    
    async for event in stream_chat_response(
        messages=request.messages,
        session_id=request.session_id,
    ):
        if event["event"] == "delta":
            full_content += event["data"].get("content", "")
        elif event["event"] == "done":
            tokens_used = event["data"].get("tokens_used", 0)
    
    return {
        "content": full_content,
        "session_id": request.session_id,
        "tokens_used": tokens_used,
    }
