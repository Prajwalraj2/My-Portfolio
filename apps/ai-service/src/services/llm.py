from openai import AsyncOpenAI
from typing import AsyncGenerator
import time

from src.config import settings
from src.core.prompts import SYSTEM_PROMPT
from src.models.schemas import ChatMessage

client = AsyncOpenAI(api_key=settings.openai_api_key)


async def stream_chat_response(
    messages: list[ChatMessage],
    session_id: str | None = None,
) -> AsyncGenerator[dict, None]:
    """
    Stream chat response from OpenAI.
    
    Yields SSE events:
    - delta: Contains partial content
    - done: Final event with metadata
    """
    start_time = time.time()
    total_tokens = 0
    
    formatted_messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *[{"role": msg.role, "content": msg.content} for msg in messages],
    ]
    
    try:
        stream = await client.chat.completions.create(
            model=settings.openai_model,
            messages=formatted_messages,
            stream=True,
            stream_options={"include_usage": True},
        )
        
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                yield {
                    "event": "delta",
                    "data": {"content": content},
                }
            
            if chunk.usage:
                total_tokens = chunk.usage.total_tokens
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        yield {
            "event": "done",
            "data": {
                "session_id": session_id,
                "tokens_used": total_tokens,
                "latency_ms": latency_ms,
                "model": settings.openai_model,
            },
        }
        
    except Exception as e:
        yield {
            "event": "error",
            "data": {"error": str(e)},
        }
