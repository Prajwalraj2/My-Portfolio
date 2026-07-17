from openai import AsyncOpenAI
from typing import AsyncGenerator
import time

from src.config import settings
from src.core.prompts import build_system_prompt, FALLBACK_PROMPT
from src.services.context import get_portfolio_context
from src.models.schemas import ChatMessage

client = AsyncOpenAI(api_key=settings.openai_api_key)


async def get_system_prompt() -> str:
    """Get the system prompt with dynamic portfolio context."""
    try:
        context = await get_portfolio_context()
        return build_system_prompt(context)
    except Exception as e:
        print(f"Error fetching context, using fallback: {e}")
        return FALLBACK_PROMPT


async def stream_chat_response(
    messages: list[ChatMessage],
    session_id: str | None = None,
) -> AsyncGenerator[dict, None]:
    """
    Stream chat response from OpenAI.
    
    Fetches portfolio context first, then streams the response.
    
    Yields SSE events:
    - delta: Contains partial content
    - done: Final event with metadata
    """
    start_time = time.time()
    total_tokens = 0
    
    # Fetch dynamic system prompt with portfolio data
    system_prompt = await get_system_prompt()
    
    formatted_messages = [
        {"role": "system", "content": system_prompt},
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
